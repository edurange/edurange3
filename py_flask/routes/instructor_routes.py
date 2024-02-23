from sqlalchemy.exc import SQLAlchemyError
from py_flask.database.user_schemas import CreateGroupSchema, TestUserListSchema
from py_flask.database.models import Users, StudentGroups, ScenarioGroups, GroupUsers
from py_flask.utils.dataBuilder import get_group_data, get_user_data, get_scenario_data
from py_flask.config.extensions import db
from flask import (
    Blueprint,
    request,
    jsonify,
    g
)
from py_flask.utils.scenario_utils import (
     identify_state
)
from py_flask.utils.guide_utils import (
    getContent, 
    getScenarioMeta,
    evaluateResponse
    )
from py_flask.utils.auth_utils import jwt_and_csrf_required, instructor_only
from py_flask.utils.instructor_utils import generateTestAccts, addGroupUsers
from py_flask.database.models import generate_registration_code as grc
from py_flask.utils.instructor_utils import (
    list_all_scenarios, 
    scenario_create, 
    scenario_start,
    scenario_stop,
    scenario_update,
    scenario_destroy
    )
from werkzeug.exceptions import abort

from py_flask.utils.instructorData_utils import get_instructorData
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

blueprint_instructor = Blueprint(
    'edurange3_instructor',
    __name__, 
    url_prefix='/api')

@blueprint_instructor.errorhandler(418)
def custom_error_handler(error):
    response = jsonify({"error": "request denied"})
    response.status_code = 418
    response.content_type = "application/json"
    return response


# TESTED AND WORKING ROUTES
@blueprint_instructor.route("/create_group", methods=['POST'])
@jwt_and_csrf_required
def create_group():
    instructor_only()

    requestJSON = request.json

    createGroup_schema = CreateGroupSchema()
    validatedJSON = createGroup_schema.load(requestJSON)    

    group_name = validatedJSON['group_name']
    new_code = grc()

    group_obj = StudentGroups.create(name=group_name, owner_id=g.current_user_id, code=new_code)
    # group_obj_dict = group_obj.to_dict()

    if (validatedJSON['should_generate']):

        newUsers_list = generateTestAccts(group_obj, validatedJSON['new_user_count'], new_code)
        return_groupDict = addGroupUsers(group_obj, newUsers_list)
        return_groupDict['users'] = newUsers_list

        print("RETDICT: ",return_groupDict)
        return {
            "message": f"userGroup {group_name} created and {len(newUsers_list)} test accts created",
            'group_obj': return_groupDict,
        }
    return {
            "message":f"userGroup {group_name} created", 
            'group_obj':return_groupDict
        }


@blueprint_instructor.route("/get_instructor_data", methods=['GET'])
@jwt_and_csrf_required
def get_instructor_data():
    instructor_only()

    retObj = {
        'groups': get_group_data(),
        'users': get_user_data(),
        'scenarios': get_scenario_data(),
    }
        # 'instructor_data': get_instructorData()
    return jsonify(retObj)


@blueprint_instructor.route('/get_instr_content/<int:i>', methods=['GET']) # WIP
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

    # if not credentialsJSON or not unique_name:
    #     return jsonify({"error": f"scenario with id {i} is found, build failed"})
    
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


