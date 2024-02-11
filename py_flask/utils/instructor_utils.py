import json
import os
import yaml
import ast
import docker
from flask import abort, jsonify, g
import string
import random
from py_flask.utils.auth_utils import register_user
from py_flask.utils.auth_utils import jwt_and_csrf_required, instructor_only


from py_flask.config.extensions import db
from py_flask.database.models import (
    Scenarios, User, 
    Responses, Notification, 
    StudentGroups, GroupUsers, 
    generate_registration_code)
from py_scripts.tasks_sister import (
    create_scenario_task, 
    start_scenario_task, 
    stop_scenario_task, 
    update_scenario_task,
    destroy_scenario_task)
from py_scripts.tasks import (
    CreateScenarioTask
    )
path_to_key = os.path.dirname(os.path.abspath(__file__))

## whole file is currently WIP 1/17/24 -Jonah (exoriparian)

# def generate_registration_code(size=8, chars=string.ascii_lowercase + string.digits):
#     return "".join(random.choice(chars) for _ in range(size))

# - INSTRUCTOR: GENERATE USER GROUP W/ GROUP CODE
def createUserGroup():
    return 0


# - INSTRUCTOR: GENERATE GENERIC USER ACCTS FOR EXISTING GROUP
def generateTestAccts(new_user_count, group_name, group_code):

    # check for code input
    if not group_code:
        print('You must have group code')
    # check to see if code is in database
        # if code NOT in database, reject request

    generatedUsers = []
    for i in range(new_user_count):

        newPass = generate_registration_code()
        user_obj = {
            'username' : group_name + '-' + i,
            'password' : newPass,
            'confirm_password' : newPass,
            'code' : group_code,
            'email': 'DEV_ONLY@EMAIL.COM'
        }

        register_user(user_obj)
        generatedUsers.append(user_obj)

    return []


# - ASSIGN USERS/GROUPS TO SCENARIO
def assignUserToGroup(user_id, group_id):
    return 0
def removeUserFromGroup(user_id, group_id):
    return 0

def NotifyCapture(description):
    Notification.create(detail=description)

def NotifyClear():
    notification = Notification.query.all()
    for i in notification:
        i.delete()

    #   - CREATE USER INFO FOR SCENARIO (ALLOW FOR UPDATING IN CASE STUDENT ACCT CREATED AFTER SCENARIO)


@jwt_and_csrf_required
def scenario_create(scenario_type, scenario_name, studentGroup_name):
    
    db_ses = db.session
    owner_user_id = g.current_user_id
    print("CREATE REQ INFO: ",scenario_type, scenario_name, studentGroup_name)
    students = (
        db_ses.query(User.username)
        .filter(StudentGroups.name == studentGroup_name)
        .filter(StudentGroups.id == GroupUsers.group_id)
        .filter(GroupUsers.user_id == User.id)
        .all()
    )
    for i, s in enumerate(students):
        students[i] = s._asdict()

    Scenarios.create(name=scenario_name, description=scenario_type, owner_id=owner_user_id)
    NotifyCapture(f"Scenario {scenario_name} has been created.")
    
    scenario_id = db_ses.query(Scenarios.id).filter(Scenarios.name == scenario_name).first()
    
    s_id_list = list(scenario_id._asdict().values())[0]


    scenario = Scenarios.query.filter_by(id=s_id_list).first()
    scenario.update(status=7)
    
    group_id = db_ses.query(StudentGroups.id).filter(StudentGroups.name == studentGroup_name).first()
    group_id = group_id._asdict()
    
    
    student_ids = db_ses.query(GroupUsers.id).filter(GroupUsers.group_id == group_id['id']).all()
    namedict = gen_chat_names(student_ids, scenario_id)

    if ( scenario_name is None \
        or scenario_type is None\
        or owner_user_id is None\
        or students is None\
        or group_id is None\
        or scenario_id is None\
        or namedict is None
    ):
        print('missing create arg, aborting')
        abort(418)

    print('Attempting to create scenario w/ args: ')
    print(f"name: {scenario_name}")
    print(f"s_type: {scenario_type}")
    print(f"own_id: {owner_user_id}")
    print(f"students: {students}")
    print(f"group_id: {group_id}")
    print(f"scenario_id: {scenario_id[0]}")
    print(f"namedict: {namedict}")
    CreateScenarioTask.delay(scenario_name, scenario_type, owner_user_id, students, group_id, scenario_id[0],  namedict)

    # convert db-formatted-list to list of python dicts
    students_list = [{'username': student['username']} for student in students]
    return jsonify({"student_list": students_list})

def list_all_scenarios(requestJSON):
    print("Performing LIST method")
    
    db_ses = db.session

    all_scenarios = db_ses.query(Scenarios).all()
    all_scenarios_list = []
    for scenario in all_scenarios:
        scenario_info = {
            "scenario_id": scenario.id,
            "scenario_name": scenario.name,
            "scenario_description": scenario.description,
            "scenario_owner_id": scenario.owner_id,
            "scenario_created_at": scenario.created_at,
            "scenario_status": scenario.status,
        }
        all_scenarios_list.append(scenario_info)
    return jsonify({"scenarios_list":all_scenarios_list})

def scenario_start(scenario_id):

    if ( scenario_id is None ):
        print('missing START scenario_id arg, aborting')
        abort(418)

    print(f'Attempting to START scenario {scenario_id}: ')
    return_obj = start_scenario_task(scenario_id)

    return jsonify({"message": f"scenario {scenario_id} started!", 'return_obj': return_obj})

def scenario_stop(scenario_id):

    if ( scenario_id is None ):
        print('missing STOP scenario_id arg, aborting')
        abort(418)

    print(f'Attempting to STOP scenario {scenario_id}: ')
    return_obj = stop_scenario_task(scenario_id)

    return jsonify({"message": f"scenario {scenario_id} stopped!", 'return_obj': return_obj})

def scenario_update(scenario_id):

    if ( scenario_id is None ):
        print('missing UPDATE scenario_id arg, aborting')
        abort(418)

    return_obj = update_scenario_task(scenario_id)

    return jsonify({"message": f"scenario {scenario_id} updated!", 'return_obj': return_obj})

def scenario_destroy(scenario_id):

    if ( scenario_id is None ):
        print('missing DESTROY scenario_id arg, aborting')
        abort(418)

    print(f'Attempting to DESTROY scenario {scenario_id}: ')
    return_obj = destroy_scenario_task(scenario_id)

    return jsonify({"message": f"scenario {scenario_id} destroyed!", 'return_obj': return_obj})



