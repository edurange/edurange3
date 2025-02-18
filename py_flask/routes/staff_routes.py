from sqlalchemy.exc import SQLAlchemyError
import traceback
from py_flask.database.user_schemas import CreateGroupSchema, TestUserListSchema
from py_flask.database.models import Users, StudentGroups, ScenarioGroups, GroupUsers, Scenarios, TA_Assignments
from py_flask.utils.dataBuilder import get_group_data, get_user_data, get_scenario_data, get_taAssignment_data
from py_flask.config.extensions import db
from py_flask.utils.chat_utils import gen_chat_names, getChatLibrary
from py_flask.utils.common_utils import get_system_resources
import redis
import json

from flask import (
    Blueprint,
    request,
    jsonify,
    g,
    current_app
)
from py_flask.utils.scenario_utils import (
     identify_state
)
from py_flask.utils.guide_utils import (
    getContent, 
    getScenarioMeta,
    )
from py_flask.utils.auth_utils import jwt_and_csrf_required, staff_only
from py_flask.utils.staff_utils import generateTestAccts, addGroupUsers
from py_flask.database.models import generate_registration_code as grc
from py_flask.utils.staff_utils import (
    clearGroups,
    deleteUsers,
    NotifyCapture,
    getLogs,
    edit_taAssignments
    )
from py_flask.utils.tasks import (
    create_scenario_task, 
    start_scenario_task, 
    stop_scenario_task, 
    update_scenario_task,
    destroy_scenario_task,
    get_recent_student_logs_task,
    query_small_language_model_task,
    initialize_system_resources_task,
    update_system_resources_task,
    cancel_generate_hint_task
)
from py_flask.utils.error_utils import (
    custom_abort
)

from py_flask.utils.staffData_utils import get_staffData
import subprocess

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

blueprint_staff = Blueprint(
    'edurange3_staff',
    __name__, 
    url_prefix='/api')

@blueprint_staff.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):

    current_app.logger.error(f"SQLAlchemy Error: {error}\n{traceback.format_exc()}")
    if current_app.config['DEBUG']:
        custom_abort(f"Database error occurred: {str(error)}", 500)
    else: custom_abort(f"Database error occurred.", 500)

# catch-all handler
@blueprint_staff.errorhandler(Exception)
def general_error_handler(error):
    error_handler = custom_abort(error)
    return error_handler.get_response()

# TESTED AND WORKING ROUTES
@blueprint_staff.route("/create_group", methods=['POST'])
@jwt_and_csrf_required
def create_group():
    staff_only()

    requestJSON = request.json

    createGroup_schema = CreateGroupSchema()
    validatedJSON = createGroup_schema.load(requestJSON)    

    group_name = validatedJSON['group_name']
    new_code = grc()

    group_obj = StudentGroups.create(name=group_name, owner_id=g.current_user_id, code=new_code)
    # add admin to all groups on creation
    addGroupUsers(group_obj, [{"id" : 1}])
    

    if (validatedJSON['should_generate']):

        newUsers_list = generateTestAccts(group_obj, validatedJSON['new_user_count'], new_code)
        addGroupUsers(group_obj, newUsers_list)

        return {
            "result": "success",
            "group_obj": group_obj.to_dict(),
            'new_users': newUsers_list,
        }
    return {
            "result": "success",
            "group_obj": group_obj.to_dict(),
        }


@blueprint_staff.route("/get_logs", methods=['GET'])
@jwt_and_csrf_required
def get_logs():
    staff_only()

    try:
        logData = getLogs()
        if logData is None:
            raise custom_abort({
                'message': 'Error retrieving logs',
                'status_code': 400
            })
        return jsonify(logData)
    except custom_abort as err:
        return err.get_response()
    except Exception as err:
        generic_error = custom_abort({'message': str(err), 'status_code': 500})
        return generic_error.get_response()

