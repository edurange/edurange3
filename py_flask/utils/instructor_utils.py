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
from py_flask.utils.chat_utils import gen_chat_names

from py_flask.config.extensions import db
from py_flask.database.models import (
    Scenarios, User, 
    Responses, Notification, 
    StudentGroups, GroupUsers, 
    generate_registration_code)
from py_flask.utils.tasks import (
    create_scenario_task, 
    start_scenario_task, 
    stop_scenario_task, 
    update_scenario_task,
    destroy_scenario_task,
    CreateScenarioTask,
)

path_to_key = os.path.dirname(os.path.abspath(__file__))

## whole file is currently WIP 1/17/24 -Jonah (exoriparian)

# def generate_registration_code(size=8, chars=string.ascii_lowercase + string.digits):
#     return "".join(random.choice(chars) for _ in range(size))

# - INSTRUCTOR: GENERATE GENERIC USER ACCTS FOR EXISTING GROUP
def generateTestAccts(group_db_obj, new_user_count, group_code):
    # group_db_obj is pre-validated direct sqlalchemy db object, not dict

    group_obj_dict = group_db_obj.to_dict()

    generatedUsers = []
    for i in range(new_user_count):

        newPass = generate_registration_code()
        user_dict = {
            'username' : group_obj_dict['name'] + '-' + str(i),
            'password' : newPass,
            'confirm_password' : newPass,
            'code' : group_code,
        }

        user_dict['id'] = register_user(user_dict)
        generatedUsers.append(user_dict)


    return generatedUsers

def addGroupUsers(group_obj, userDict_list):

    db_ses = db.session
    group_id = group_obj.id

    for user_dict in userDict_list:
        user_id = user_dict['id']

        existing_relation = db_ses.query(GroupUsers).filter_by(user_id=user_id, group_id=group_id).first()
        if existing_relation is None:
            new_relation = GroupUsers(user_id=user_id, group_id=group_id)
            db_ses.add(new_relation)
    db_ses.commit()
    return userDict_list


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
    students_list = (
        db_ses.query(User.username)
        .filter(StudentGroups.name == studentGroup_name)
        .filter(StudentGroups.id == GroupUsers.group_id)
        .filter(GroupUsers.user_id == User.id)
        .all()
    )
    for i, s in enumerate(students_list):
        students_list[i] = s._asdict()

    print ('CREATE SCENARIO 1')
    Scenarios.create(name=scenario_name, description=scenario_type, owner_id=owner_user_id)
    NotifyCapture(f"Scenario {scenario_name} has been created.")
    
    scen_id_dbList = db_ses.query(Scenarios.id).filter(Scenarios.name == scenario_name).first()
    print ('CREATE SCENARIO 2, SCENARIO ID: ', scen_id_dbList)
    
    scenario_id = list(scen_id_dbList._asdict().values())[0]
    print ('CREATE SCENARIO 3, scenario_id: ', scenario_id)

    scenario = Scenarios.query.filter_by(id=scenario_id).first()
    print ('CREATE SCENARIO 4, scenario: ', scenario)
    scenario.update(status=7)
    
    group_id = db_ses.query(StudentGroups.id).filter(StudentGroups.name == studentGroup_name).first()
    group_id = group_id._asdict()
    
    print ('CREATE SCENARIO 5, group_id: ', group_id)
    
    student_ids = db_ses.query(GroupUsers.id).filter(GroupUsers.group_id == group_id['id']).all()
    namedict = gen_chat_names(student_ids, scenario_id)
    print ('CREATE SCENARIO 5, namedict: ', namedict)

    if ( scenario_name is None \
        or scenario_type is None\
        or owner_user_id is None\
        or students_list is None\
        or group_id is None\
        or scenario_id is None\
        or namedict is None
    ):
        print('missing create arg, aborting')
        abort(418)

    print ('CREATE SCENARIO 6, Attempting to create scenario w/ args: ')
    print(f"name: {scenario_name}")
    print(f"s_type: {scenario_type}")
    print(f"own_id: {owner_user_id}")
    print(f"students_list: {students_list}")
    print(f"group_id: {group_id}")
    print(f"scenario_id: {scenario_id}")
    print(f"namedict: {namedict}")

    create_scenario_task.delay(scenario_name, scenario_type, owner_user_id, students_list, group_id, scenario_id, namedict)
    
    students_return = [{'username': student['username']} for student in students_list]
    print ('CREATE SCENARIO 7, students_return: ', students_return)
    return jsonify({"student_list": students_return})

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



