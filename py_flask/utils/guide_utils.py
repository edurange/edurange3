import json
import os
import yaml
import ast
import docker
from py_flask.utils.error_utils import (
    custom_abort
)
from py_flask.config.extensions import db
from py_flask.database.models import Scenarios, Users, Responses

# Guide utils are functions that primarily populate and run the 
# question & answer 'guide' that students see on the eduRange webpage (not the terminal ssh)

## TESTED/WORKING 

def getContent(user_role, scenario_id, username):
    db_ses = db.session
    statusSwitch = {
        0: "Stopped",
        1: "Started",
        2: "Something went very wrong",
        3: "Starting",
        4: "Stopping",
        5: "ERROR",
        7: "Building",
        8: "Archived"
    }
    status = db_ses.query(Scenarios.status).filter(Scenarios.id == scenario_id).first()
    status = statusSwitch[status[0]]

    unique_name = db_ses.query(Scenarios.name).filter(Scenarios.id == scenario_id).first()
    if unique_name: unique_name = unique_name[0]
    if (not unique_name
        
    or status != "Started"):     
        custom_abort("Scenario not in started state.  Arborting.", 400)

    unique_name = "".join(e for e in unique_name if e.isalnum())
    
    with open(f'scenarios/tmp/{unique_name}/student_view/content.json', 'r') as fp:
        contentJSON = json.load(fp)
    with open(f'scenarios/tmp/{unique_name}/students.json', 'r') as fp:
        credentialsJSON = json.load(fp)
    
    if (user_role == 'student'):
        saniName = username.replace('-','')
        user_creds = credentialsJSON[saniName][0]
        if not user_creds:
            return custom_abort("Error retrieving user credentials.  Arborting.", 500)
    else: 
        user_creds = credentialsJSON

    return contentJSON, credentialsJSON, unique_name

def getYamlContent(user_role, scenario_id, username):
    db_ses = db.session
    statusSwitch = {
        0: "Stopped",
        1: "Started",
        2: "Something went very wrong",
        3: "Starting",
        4: "Stopping",
        5: "ERROR",
        7: "Building",
        8: "Archived"
    }
    status = db_ses.query(Scenarios.status).filter(Scenarios.id == scenario_id).first()
    status = statusSwitch[status[0]]

    unique_name = db_ses.query(Scenarios.name).filter(Scenarios.id == scenario_id).first()
    if unique_name: unique_name = unique_name[0]
    if (not unique_name
        
    or status != "Started"):     
        return custom_abort("Scenario not in started state.  Arborting.", 400)

    unique_name = "".join(e for e in unique_name if e.isalnum())

    scenario_type = db_ses.query(Scenarios.scenario_type).filter(Scenarios.id == scenario_id).first()
 
    if scenario_type: scenario_type = scenario_type[0].lower()
 
    if (not scenario_type or status != "Started"):     
        return custom_abort("Scenario not in started state.  Arborting.", 400)

    with open(f'scenarios/prod/{scenario_type}/guide_content.yml', 'r') as fp:
    # with open(f'scenarios/tmp/{unique_name}/guide_content.yml', 'r') as fp:
        contentYAML = yaml.safe_load(fp)

    with open(f'scenarios/prod/common/briefing.yml', 'r') as fp:
        briefingYAML = yaml.safe_load(fp)

    with open(f'scenarios/prod/common/debrief.yml', 'r') as fp:
        debriefYAML = yaml.safe_load(fp)

    with open(f'scenarios/tmp/{unique_name}/students.json', 'r') as fp:
        credentialsJSON = json.load(fp)
    
    if (user_role == 'student'):
        saniName = username.replace('-','')
        user_creds = credentialsJSON[saniName][0]
        if not user_creds:
            return custom_abort("Error retrieving user credentials.  Arborting.", 500)
    else: 
        user_creds = credentialsJSON

    return contentYAML, briefingYAML, debriefYAML, credentialsJSON, unique_name


def getScenarioMeta(scenario_id):
        db_ses = db.session
        scenario = db_ses.query (Scenarios).filter_by(id=scenario_id).first()
        scenario_info = {
            "scenario_id": scenario.id,
            "scenario_name": scenario.name,
            "scenario_type": scenario.scenario_type,
            "scenario_owner_id": scenario.owner_id,
            "scenario_created_at": scenario.created_at,
            "scenario_status": scenario.status,
        }
        return scenario_info

def bashResponse(sid, uid, ans):
    db_ses = db.session

    uName = db_ses.query(Users.username).filter(Users.id == uid).first()[0]
    uName = "".join(e for e in uName if e.isalnum())

    sName = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()[0]
    sName = "".join(e for e in sName if e.isalnum())

    if "${player.login}" in ans:
        students = open(f"./scenarios/tmp/{sName}/students.json")
        user = ast.literal_eval(students.read())
        username = user[uName][0]["username"]
        ansFormat = ans[0:6]
        newAns = ansFormat + username
        return newAns
    elif "${scenario.instances" in ans:
        wordIndex = ans[21:-1].index(".")
        containerName = ans[21:21+wordIndex]
        containerFile = open(f"./scenarios/tmp/{sName}/{containerName}.tf.json")
        content = ast.literal_eval(containerFile.read())
        index = content["resource"][0]["docker_container"][0][sName + "_" + containerName][0]["networks_advanced"]
        ans = ""
        for d in index:
            if d["name"] == (sName + "_PLAYER"):
                ans = d["ipv4_address"]
        return ans
    return ans


def readQuestions(scenario_uniqueName):

    with open(f"scenarios/tmp/{scenario_uniqueName}/guide_content.yml") as yml:
        yml_full = yaml.full_load(yml)
        questions = [value for value in yml_full['contentDefinitions'].values() if value['type'] == 'question']
        return questions

def evaluateResponse(user_id, scenario_id, question_num, student_response):
    """Check student answer matches correct one from YAML file."""
    db_ses = db.session
    scenario = db_ses.query (Scenarios).filter_by(id=scenario_id).first()

    questions = readQuestions(scenario.name)

    for q in questions:
        if q["question_num"] == question_num:
            question = q

    responseData = []

    # TODO: Tell students how they should delimit their answers
    # Then parse the string ala:
    # parsed_response_list = student_response.split(", ")

    for i in question['answers']:

        correctResponse = str(i['value'])
        student_response = str(student_response)

        tempResponseItem = {
            "submitted_response": student_response,
            "correct_response": correctResponse,
            "points_awarded": 0,
            "points_possible" : i['points_possible']
        }

        if "${" in correctResponse:
            correctResponse = str(bashResponse(scenario_id, user_id, correctResponse))

        if student_response == correctResponse or correctResponse == 'ESSAY':
            pointsAwarded = i['points_possible']
            tempResponseItem['points_awarded'] = pointsAwarded

        responseData.append (tempResponseItem)

    return responseData

### UNTESTED / DEV 

def get_dockerPort (scenario_unique_name):

    # use name to select docker container
    docClient = docker.from_env()
    active_containers = docClient.containers.list()