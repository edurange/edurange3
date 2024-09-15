import json
import os
import random
import shutil
import string
import subprocess
import yaml
import redis
import pickle
import time
import datetime
import math
import pyopencl as cl
import asyncio
import csv
import llama_cpp
from llama_cpp import Llama
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding


from datetime import datetime
from celery import Celery
from celery import shared_task
from celery.utils.log import get_task_logger
from flask import current_app, flash, jsonify
from py_flask.utils.terraform_utils import adjust_network, find_and_copy_template, write_resource
from py_flask.config.settings import CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from py_flask.utils.scenario_utils import claimOctet
from py_flask.utils.ml_utils import generate_hint, load_language_model_from_redis, load_generate_hint_task_id_from_redis, get_available_cpu_and_gpu_resources_from_redis, export_hint_to_csv
from py_flask.utils.instructor_utils import getLogs, getNumOfRecentLogsForHint


logger = get_task_logger(__name__)
path_to_directory = os.path.dirname(os.path.abspath(__file__))

def get_path(file_name):
    mail_path = os.path.normpath(
        os.path.join(path_to_directory, "templates/utils", file_name)
    )
    return mail_path

celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

class ContextTask(celery.Task):
    ''' This allows tasks to assume the create_app() context, and access the database '''
    abstract = True

    def __call__(self, *args, **kwargs):
        from py_flask.config.init import create_app

        with create_app().app_context():
            return super(ContextTask, self).__call__(*args, **kwargs)

celery.Task = ContextTask


@celery.task(bind=True)
def create_scenario_task(self, scen_name, scen_type, students_list, grp_id, scen_id):
    ''' self is the task instance, other arguments are the results of database queries '''
    from py_flask.database.models import ScenarioGroups, Scenarios
    from py_flask.utils.scenario_utils import gather_files

    app = current_app
    scen_type = scen_type.lower()
    grp_id = grp_id["id"]

    c_names, g_files, s_files, u_files, packages, ip_addrs = gather_files(scen_type, logger)

    logger.info ('values returned from gatherFiles:', c_names, g_files, s_files, u_files, packages, ip_addrs)

    logger.info(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    students = {}
    usernames, passwords = [], []

    for i in range(len(students_list)):
        username = "".join(e for e in students_list[i]["username"] if e.isalnum())
        password = "".join(
            random.choice(string.ascii_letters + string.digits) for _ in range(6)
        )

        usernames.append(username)
        passwords.append(password)

        logger.info(f'User: {students_list[i]["username"]}')
        students[username] = []
        students[username].append({"username": username, "password": password})


    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scen_id).first()
        scen_name = "".join(e for e in scen_name if e.isalnum())

        os.makedirs("./scenarios/tmp/" + scen_name)
        os.chdir("./scenarios/tmp/" + scen_name)

        os.makedirs("./student_view")

        with open("students.json", "w") as outfile:
            json.dump(students, outfile)

        with open(f"../../../scenarios/prod/{scen_type}/guide_content.yml", "r+")as f:
            content = yaml.safe_load(f)
            content_items = content['contentDefinitions']
            logger.info(f"Content Type: {type(content)}")

        flags = []
        for content_num, item_name in enumerate(content_items):
            if content_items[item_name]["type"] == "question":
                q_num = content_items[item_name]["question_num"]
                if content_items[item_name]["answers"][0]["value"] == '$RANDOM':
                    rnd_ans = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
                    content["contentDefinitions"]["Question" + str(q_num)]["answers"][0]["value"] = rnd_ans
                    flags.append(rnd_ans)

        with open("guide_content.yml", "w") as outfile:
            yaml.dump(content, outfile, indent=4)   
        
        lowest_avail_octet = claimOctet()

        # Write provider and networks
        find_and_copy_template(scen_type, "network")
        adjust_network(str(lowest_avail_octet), scen_name)
        os.system("terraform init")
        os.system("terraform plan -out network")

        logger.info("All flags: {}".format(flags))

        # Each container and their names are pulled from the 'scen_type'.json file
        for i, c in enumerate(c_names):
            find_and_copy_template(scen_type, c)
            write_resource(
                str(lowest_avail_octet), scen_name, scen_type, i, usernames, passwords,
                s_files[i], g_files[i], u_files[i], flags, c_names
            )

        scenario.update(
            status=0,
            octet=lowest_avail_octet
        )
        os.chdir("../../..")

        ScenarioGroups.create(group_id=grp_id, scenario_id=scen_id)

        return {
            "result": "success", 
            "new_status": 0,
            "scenario_id": scen_id
        }