@blueprint_staff.route("/get_staff_data", methods=['GET'])
@jwt_and_csrf_required
def get_staff_data():
    staff_only()

    gd = get_group_data()
    ud = get_user_data()
    sd = get_scenario_data()
    td = get_taAssignment_data()
    logData = getLogs()

    return_obj = {
        'groups': gd,
        'users': ud,
        'scenarios': sd,
        'logs' : logData,
        'ta_assignments': td
    }
    return jsonify(return_obj)

@blueprint_staff.route('/get_instr_content/<int:i>', methods=['GET']) # WIP
@jwt_and_csrf_required
def get_instr_content(i):
    staff_only()
    current_scenario_id = i

    if (
        not isinstance(current_scenario_id, int)
        or i < 0 
        or i > 999
        ):
            custom_abort('invalid scenario ID', 404)

    contentJSON, credentialsJSON, unique_name = getContent(g.current_user_role, current_scenario_id, g.current_username)

    meta = getScenarioMeta(current_scenario_id)
    
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


@blueprint_staff.route("/scenario_interface", methods=["POST"])
@jwt_and_csrf_required
def scenario_interface():
    staff_only()

    requestJSON = request.json
    if ('METHOD' not in requestJSON):
        return custom_abort('METHOD property not supplied in request.', 400)

    method = requestJSON['METHOD']
    if method not in ('LIST','CREATE', 'START', 'STOP', 'UPDATE', 'DESTROY'):
        return custom_abort(f'Unrecognized METHOD property: {method}', 400)

    def list_scenarios():

        db_ses = db.session
        all_scenarios = db_ses.query(Scenarios).all()
        all_scenarios_list = []
        for scenario in all_scenarios:
            scenario_info = {
                "scenario_id": scenario.id,
                "scenario_name": scenario.name,
                "scenario_type": scenario.scenario_type,
                "scenario_owner_id": scenario.owner_id,
                "scenario_created_at": scenario.created_at,
                "scenario_status": scenario.status,
            }
            all_scenarios_list.append(scenario_info)
        return jsonify({"result": "success","scenarios_list":all_scenarios_list})
 
    def create_scenario(requestJSON):

        if (
            "type" not in requestJSON 
            or "name" not in requestJSON
            or "group_name" not in requestJSON
            ):
            return custom_abort('Required argument for create_scenario was not supplied.', 400)
        scenario_type = requestJSON["type"]
        scenario_name = requestJSON["name"]
        scenario_group_name = requestJSON["group_name"]

        db_ses = db.session
        owner_user_id = g.current_user_id
        students_list = (
            db_ses.query(Users.username)
            .filter(StudentGroups.name == scenario_group_name)
            .filter(StudentGroups.id == GroupUsers.group_id)
            .filter(GroupUsers.user_id == Users.id)
            .all()
        )
        for i, s in enumerate(students_list):
            students_list[i] = s._asdict()

        Scenarios.create(name=scenario_name, scenario_type=scenario_type, owner_id=owner_user_id)
        NotifyCapture(f"Scenario {scenario_name} has been created.")
    
        scen_id_dbList = db_ses.query(Scenarios.id).filter(Scenarios.name == scenario_name).first()
        scenario_id = list(scen_id_dbList._asdict().values())[0]
        scenario = Scenarios.query.filter_by(id=scenario_id).first()
        scenario.update(status=7)
        
        group_id = db_ses.query(StudentGroups.id).filter(StudentGroups.name == scenario_group_name).first()
        group_id = group_id._asdict()
        
        student_ids = db_ses.query(GroupUsers.id).filter(GroupUsers.group_id == group_id['id']).all()
        namedict = gen_chat_names(student_ids, scenario_id)

        if ( scenario_name is None \
            or scenario_type is None\
            or owner_user_id is None\
            or students_list is None\
            or group_id is None\
            or scenario_id is None\
            or namedict is None
        ):
            return custom_abort('Required argument for create_scenario_task was None.', 400)


        returnObj = create_scenario_task.delay(scenario_name, scenario_type, students_list, group_id, scenario_id).get(timeout=None)
        returnObj['students_return'] = [{'username': student['username']} for student in students_list]

        if (returnObj != None): return returnObj

        else:
            return custom_abort("Scenario CREATE failed", 500)

    def start_scenario(requestJSON):

        scenario_id = requestJSON["scenario_id"]
        if not scenario_id:
            return custom_abort("Required request property scenario_id was None", 400)

        return_obj = start_scenario_task.delay(scenario_id).get(timeout=None)

        if (return_obj != None):
            return return_obj
        else: 
            print ("Scenario START failed")
            return None
        
    def stop_scenario(requestJSON):
        if ("scenario_id" not in requestJSON):
            return custom_abort("Required request property scenario_id was None", 400)
        
        scenario_id = requestJSON["scenario_id"]
        return_obj = stop_scenario_task(scenario_id)
        if (return_obj != None):
            return return_obj
        else: 
            print ("Scenario STOP failed")
            return None

    def update_scenario(requestJSON):
        if ("scenario_id" not in requestJSON):
            return custom_abort("Required request property scenario_id was None", 400)
        scenario_id = requestJSON["scenario_id"]
        
        return_obj = update_scenario_task.delay(scenario_id).get(timeout=None)
        if (return_obj != None):
            return return_obj
        else: 
            print ("Scenario UPDATE failed")
            return None

    def destroy_scenario(requestJSON):
        if ("scenario_id" not in requestJSON):
            return custom_abort("Required request property scenario_id was None", 400)

        scenario_id = requestJSON["scenario_id"]
        return_obj = destroy_scenario_task.delay(scenario_id).get(timeout=None)
        if (return_obj != None):
            return return_obj
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