@blueprint_instructor.route("/scenario_interface", methods=["POST"])
@jwt_and_csrf_required
def scenario_interface():
    instructor_only()

    requestJSON = request.json
    if ('METHOD' not in requestJSON):
        return jsonify({'message':'method not found'}), 418

    method = requestJSON['METHOD']
    if method not in ('LIST','CREATE', 'START', 'STOP', 'UPDATE', 'DESTROY'):
        return jsonify({'message':'wrong method given'}), 418

    def list_scenarios(requestJSON):
        print("Performing LIST method")
        scenario_list = list_all_scenarios(requestJSON)
        return scenario_list

    def create_scenario(requestJSON):   
        print("Performing CREATE method")
        if ("type" not in requestJSON or "name" not in requestJSON):
            return jsonify({'message':'missing type or name arg'}), 418
        scenario_type = requestJSON["type"]
        scenario_name = requestJSON["name"]
        scenario_group_name = requestJSON["group_name"]
        scenario_users = scenario_create(scenario_type, scenario_name, scenario_group_name)
        if (scenario_users != None):
            print("CREATE method success")
            return scenario_users
        else: 
            print ("Scenario CREATE failed")
            return None


    def start_scenario(requestJSON):
        print("Performing START method")
        if ("scenario_id" not in requestJSON):
            return jsonify({'message':'missing scenario_id'}), 418
        scenario_id = requestJSON["scenario_id"]
        returnObj = scenario_start(scenario_id)
        if (returnObj != None):
            print("START method success")
            return returnObj
        else: 
            print ("Scenario START failed")
            return None
        
    def stop_scenario(requestJSON):
        print("Performing STOP method")
        if ("scenario_id" not in requestJSON):
            return jsonify({'message':'missing scenario_id'}), 418
        scenario_id = requestJSON["scenario_id"]
        returnObj = scenario_stop(scenario_id)
        if (returnObj != None):
            print("STOP method success")
            return returnObj
        else: 
            print ("Scenario STOP failed")
            return None

    def update_scenario(requestJSON):
        print("Performing UPDATE method")
        if ("scenario_id" not in requestJSON):
            return jsonify({'message':'missing scenario_id'}), 418
        scenario_id = requestJSON["scenario_id"]
        returnObj = scenario_update(scenario_id)
        if (returnObj != None):
            print("UPDATE method success")
            return returnObj
        else: 
            print ("Scenario UPDATE failed")
            return None

    def destroy_scenario(requestJSON):
        print("Performing DESTROY method")
        if ("scenario_id" not in requestJSON):
            return jsonify({'message':'missing scenario_id'}), 418
        scenario_id = requestJSON["scenario_id"]
        returnObj = scenario_destroy(scenario_id)
        if (returnObj != None):
            print("DESTROY method success")
            return returnObj
        else: 
            print ("Scenario DESTROY failed")
            return None

    method_switch = {
        "LIST": list_scenarios,
        "CREATE": create_scenario,
        "START": start_scenario,
        "STOP": stop_scenario,
        "UPDATE": update_scenario,
        "DESTROY": destroy_scenario,
    }

    methodToUse = method_switch[method]
    returnJSON = methodToUse(requestJSON)

    return (returnJSON)

# UNTESTED / WIP ROUTES
@blueprint_instructor.route("/delete_group", methods=['POST'])
@jwt_and_csrf_required
def delete_group():
    instructor_only()
    
    db_ses = db.session

    group_name = request.json.get('group_name')


    student_group = db_ses.query(StudentGroups).filter(StudentGroups.name == group_name).first()
    group_id = student_group.id
    group_scenarios = db_ses.query(ScenarioGroups).filter(ScenarioGroups.group_id == group_id).first()
    group_users = db_ses.query(GroupUsers).filter(GroupUsers.group_id == group_id).all()

    if group_scenarios is not None:
        jsonify({"message":"Cannot delete group - Are there still scenarios for this group?"})
    else:
        players = []
        for user in group_users:
            players.append(db_ses.query(Users).filter(Users.id == user.id).first())
            user.delete()
        for plr in players:
            if plr is not None:
                if plr.is_static:
                    plr.delete()
        student_group.delete()
    return jsonify({
        "message":"Successfully deleted group",
        "group_name": group_name
        })


@blueprint_instructor.route("/delete_user", methods=['POST'])
@jwt_and_csrf_required
def delete_user():
    instructor_only()

    try:
        requestJSON = request.json 
        user_to_delete = requestJSON.get('user_to_delete')

        if not user_to_delete:
            return jsonify({"message": "Missing required argument 'user_to_delete', delete aborted"}), 400

        db_ses = db.session
        user = db_ses.query(Users).filter(Users.name == user_to_delete).first()
        
        if not user:
            return jsonify({"message": f"Cannot delete user - does username {user_to_delete} exist?"}), 404
        else:
            db_ses.delete(user)
            db_ses.commit()
            return jsonify({"message": f"Successfully deleted user {user_to_delete}"})

    except SQLAlchemyError as e:
        db_ses.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500