@celery.task(bind=True)
def start_scenario_task(self, scenario_id):
    from py_flask.database.models import Scenarios
    from py_flask.utils.instructor_utils import NotifyCapture

    app = current_app
    logger.info(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        logger.info("Found Scenario: {}".format(scenario))
        name = str(scenario.name)
        name = "".join(e for e in name if e.isalnum())
        gateway = name + "_gateway"
        start = name + "_nat"
        start_ip = "10." + str(scenario.octet) + ".0.2"
        if int(scenario.status) != 0:
            logger.info("Invalid Status")
            NotifyCapture("Failed to start scenario " + name + ": Invalid Status")
            return {
                "result": "failure",
                "new_status": 5,
                "scenario_id": scenario_id,
                "message": "Scenario must be stopped before starting"
                }
        elif os.path.isdir(os.path.join("./scenarios/tmp/", name)):
            scenario.update(status=3)
            logger.info("Folder Found")
            os.chdir("./scenarios/tmp/" + name)
            os.system("terraform apply network")
            os.system("terraform apply --auto-approve")
            os.system("../../../shell_scripts/scenario_movekeys.sh {} {} {}".format(gateway, start, start_ip))
            os.chdir("../../..")
            scenario.update(status=1)
            NotifyCapture("Scenario " + name + " has started successfully.")
            return {
                "result": "success", 
                "new_status": 1,
                "scenario_id": scenario_id
                }
        else:
            logger.info("Scenario folder could not be found -- " + os.path.join("./scenarios/tmp/", name))
            NotifyCapture("Failed to start scenario " + name + ": Scenario folder could not be found. -- " + os.path.join("./scenarios/tmp/", name))
            return {
                "result": "failure",
                "new_status": 5,
                "scenario_id": scenario_id
                }

@celery.task(bind=True)
def stop_scenario_task(self, scenario_id):
    from py_flask.database.models import Scenarios
    from py_flask.utils.instructor_utils import NotifyCapture

    app = current_app
    logger.info(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        logger.info("Found Scenario: {}".format(scenario))
        name = str(scenario.name)
        name = "".join(e for e in name if e.isalnum())
        if int(scenario.status) != 1:
            logger.info("Invalid Status")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Scenario is not ready to start", "warning")
        elif os.path.isdir(os.path.join("./scenarios/tmp/", name)):
            logger.info("Folder Found")
            scenario.update(status=4)
            os.chdir("./scenarios/tmp/" + name)
            os.system("terraform destroy --auto-approve")
            os.chdir("../../..")
            scenario.update(status=0)
            NotifyCapture("Scenario " + name + " has successfully stopped.")
            return {
                "result": "success", 
                "new_status": 0,
                "scenario_id": scenario_id
                }
        else:
            logger.info("Something went wrong")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            return {
                "result": "failure",
                "new_status": 5,
                "scenario_id": scenario_id
                }

@celery.task(bind=True)
def update_scenario_task(self, scenario_id):
    from py_flask.database.models import Scenarios
    from py_flask.utils.instructor_utils import NotifyCapture

    app = current_app
    logger.info(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        logger.info("Found Scenario: {}".format(scenario))
        name = str(scenario.name)
        name = "".join(e for e in name if e.isalnum())
        if int(scenario.status) != 1:
            logger.info("Invalid Status")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Scenario is not ready to start", "warning")
        elif os.path.isdir(os.path.join("./scenarios/tmp/", name)):
            logger.info("Folder Found")
            scenario.update(status=4)
            os.chdir("./scenarios/tmp/" + name)
            os.system("terraform destroy --auto-approve")
            os.chdir("../../..") 
            scenario.update(status=0)
            NotifyCapture("Scenario " + name + " has successfully stopped.")
        else:
            logger.info("Something went wrong")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Something went wrong", "warning")

@celery.task(bind=True)
def destroy_scenario_task(self, scenario_id):
    from py_flask.database.models import Scenarios, ScenarioGroups, Responses
    from py_flask.utils.instructor_utils import NotifyCapture

    app = current_app
    logger.info(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    scenario = Scenarios.query.filter_by(id=scenario_id).first()


    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        if scenario is not None:
            logger.info("Found Scenario: {}".format(scenario))
            name = str(scenario.name)
            name = "".join(e for e in name if e.isalnum())
            s_id = str(scenario.id)
            s_group = ScenarioGroups.query.filter_by(scenario_id=s_id).first()
            if int(scenario.status) != 0:
                logger.info("Invalid Status")
                NotifyCapture("Failed to delete scenario" + name + ": Invalid Status")
                raise Exception(f"Scenario in an Invalid state for Destruction")
            s_responses = Responses.query.filter_by(scenario_id=s_id).all()
            for r in s_responses:
                r.delete()
            if os.path.isdir(os.path.join("./scenarios/tmp/", name)):
                logger.info("Folder Found, current directory: {}".format(os.getcwd()))
                os.chdir("./scenarios/tmp/")
                shutil.rmtree(name)
                os.chdir("../..")
                if s_group:
                    s_group.delete()

                scenario.delete()
                NotifyCapture("The Scenario " + name + " is successfully deleted.")
                return {
                    "result": "success", 
                    "new_status": 0,
                    "scenario_id": scenario_id,
                    }
            else:
                logger.info("Scenario files not found, assuming broken scenario and deleting")
                NotifyCapture("Failed to delete scenario " + name + ": Scenario files could not be found.")
                scenario.delete()
                return {
                    "result": "failure",
                    "new_status": 5,
                    "scenario_id": scenario_id
                }
        else:
            NotifyCapture("Failed to delete scenario " + name + ": Scenario could not be found.")
            return {
                "result": "failure",
                "new_status": 5,
                "scenario_id": scenario_id
                }

@celery.task(bind=True)
def scenarioCollectLogs(self, arg):
    from py_flask.utils.csv_utils import readCSV
    from py_flask.config.extensions import db
    from py_flask.database.models import Scenarios, BashHistory, Users
    from py_flask.utils.instructor_utils import NotifyCapture
    
    with open('./logs/archive_id.txt', 'r') as log_id_file:
        this_archive_id = log_id_file.read().rstrip()

    def get_or_create(session, model, **kwargs):
        instance = session.query(model).filter_by(**kwargs).first()
        if instance:
            return instance
        else:
            instance = model(**kwargs)
            session.add(instance)
            session.commit()
            return instance

    containers = subprocess.run(['docker', 'container', 'ls'], stdout=subprocess.PIPE).stdout.decode('utf-8')
    containers = containers.split('\n')
    scenario_nameList = []
    for i, c in enumerate(containers[:-1]):
        if i == 0:
            continue
        c = c.split(' ')
        c_name = c[-1]
        if c_name is not None and c_name != 'ago' and c_name != 'NAMES':
            if c_name.split('_')[0] is not None and c_name.split('_')[0] not in scenario_nameList:
                scenario_nameList.append(c_name.split('_')[0])

    files = subprocess.run(['ls', 'logs/'], stdout=subprocess.PIPE).stdout.decode('utf-8')
    files = files.split('\n')[:-1]
    for scenario_name in scenario_nameList:
        try:  # DEV_FIX This is dangerous, may want to substitute for subprocess.call
            os.system(f'docker cp {scenario_name}_gateway:/usr/local/src/merged_logs.csv logs/{scenario_name}_gateway.csv')
            os.system(f'docker cp {scenario_name}_gateway:/usr/local/src/raw_logs.zip logs/{scenario_name}_gateway.zip')
        except FileNotFoundError as e:
            print(f'{e}')
        if os.path.isdir(f'scenarios/tmp/{scenario_name}'):
            try:
                os.system(f'cat /dev/null > scenarios/tmp/{scenario_name}/{scenario_name}-{this_archive_id}.csv')
            except Exception as e:
                print(f'Not a scenario: {e} - Skipping')

    for f in files:
        for scenario_name in scenario_nameList:
            if f.find(scenario_name) == 0 and os.path.isdir(f'scenarios/tmp/{scenario_name}') and f.endswith('.csv'):
                try:
                    os.system(f'cat logs/{f} >> scenarios/tmp/{scenario_name}/{scenario_name}-{this_archive_id}.csv')
                except Exception as e:
                    print(f'Not a scenario: {e} - Skipping')
            if f.find(scenario_name) == 0 and os.path.isdir(f'scenarios/tmp/{scenario_name}') and f.endswith('.zip'):
                try:
                    os.system(f'cp logs/{f} scenarios/tmp/{scenario_name}/{scenario_name}-raw.zip')
                except Exception as e:
                    print(f'Not a scenario: {e} - Skipping')

    for scenario_name in scenario_nameList:
        try:
            data = readCSV(scenario_name, 'name')
            for i, line in enumerate(data):

                if i == 0:
                    continue

                # DEV_FIX logs are being added to database repeatedly
                
                # DEV_FIX this was added, not sure why it was needed all of a sudden...
                if line[0][0] == "#":
                    continue

                timestamp_int_unformatted = line[3]
                timestamp_int_casted = int(timestamp_int_unformatted)
                clean_datetime = datetime.fromtimestamp(timestamp_int_casted)

                scenario_rawObj = Scenarios.query.filter_by(name=scenario_name).first()

                user_name = str(line[4])
                user_rawObj = Users.query.filter_by(username=user_name).first()

                get_or_create(
                    session=db.session,
                    model=BashHistory,
                    scenario_type=scenario_rawObj.scenario_type,
                    scenario_id=scenario_rawObj.id,
                    container_name=line[6].split(':')[0],
                    timestamp=clean_datetime,
                    current_directory=line[5],
                    input=line[6].split(':')[-1],
                    output=line[7],
                    archive_id=this_archive_id,
                    user_id=user_rawObj.id
                    
                )
        except FileNotFoundError as e:
            print(f"Container not found: {e} - Skipping")

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(60.0, scenarioCollectLogs.s(''))


@celery.task(bind=True, worker_prefetch_multiplier=1, priority=1)
def initialize_model(self, cpu_resources=0, gpu_resources=0):
    
    def determine_cpu_resources():   
        num_cpus = os.cpu_count()
        if num_cpus is None or num_cpus <= 0:
            raise ValueError(f"Invalid CPU count: {num_cpus}")
        else:   
            return num_cpus


    def determine_gpu_resources():
        try:
            platforms = cl.get_platforms()
            for platform in platforms:
                gpu_device = platform.get_devices(device_type=cl.device_type.GPU)
                if gpu_device:
                    return -1
                else:
                    return 0   

        except Exception as GPU_NOT_FOUND:
            return 0
    
    def create_model_object(cpu_resources, gpu_resources):  
        language_model_object = Llama.from_pretrained(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
                filename="Phi-3-mini-4k-instruct-q4.gguf",
                verbose=False,
                n_ctx=4086, 
                n_threads=cpu_resources, 
                n_gpu_layers=gpu_resources,
                flash_attn=True,
                use_mlock=True,
        )
        return language_model_object
    
    def cache_initialization_data(language_model_object, cpu_resources, gpu_resources):
        r = redis.StrictRedis(host='localhost', port=6379, db=1)
        language_model_pickle = pickle.dumps(language_model_object)
        cpu_resources_pickle = pickle.dumps(cpu_resources)
        gpu_resources_pickle = pickle.dumps(gpu_resources)
        r.set('language_model', language_model_pickle)
        r.set('cpu_resources', cpu_resources_pickle)
        r.set('gpu_resources', gpu_resources_pickle)

    if cpu_resources is 0:
        cpu_resources = determine_cpu_resources()

    if gpu_resources is 0:
        gpu_resources = determine_gpu_resources()

    language_model_object = create_model_object(cpu_resources, gpu_resources)
    cache_initialization_data(language_model_object, cpu_resources, gpu_resources)
    
@celery.task(bind=True, worker_prefetch_multiplier=1, priority=1)
def getLogs_for_hint(self, user_id):
    logs_dict = getNumOfRecentLogsForHint(user_id)

    return logs_dict


@celery.task(bind=True, worker_prefetch_multiplier=1, priority=1)
def request_and_generate_hint(self, scenario_name, logs_dict, disable_scenario_context, temperature):
    
    r = redis.StrictRedis(host='localhost', port=6379, db=1)
    task_id = self.request.id

    generate_hint_task_id_pickle = pickle.dumps(task_id)

    r.set('generate_hint_task_id', generate_hint_task_id_pickle)

    language_model = load_language_model_from_redis()

    available_cpu_and_gpu_resources = get_available_cpu_and_gpu_resources_from_redis()
    
    generated_hint, function_duration = generate_hint(language_model, logs_dict, scenario_name, disable_scenario_context, temperature)

    export_hint_to_csv(scenario_name, generated_hint, function_duration)

    return {'generated_hint': generated_hint, 'logs_dict': logs_dict, 'cpu_resources_used': available_cpu_and_gpu_resources[0], 'gpu_rescources_used': available_cpu_and_gpu_resources[1], 'temperature': temperature}



@celery.task(bind=True, worker_prefetch_multiplier=1, priority=1)
def cancel_generate_hint_celery(self):
    generate_hint_task_id = load_generate_hint_task_id_from_redis()
    self.app.control.revoke(generate_hint_task_id, terminate=True)
    
    return {'status': generate_hint_task_id}

      
