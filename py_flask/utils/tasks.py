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
import asyncio
import csv
import logging

from datetime import datetime
from celery import Celery
from celery import shared_task
from celery.utils.log import get_task_logger
from flask import current_app, flash, jsonify
from py_flask.utils.terraform_utils import (
    adjust_network,
    find_and_copy_template,
    write_resource,
)
from py_flask.config.settings import CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from py_flask.utils.scenario_utils import claimOctet
from py_flask.utils.staff_utils import getLogs, getRecentLogs
from py_flask.utils.scenario_utils import gather_files
from py_flask.utils.staff_utils import NotifyCapture
from py_flask.database.models import (
    Scenarios,
    ScenarioGroups,
    Responses,
    BashHistory,
    Users,
)
from py_flask.utils.csv_utils import readCSV
from py_flask.config.extensions import db
from flask_sqlalchemy import SQLAlchemy

# Create a custom logger
logger = get_task_logger(__name__)

# Configure the root logger
logging.basicConfig(level=logging.INFO)

# Create a file handler
file_handler = logging.FileHandler("logs/celery_tasks.log")
file_handler.setLevel(logging.INFO)

# Create a console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Create a formatter
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# Set the formatter for both handlers
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Ensure propagation is set to True
logger.propagate = False


path_to_directory = os.path.dirname(os.path.abspath(__file__))


def get_path(file_name):
    mail_path = os.path.normpath(
        os.path.join(path_to_directory, "templates/utils", file_name)
    )
    return mail_path


celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)


class ContextTask(celery.Task):
    """This allows tasks to assume the create_app() context, and access the database"""

    abstract = True

    def __call__(self, *args, **kwargs):
        from py_flask.config.init import create_app

        with create_app().app_context():
            return super(ContextTask, self).__call__(*args, **kwargs)


celery.Task = ContextTask


@celery.task(bind=True)
def create_scenario_task(self, scen_name, scen_type, students_list, grp_id, scen_id):
    try:
        """ self is the task instance, other arguments are the results of database queries """

        app = current_app
        scen_type = scen_type.lower()
        grp_id = grp_id["id"]

        try:
            c_names, g_files, s_files, u_files, packages, ip_addrs = gather_files(
                scen_type
            )
            logger.info(
                f"Values returned from gatherFiles: c_names={c_names}, g_files={g_files}, s_files={s_files}, u_files={u_files}, packages={packages}, ip_addrs={ip_addrs}"
            )
        except Exception as e:
            logger.error(f"Error in gather_files: {str(e)}")

        logger.info(
            "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
                self.request
            )
        )

        students = {}
        usernames, passwords = [], []

        for student in students_list:
            username = "".join(e for e in student["username"] if e.isalnum())
            password = "".join(
                random.choice(string.ascii_letters + string.digits) for _ in range(6)
            )

            usernames.append(username)
            passwords.append(password)

            logger.info(f"User: {student['username']}")
            students[username] = [{"username": username, "password": password}]

        with app.test_request_context():
            scenario = Scenarios.query.filter_by(id=scen_id).first()
            scen_name = "".join(e for e in scen_name if e.isalnum())

            os.makedirs("./scenarios/tmp/" + scen_name)
            os.chdir("./scenarios/tmp/" + scen_name)

            os.makedirs("student_view", exist_ok=True)

            with open("students.json", "w") as outfile:
                json.dump(students, outfile)

            with open(
                f"../../../scenarios/prod/{scen_type}/guide_content.yml", "r"
            ) as f:
                content = yaml.safe_load(f)
                content_items = content["contentDefinitions"]
                logger.debug(f"Content Type: {type(content)}")

            flags = []
            for item_name, item in content_items.items():
                if item["type"] == "question":
                    q_num = item["question_num"]
                    if item["answers"][0]["value"] == "$RANDOM":
                        rnd_ans = "".join(
                            random.choice(string.ascii_letters + string.digits)
                            for _ in range(8)
                        )
                        content["contentDefinitions"]["Question" + str(q_num)][
                            "answers"
                        ][0]["value"] = rnd_ans
                        flags.append(rnd_ans)

            with open("guide_content.yml", "w") as outfile:
                yaml.dump(content, outfile, indent=4)

            lowest_avail_octet = claimOctet()

            try:
                find_and_copy_template(scen_type, "main")
                logger.debug("find_and_copy complete")

                adjust_network(str(lowest_avail_octet), scen_name, logger)

                os.chdir("network")
                os.system(
                    "mv ../network.tf.json ."
                )  # this is the best workaround so far.
                os.system("terraform init")
                os.system("terraform plan -out network.plan")

            except Exception as e:
                logger.error(
                    f"An error occurred while adjusting network or running Terraform: {str(e)}"
                )
                return {"result": "error", "message": str(e)}

            logger.debug("All flags: {}".format(flags))

            for i, c in enumerate(c_names):
                write_resource(
                    str(lowest_avail_octet),
                    scen_name,
                    scen_type,
                    i,
                    usernames,
                    passwords,
                    s_files[i],
                    g_files[i],
                    u_files[i],
                    flags,
                    c_names,
                    logger,
                )

            scenario.update(status=0, octet=lowest_avail_octet)

            os.chdir("../container")
            os.system("terraform init")
            os.system("terraform plan -out container.plan")

            os.chdir("../../../..")

            ScenarioGroups.create(group_id=grp_id, scenario_id=scen_id)

            return {"result": "success", "new_status": 0, "scenario_id": scen_id}

    except Exception as e:
        logger.error(f"An error occurred in the create_scenario: {str(e)}")
        return {"result": "error", "message": str(e)}