@blueprint_staff.route("/delete_group", methods=['POST'])
@jwt_and_csrf_required
def delete_group():
    staff_only()
    
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


@blueprint_staff.route("/delete_users", methods=['POST'])
@jwt_and_csrf_required
def delete_users():
    staff_only()

    requestJSON = request.json
    users_to_delete = requestJSON.get('users_to_delete')
    if not users_to_delete:
        return custom_abort("Missing required argument 'users_to_delete', delete aborted", 400)
    
    # deleteUsers() clears user's group association before deleting
    deleted_users = deleteUsers(users_to_delete)

    if len(deleted_users) > 0:
        return jsonify({
            'deleted_users': deleted_users,
            "result": 'success'})
    else:
        return jsonify({
            'deleted_users': [],
            "result": 'failure'})

@blueprint_staff.route("/assign_group_users", methods=['POST'])
@jwt_and_csrf_required
def assign_group_users():
    staff_only()

    requestJSON = request.json

    group_id = requestJSON['group_id']
    userDict_list = requestJSON['users_to_assign']

    group_obj = StudentGroups.query.get(group_id)
    if not group_obj:
        return jsonify({'result': 'error', 'message': 'Group not found'}), 404

    assigned_user_ids = addGroupUsers(group_obj, userDict_list)
    
    return jsonify({'result': 'success', 'assigned_user_ids': assigned_user_ids})


@blueprint_staff.route("/clear_groups", methods=['POST'])
@jwt_and_csrf_required
def clear_groups():
    staff_only()

    users_to_clear = request.json['users_to_clear']
    clearedUserIDs = clearGroups(users_to_clear)
    cleared_user_ids = [int(user_id) for user_id in clearedUserIDs]

    return jsonify({'result': 'success', 'cleared_user_ids': cleared_user_ids})

@blueprint_staff.route("/get_chat_library", methods=['GET'])
@jwt_and_csrf_required
def get_chat_library():
    staff_only()

    # chatHistoryData_dict contains: "unordered_messages_list", "user_channels_dict"
    chatHistoryData_dict = getChatLibrary()
    return jsonify(chatHistoryData_dict)


@blueprint_staff.route("/edit_ta_assignments", methods=['POST'])
@jwt_and_csrf_required
def edit_ta_assignments():
    staff_only()

    requestJSON = request.json

    ta_id = requestJSON.get('ta_id')
    userID_list = requestJSON.get('users_to_assign')
    is_assigning = requestJSON.get('is_assigning')

    returnDict = edit_taAssignments(userID_list, ta_id, is_assigning)
    return jsonify(returnDict)

