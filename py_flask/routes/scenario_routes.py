"""Student View API routes."""

from py_flask.config.extensions import db
from py_flask.database.models import (
    GroupUsers, 
    ScenarioGroups, 
    Scenarios, 
    Responses, 
    User,
    StudentGroups,  
)
import json
from py_flask.utils.scenario_utils import (
     identify_state
)
# from py_flask.utils.role_utils import get_roles, scenario_exists, student_has_access
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
    response = jsonify({"error": "request denied"})
    response.status_code = 418
    response.content_type = "application/json"
    return response

### Reviewed / Working Routes  ##############

@blueprint_scenarios.route('/get_content/<int:i>', methods=['GET']) # WIP
@jwt_and_csrf_required
def get_content(i):
    current_username = g.current_username
    current_scenario_id = i
    if (
        not isinstance(current_scenario_id, int)
        or i < 0 
        or i > 99
        ):
            return jsonify({'error': 'invalid scenario ID'}), 418 # DEV_ONLY (replace with standard denial msg)

    contentJSON, credentialsJSON, unique_name = getContent(current_scenario_id, current_username)

    meta = getScenarioMeta(current_scenario_id)

    if not credentialsJSON or not unique_name:
        return jsonify({"error": f"scenario with id {i} is found, build failed"}), 418 # DEV_ONLY
    
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
            Scenarios.description.label("type"),
            Scenarios.status.label("status"),
            StudentGroups.name.label("gname"),
            Scenarios.created_at.label("created_at"),
            Scenarios.owner_id.label("owner_id"),
            User.username.label("iname"),)
                .filter(GroupUsers.user_id == g.current_user_id)
                .filter(StudentGroups.id == GroupUsers.group_id)
                .filter(User.id == StudentGroups.owner_id)
                .filter(ScenarioGroups.group_id == StudentGroups.id)
                .filter(Scenarios.id == ScenarioGroups.scenario_id))
    
    # get the scenario objects which have the ids in the scenario_ids list
    myScenarios = []
    for entry in scenarioTable:

        scenario_info = {
            "scenario_id": entry.id,
            "scenario_name": entry.sname,
            "scenario_description": entry.type,
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
    print(requestJSON)
    current_user_id = g.current_user_id
    question_num = int(requestJSON['question_num'])
    scenario_id = int(requestJSON['scenario_id'])
    student_response = requestJSON['student_response']
    print(question_num)
    print(scenario_id)
    print(student_response)

    pointsAwarded = evaluateResponse (current_user_id, scenario_id, question_num, student_response )
    return jsonify({"points_gained" : pointsAwarded})

### UNReviewed Routes Below ##############

# @blueprint_scenarios.route('/get_docker_info/<int:i>', methods=['GET']) # WIP
# @jwt_and_csrf_required
# def get_docker_info(i):
#     current_username = g.current_username
#     current_scenario_id = i