"""Student View API routes."""
import os
from py_flask.config.extensions import db
from py_flask.database.models import (
    GroupUsers, 
    ScenarioGroups, 
    Scenarios,
    Responses,
    Users,
    StudentGroups,  
)
import json
from py_flask.utils.scenario_utils import (
     identify_state
)

from flask import (
    Blueprint,
    request,
    jsonify,
    current_app,
    g, ## see note
)
from py_flask.utils.auth_utils import jwt_and_csrf_required
from py_flask.utils.guide_utils import (
    getContent, 
    getScenarioMeta,
    evaluateResponse
    )


#######
# The `g` object is a global flask object that lasts ONLY for the life of a single request.
#
# The following values are populated when the jwt_and_csrf_required() function is invoked,
# if the request passes auth:
#   g.current_username
#   g.current_user_id
#   g.current_user_role
#
# You must import the `g` object from Flask, which will be the same instance of `g` as first 
# accessed by jwt_and_csrf_required().  
# 
# You must also import jwt_and_csrf_required() from auth_utils.py and include it as a decorator
# on any route where those values would be needed (i.e., an auth protected route)
#
# The values will then be available to routes that use the @jwt_and_csrf_required decorator.
#
# To ensure no accidental auth 'misses', always use these 3 variables to obtain these values, 
# rather than parsing the values yourself by way of request body or directly from the JWT.  
# That way, the values will always return null if the request hasn't been fully authenticated 
# (i.e. if you forgot to use the decorator).
#######

db_ses = db.session
blueprint_scenarios = Blueprint(
    'edurange3_scenario', 
    __name__, 
    url_prefix='/api')

@blueprint_scenarios.errorhandler(418)
def custom_error_handler(error):
    response = jsonify({"error": error})
    response.status_code = 418
    response.content_type = "application/json"
    return response

### Reviewed / Working Routes  ##############

@blueprint_scenarios.route('/get_content/<int:i>', methods=['GET']) # WIP
@jwt_and_csrf_required
def get_content(i):
    current_scenario_id = i
    if (
        not isinstance(current_scenario_id, int)
        or i < 0 
        or i > 999
        ):
            return jsonify({'error': 'invalid scenario ID'}) # DEV_ONLY (replace with standard denial msg)

    contentJSON, credentialsJSON, unique_name = getContent(g.current_user_role, current_scenario_id, g.current_username)

    meta = getScenarioMeta(current_scenario_id)

    if not credentialsJSON or not unique_name:
        return jsonify({"error": f"scenario with id {i} is found, build failed"})
    
    SSH_connections = identify_state(unique_name, "Started")
    SSH_IP = ""

    # IMPORTANT
    # we are assuming every scenario has only ONE port that does not include the string 'HIDDEN',
    # and that this is the port users should connect to w/ SSH to start scenario
    for (key,val) in SSH_connections.items():
        if "HIDDEN" not in val:
            SSH_IP = val

    return jsonify({
        "scenario_meta": meta,
        "contentJSON":contentJSON, 
        "credentialsJSON":credentialsJSON,
        "unique_scenario_name":unique_name,
        "SSH_IP": SSH_IP
        })


@blueprint_scenarios.route('/get_group_scenarios', methods=['GET'])
@jwt_and_csrf_required
def get_scenarios():
    
    db_ses = db.session
    group_id = db_ses.query(GroupUsers.group_id).filter(GroupUsers.user_id == g.current_user_id).first()
    
    if group_id == None:
        return jsonify({"scenarios_list":[]})
    
    filter_group_id = group_id[0]

    # query for all entries with the given 'group_id' value
    grp_db_scenarios = db_ses.query(ScenarioGroups).filter(ScenarioGroups.group_id == filter_group_id).all()
    
    scenario_ids = [entry.id for entry in grp_db_scenarios]
    scenarioTable = (
        db_ses.query(
            Scenarios.id,
            Scenarios.name.label("sname"),
            Scenarios.scenario_type.label("scenario_type"),
            Scenarios.status.label("status"),
            StudentGroups.name.label("gname"),
            Scenarios.created_at.label("created_at"),
            Scenarios.owner_id.label("owner_id"),
            Users.username.label("iname"),)
                .filter(GroupUsers.user_id == g.current_user_id)
                .filter(StudentGroups.id == GroupUsers.group_id)
                .filter(Users.id == StudentGroups.owner_id)
                .filter(ScenarioGroups.group_id == StudentGroups.id)
                .filter(Scenarios.id == ScenarioGroups.scenario_id))
    
    # get the scenario objects which have the ids in the scenario_ids list
    myScenarios = []
    for entry in scenarioTable:

        scenario_info = {
            "scenario_id": entry.id,
            "scenario_name": entry.sname,
            "scenario_type": entry.scenario_type,
            "scenario_owner_id": entry.owner_id,
            "scenario_created_at": entry.created_at,
            "scenario_status": entry.status,
        }
        myScenarios.append(scenario_info)

    return jsonify({"scenarios_list":myScenarios})

@blueprint_scenarios.route('/check_response', methods=['POST'])
@jwt_and_csrf_required
def checkResponse():
    requestJSON = request.json
    current_user_id = g.current_user_id
    question_num = int(requestJSON['question_num'])
    this_scenario_id = int(requestJSON['scenario_id'])
    this_student_response = requestJSON['student_response']
    this_scenario_type = (requestJSON['scenario_type'])

    with open('./logs/logs_id.txt', 'r') as log_id_file:
        this_logs_id = log_id_file.read().rstrip()
    
    gradedResponse = evaluateResponse (current_user_id, this_scenario_id, question_num, this_student_response )

    pointsScored = 0
    pointsPossible = 0

    for i, response in enumerate(gradedResponse):
        pointsScored += response["points_awarded"]
        pointsPossible += response["points_possible"]

    Responses.create(
        user_id=current_user_id,
        question_number=question_num,
        content=this_student_response,
        points_awarded=pointsScored,
        points_possible=pointsPossible,
        scenario_id=this_scenario_id,
        scenario_type=this_scenario_type,
        logs_id=this_logs_id,
    )
    
    return jsonify(gradedResponse)

@blueprint_scenarios.route('/get_responses_byStudent', methods=['POST'])
@jwt_and_csrf_required
def get_responses_byStudent():

    requestJSON = request.json
    this_scenario_id = int(requestJSON['scenario_id'])
    
    db_ses = db.session
    

    current_responses = (db_ses.query(
        Responses.id,
        Responses.points_awarded,
        Responses.points_possible,
        Responses.question_number, 
        Responses.timestamp,
        Responses.user_id,
        Responses.scenario_id,
        Responses.content,
    ) 
    .filter(Responses.user_id == g.current_user_id) 
    .filter(Responses.scenario_id == this_scenario_id))
    
    responses_dict = {}

    for response in current_responses:

        if response.question_number in responses_dict:
            best_attempt = responses_dict[response.question_number]['points_awarded']
        else:
            best_attempt = 0

        if response.points_awarded > best_attempt:
            responseObj = {
                "points_awarded": response.points_awarded,
                "points_possible": response.points_possible,
                "content": response.content,
                "timestamp": response.timestamp
            }
            responses_dict[response.question_number] = responseObj

    return jsonify(responses_dict)


### UNReviewed Routes Below ##############

# @blueprint_scenarios.route('/get_docker_info/<int:i>', methods=['GET']) # WIP
# @jwt_and_csrf_required
# def get_docker_info(i):
#     current_username = g.current_username
#     current_scenario_id = i
