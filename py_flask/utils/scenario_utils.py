import json
import os
from py_flask.database.models import Scenarios
from py_flask.config.extensions import db
import logging
from celery.utils.log import get_task_logger

# Ensure the logs directory exists
os.makedirs('logs', exist_ok=True)

# Create a custom logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a file handler
file_handler = logging.FileHandler('logs/scenario_utils.log')
file_handler.setLevel(logging.INFO)

# Create a console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Create a formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Set the formatter for both handlers
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)


# Import the scenario string, and set to 'known_types' as a list
from py_flask.config.settings import KNOWN_SCENARIOS
known_types = KNOWN_SCENARIOS

def item_generator(json_input, lookup_key):
    if isinstance(json_input, dict):
        for k, v in json_input.items():
            if k == lookup_key:
                yield v
            else:
                yield from item_generator(v, lookup_key)
    elif isinstance(json_input, list):
        for item in json_input:
            yield from item_generator(item, lookup_key)

def gather_files(s_type):
    try:
        c_names = []
        g_files = []
        s_files = []
        u_files = []
        package_list = []
        ip_addrs = []
        if os.path.isdir(os.path.join("./scenarios/prod/", s_type)):
            logger.info("Scenario of type {} Found".format(s_type))
            logger.info("Now attempting to load file requirements...")
            try:
                with open(
                    os.path.join("./scenarios/prod/", s_type + "/" + s_type + ".json")
                ) as f:
                    data = json.load(f)
                    containers = item_generator(data, "name")

                    for i in containers:
                        c_names.append(i)
                    logger.info("Found containers: {}".format(c_names))

                    global_files = item_generator(data, "global_files")
                    for g in list(global_files):
                        g_files.append(g)
                    logger.info("Found global files: {}".format(g_files))

                    system_files = item_generator(data, "system_files")
                    for s in list(system_files):
                        s_files.append(s)
                    logger.info("Found system files: {}".format(s_files))

                    user_files = item_generator(data, "user_files")
                    for u in list(user_files):
                        u_files.append(u)
                    logger.info("Found user files: {}".format(u_files))

                    packages = item_generator(data, "packages")
                    for p in list(packages):
                        package_list.append(p)
                    logger.info("Found required packages: {}".format(package_list))

                    ip_addresses = item_generator(data, "ip_address")
                    for a in list(ip_addresses):
                        ip_addrs.append(a)
                    logger.info("Found addresses: {}".format(ip_addrs))

                    return c_names, g_files, s_files, u_files, package_list, ip_addrs
                
            except FileNotFoundError:
                logger.warn("Could Not load json file for type: {}".format(s_type))
                raise FileNotFoundError
        else:
            logger.warn("Invalid Scenario Type - Folder Not Found")
            raise Exception(f"Could not correctly identify scenario type")
    except Exception as e:
        logger.error(f"An error occurred while gathering files: {str(e)}")
        raise e

def identify_type(form):
    found_type = ""
    for i, s_type in enumerate(known_types):
        if s_type in form.keys():
            found_type = s_type
    return found_type

def identify_state(name, state):
    logger.info("Starting identify state")
    if state == "Stopped":
        return {"Nothing to show": "Scenario is Not Running"}
    addresses = {}
    c_names = []
    name = "".join(e for e in name if e.isalnum())
    if os.path.isdir(os.path.join("./scenarios/tmp/", name)):

        try:
            state_file = open("./scenarios/tmp/" + name + "/network/terraform.tfstate", "r")
            container_state_file = open("./scenarios/tmp/" + name + "/container/terraform.tfstate", "r")
            
            try:
                network_data = json.load(state_file)
                container_data = json.load(container_state_file)
            except json.decoder.JSONDecodeError:
                logger.error("error in identify_state fucntion in scen_utils")
                return {"State file is still being written": "Try Refreshing"}
            
            containers = item_generator(container_data, "name")
            for c in list(containers):
                if c != "string" and c not in c_names:
                    c_names.append(c)

            public_ips = item_generator(network_data, "ip_address_public")
            logger.info('**network_data*:', network_data)
            miss = 0
            for i, a in enumerate(list(public_ips)):
                if a != "string": addresses[c_names[i - miss]] = a
                else: miss += 1
            logger.info("Found public IPs: {}".format(addresses))
            return addresses
        
        except FileNotFoundError:
            logger.error("No state file found" "Has the scenario been started at least once?")
            return {"No state file found": "Has the scenario been started at least once?"}
        except json.decoder.JSONDecodeError:
            return {"State file is still being written": "Try Refreshing"}

    else: return {"Could not find scenario folder": "Please destroy and re-make this scenario"}

def claimOctet():

    lowest_octet = int(os.getenv("SUBNET_STARTING_OCTET", 10))
    octets_intList = [octet[0] for octet in db.session.query(Scenarios.octet).all() if octet[0] is not None]

    candidate_octet = lowest_octet
        
    while True:
        if candidate_octet not in octets_intList:
            return candidate_octet
        candidate_octet += 1
        if candidate_octet > 255:
            return False