#TODO: A lot
@blueprint_staff.route("/add_user_to_container", methods=['POST'])
def add_user_to_container():
    requestJSON = request.json

    username = g.current_username
    scenario_name = requestJSON['scenario_name']

    docker_query = f"docker ps -q --filter={scenario_name}"
    container_list = subprocess.run(docker_query.split(' '))
    
    containers = container_list.split("\n")

    # for i, c in enumerate(containers):
        # do not use - pseudocode
        # internal_command = f"useradd --home-dir /home/USERNAME --create-home --shell /bin/bash --password $(echo PASSWORD | openssl passwd -1 -stdin) USERNAME"
        # os.system(f"docker exec {internal_command} {c}")


@blueprint_staff.route("/query_slm", methods=['POST'])
@jwt_and_csrf_required
def query_small_language_model():
    requestJSON = request.json

    this_task = requestJSON['task']
    
    this_scenario_name = requestJSON.get('scenario_name', None)
    this_disable_scenario_context = requestJSON.get('disable_scenario_context', None)
    this_temperature = requestJSON.get('temperature', None)
    this_max_tokens = requestJSON.get('max_tokens', None)
    this_system_prompt = requestJSON.get('system_prompt', None)
    this_user_prompt = requestJSON.get('user_prompt', None)

    generation_parameters = {
        'scenario_name': this_scenario_name, 
        'disable_scenario_context': this_disable_scenario_context, 
        'temperature': this_temperature, 
        'max_tokens': this_max_tokens, 
        'system_prompt': this_system_prompt, 
        'user_prompt': this_user_prompt
    }
     
    response = query_small_language_model_task.delay(task=this_task, generation_parameters=generation_parameters).get(timeout=None)
    
    return jsonify(response)

@blueprint_staff.route("/get_student_logs", methods=['POST'])
@jwt_and_csrf_required
def get_recent_student_logs_route():
    requestJSON = request.json
    
    this_student_id = requestJSON["student_id"]
    this_number_of_logs = 3

    logs_dict = get_recent_student_logs_task.delay(this_student_id, this_number_of_logs).get(timeout=None)
    
    return jsonify(logs_dict)

@blueprint_staff.route("/update_model", methods=['POST'])
@jwt_and_csrf_required
def update_model_route():
    
    requestJSON = request.json

    try: 
        this_cpu_resources_selected = int(requestJSON["this_cpu_resources_selected"])
        this_gpu_resources_selected = int(requestJSON["this_gpu_resources_selected"])
        
        if this_cpu_resources_selected is None:
            raise Exception (f"ERROR: cpu_resources is type None: Additional error reporting information: [{e}]")
        
        if this_gpu_resources_selected is None:
            raise Exception (f"ERROR: gpu_resources is type None: Additional error reporting information: [{e}]")
        
    except Exception as e:
        raise Exception (f"ERROR: Failed to assign cpu/gpu resources. Additional error reporting information: [{e}]")

    try:
        update_model_task.delay(this_cpu_resources_selected, this_gpu_resources_selected)
        return jsonify({'Status': 'Model reinitialized successfully'})

    except Exception as e:
        return jsonify({f'Error': 'Model failed to initialize '})

@blueprint_staff.route("/cancel_hint", methods=['POST'])
@jwt_and_csrf_required
def cancel_generate_hint_route(): 
    cancel_hint_response = cancel_generate_hint_celery.delay().get(timeout=None)
    
    return jsonify({'cancel_hint_req_status': response})

@blueprint_staff.route("/get_resources", methods=['POST'])
@jwt_and_csrf_required

def get_resources():

    sys_db_redis_client = redis.Redis(host='localhost', port=6379, db=1)

    cpu_resources_detected = sys_db_redis_client.get("cpu_resources")
    gpu_resources_detected = sys_db_redis_client.get("gpu_resources")

    cpu_resources_detected_int = int(cpu_resources_detected)
    gpu_resources_detected_int = int(gpu_resources_detected)


    return jsonify({'cpu_resources_detected': cpu_resources_detected_int, 'gpu_resources_detected': gpu_resources_detected_int})