def run_command(command, cwd=None):
    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=cwd
    )

    while True:
        output = process.stdout.readline()
        if output == "" and process.poll() is not None:
            break
        if output:
            logger.info(output.strip())

    rc = process.poll()
    return rc


def apply_terraform(command, path, component_name, important_phrases):
    logger.info(f"**** Starting {component_name} terraform ****")
    with subprocess.Popen(
        command, cwd=path, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    ) as proc:
        stdout_output, stderr_output = proc.communicate()

        for line in stdout_output.splitlines():
            logger.debug(line.strip())

            if any(phrase in line for phrase in important_phrases):
                logger.info(f"Important: {line.strip()}")

        if stderr_output:
            logger.error(f"Error occurred: {stderr_output.strip()}")

        if proc.returncode != 0:
            logger.error(f"Starting {component_name} terraform failed")
    return proc.returncode == 0


@celery.task(bind=True)
def start_scenario_task(self, scenario_id):
    logger.info("Starting scenario")
    original_dir = os.getcwd()
    try:
        app = current_app
        with app.test_request_context():
            scenario = Scenarios.query.filter_by(id=scenario_id).first()
            if not scenario:
                logger.error(f"Scenario with id {scenario_id} not found")
                return {
                    "result": "failure",
                    "new_status": 5,
                    "scenario_id": scenario_id,
                    "message": "Scenario not found",
                }

            logger.debug(f"Found Scenario: {scenario}")
            name = "".join(e for e in str(scenario.name) if e.isalnum())
            gateway = f"{name}_gateway"
            start = f"{name}_StartingLine"
            start_line_tf_file = (
                f"./scenarios/tmp/{name}/container/StartingLine.tf.json"
            )
            start_line_end_half = ""
            with open(start_line_tf_file, "r") as tf_file:
                keys = []
                ip_end = []
                for line in tf_file:
                    if "ipv4_address" in line:
                        keys.append(line.replace(" ", ""))
                for k in keys:
                    raw_ip = k.split(":")[1].split(",")[0].replace('"', "")
                    last_octets = raw_ip.replace("10.OCTET.", "")
                    if last_octets != "1.2":
                        ip_end.append(last_octets)
                start_line_end_half = ip_end[0]

            octs = start_line_end_half.split(".")

            third = octs[0]
            fourth = octs[1]
            start_ip = f"10.{scenario.octet}.{third}.{fourth}"

            if int(scenario.status) != 0:
                logger.error("Invalid Status")
                NotifyCapture(f"Failed to start scenario {name}: Invalid Status")
                return {
                    "result": "failure",
                    "new_status": 5,
                    "scenario_id": scenario_id,
                    "message": "Scenario must be stopped before starting",
                }

            scenario_path = os.path.join("./scenarios/tmp/", name)
            if not os.path.isdir(scenario_path):
                logger.debug(f"Scenario folder could not be found -- {scenario_path}")
                NotifyCapture(
                    f"Failed to start scenario {name}: Scenario folder could not be found. -- {scenario_path}"
                )
                return {
                    "result": "failure",
                    "new_status": 5,
                    "scenario_id": scenario_id,
                }

            scenario.update(status=3)
            db.session.commit()
            logger.debug("Folder Found")

            apply_command = ["terraform", "apply", "--auto-approve"]
            important_phrases = [
                "Apply complete",
                "Saved the plan to: ",
                "will be created",
                "Plan:",
                "Terraform will perform the following actions:",
            ]

            # Apply network terraform
            network_path = os.path.join(scenario_path, "network")
            if not apply_terraform(
                apply_command, network_path, "network", important_phrases
            ):
                raise Exception("Network terraform apply failed")

            # Apply container terraform
            container_path = os.path.join(scenario_path, "container")
            if not apply_terraform(
                apply_command, container_path, "container", important_phrases
            ):
                raise Exception("Container terraform apply failed")

            # Run scenario_movekeys.sh
            script_path = os.path.join("./shell_scripts", "scenario_movekeys.sh")
            result = subprocess.run(
                [script_path, gateway, start, start_ip],
                cwd=original_dir,
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                logger.error(f"scenario_movekeys.sh failed: {result.stderr}")
                raise Exception("scenario_movekeys.sh failed")

            scenario.update(status=1)
            db.session.commit()
            NotifyCapture(f"Scenario {name} has started successfully.")
            db.session.close()

            return {"result": "success", "new_status": 1, "scenario_id": scenario_id}

    except Exception as e:
        logger.error("Error encountered in start scenario function in tasks.py")
        logger.exception(e)
        scenario.update(status=5)
        db.session.commit()
        db.session.close()
        self.retry(exc=e, countdown=60)  # Retry after 60 seconds
        return {"result": "failure", "new_status": 5, "scenario_id": scenario_id}

    finally:
        os.chdir(original_dir)  # Always return to the original directory


@celery.task(bind=True)
def stop_scenario_task(self, scenario_id):
    app = current_app
    logger.debug(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        logger.debug("Found Scenario: {}".format(scenario))
        name = str(scenario.name)
        name = "".join(e for e in name if e.isalnum())
        if int(scenario.status) != 1:
            logger.error("Invalid Status")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Scenario is not ready to start", "warning")
        if os.path.isdir(os.path.join("./scenarios/tmp/", name)):
            logger.debug("Folder Found")
            scenario.update(status=4)
            os.chdir("./scenarios/tmp/" + name)

            # Destroy the resources

            os.chdir("container")
            # os.system("terraform plan -out container.plan")
            os.system("terraform destroy --auto-approve")

            os.chdir("../network")
            # os.system("terraform plan -out network.plan")
            os.system("terraform destroy --auto-approve")

            os.chdir("../../../..")
            scenario.update(status=0)
            NotifyCapture("Scenario " + name + " has successfully stopped.")
            return {"result": "success", "new_status": 0, "scenario_id": scenario_id}
        else:
            logger.error("Something went wrong")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            return {"result": "failure", "new_status": 5, "scenario_id": scenario_id}


@celery.task(bind=True)
def update_scenario_task(self, scenario_id):
    app = current_app
    logger.debug(
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
            logger.error("Invalid Status")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Scenario is not ready to start", "warning")
        elif os.path.isdir(os.path.join("./scenarios/tmp/", name)):
            logger.debug("Folder Found")
            scenario.update(status=4)
            os.chdir("./scenarios/tmp/" + name)
            os.system("terraform destroy --auto-approve")
            os.chdir("../../..")
            scenario.update(status=0)
            NotifyCapture("Scenario " + name + " has successfully stopped.")
        else:
            logger.error("Something went wrong")
            NotifyCapture("Failed to stop scenario " + name + ": Invalid Status")
            flash("Something went wrong", "warning")


@celery.task(bind=True)
def destroy_scenario_task(self, scenario_id):
    app = current_app
    logger.debug(
        "Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}".format(
            self.request
        )
    )
    scenario = Scenarios.query.filter_by(id=scenario_id).first()

    with app.test_request_context():
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        if scenario is not None:
            logger.debug("Found Scenario: {}".format(scenario))
            name = str(scenario.name)
            name = "".join(e for e in name if e.isalnum())
            s_id = str(scenario.id)
            s_group = ScenarioGroups.query.filter_by(scenario_id=s_id).first()
            if int(scenario.status) != 0:
                logger.error("Invalid Status")
                NotifyCapture("Failed to delete scenario" + name + ": Invalid Status")
                raise Exception(f"Scenario in an Invalid state for Destruction")
            s_responses = Responses.query.filter_by(scenario_id=s_id).all()
            for r in s_responses:
                r.delete()
            if os.path.isdir(os.path.join("./scenarios/tmp/", name)):
                logger.info("Folder Found, current directory: {}".format(os.getcwd()))

                # Lock network-related operations
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
                logger.error(
                    "Scenario files not found, assuming broken scenario and deleting"
                )
                NotifyCapture(
                    "Failed to delete scenario "
                    + name
                    + ": Scenario files could not be found."
                )
                scenario.delete()
                return {
                    "result": "failure",
                    "new_status": 5,
                    "scenario_id": scenario_id,
                }
        else:
            NotifyCapture(
                "Failed to delete scenario " + name + ": Scenario could not be found."
            )
            return {"result": "failure", "new_status": 5, "scenario_id": scenario_id}


@celery.task(bind=True)
def scenarioCollectLogs(self, arg):
    with open("./logs/archive_id.txt", "r") as log_id_file:
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

    containers = subprocess.run(
        ["docker", "container", "ls"], stdout=subprocess.PIPE
    ).stdout.decode("utf-8")
    containers = containers.split("\n")
    scenario_nameList = []
    for i, c in enumerate(containers[:-1]):
        if i == 0:
            continue
        c = c.split(" ")
        c_name = c[-1]
        if c_name is not None and c_name != "ago" and c_name != "NAMES":
            if (
                c_name.split("_")[0] is not None
                and c_name.split("_")[0] not in scenario_nameList
            ):
                scenario_nameList.append(c_name.split("_")[0])

    files = subprocess.run(["ls", "logs/"], stdout=subprocess.PIPE).stdout.decode(
        "utf-8"
    )
    files = files.split("\n")[:-1]
    for scenario_name in scenario_nameList:
        try:  # DEV_FIX This is dangerous, may want to substitute for subprocess.call
            os.system(
                f"docker cp {scenario_name}_gateway:/usr/local/src/merged_logs.csv logs/{scenario_name}_gateway.csv"
            )
            os.system(
                f"docker cp {scenario_name}_gateway:/usr/local/src/raw_logs.zip logs/{scenario_name}_gateway.zip"
            )
        except FileNotFoundError as e:
            print(f"{e}")
        if os.path.isdir(f"scenarios/tmp/{scenario_name}"):
            try:
                os.system(
                    f"cat /dev/null > scenarios/tmp/{scenario_name}/{scenario_name}-{this_archive_id}.csv"
                )
            except Exception as e:
                print(f"Not a scenario: {e} - Skipping")

    for f in files:
        for scenario_name in scenario_nameList:
            if (
                f.find(scenario_name) == 0
                and os.path.isdir(f"scenarios/tmp/{scenario_name}")
                and f.endswith(".csv")
            ):
                try:
                    os.system(
                        f"cat logs/{f} >> scenarios/tmp/{scenario_name}/{scenario_name}-{this_archive_id}.csv"
                    )
                except Exception as e:
                    print(f"Not a scenario: {e} - Skipping")
            if (
                f.find(scenario_name) == 0
                and os.path.isdir(f"scenarios/tmp/{scenario_name}")
                and f.endswith(".zip")
            ):
                try:
                    os.system(
                        f"cp logs/{f} scenarios/tmp/{scenario_name}/{scenario_name}-raw.zip"
                    )
                except Exception as e:
                    print(f"Not a scenario: {e} - Skipping")

    for scenario_name in scenario_nameList:
        try:
            data = readCSV(scenario_name, "name")
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
                    container_name=line[6].split(":")[0],
                    timestamp=clean_datetime,
                    current_directory=line[5],
                    input=line[6].split(":")[-1],
                    output=line[7],
                    archive_id=this_archive_id,
                    user_id=user_rawObj.id,
                )
        except FileNotFoundError as e:
            print(f"Container not found: {e} - Skipping")


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(60.0, scenarioCollectLogs.s(""))
