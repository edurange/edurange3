
from py_flask.config.extensions import db
from py_flask.database.models import Users
from flask import (
    Blueprint,
    request,
    jsonify,
    make_response,
    g, # see note
    current_app
)
import traceback

from py_flask.utils.auth_utils import jwt_and_csrf_required
from py_flask.utils.chat_utils import getChannelDictList_byUser, getChatHistory_byUser
from sqlalchemy.exc import SQLAlchemyError
# from machine_learning.local_slm.phi_3_slm import generate_hint
from py_flask.utils.tasks import request_and_generate_hint

from py_flask.utils.error_utils import (
    custom_abort,
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
blueprint_student = Blueprint(
    'edurange3_student', 
    __name__, 
    url_prefix='/api')


@blueprint_student.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):
    current_app.logger.error(f"SQLAlchemy Error: {error}\n{traceback.format_exc()}")
    if current_app.config['DEBUG']:
        custom_abort(f"Database error occurred: {str(error)}", 500)
    else: custom_abort(f"Database error occurred.", 500)

# catch-all handler
@blueprint_student.errorhandler(Exception)
def general_error_handler(error):
    status_code = getattr(error, 'status_code', 500)
    error_handler = custom_abort(error.message, status_code)
    return error_handler.get_response()


@blueprint_student.route("/logout", methods=["POST"])
@jwt_and_csrf_required
def logout():
    current_username = g.current_username

    response_data = {"message": f"User {current_username} has been successfully logged out."}
    response = make_response(jsonify(response_data))

    response.set_cookie('edurange3_jwt', '', expires=0, samesite='Lax', httponly=True, path='/')
    response.set_cookie('X-XSRF-TOKEN', '', expires=0, samesite='Lax', path='/')
    
    return response


@blueprint_student.route('/get_identity', methods=['GET']) # DEV_ONLY
@jwt_and_csrf_required
def get_identity():

    current_username = g.current_username
    current_user_id = g.current_user_id
    current_user_role = g.current_user_role

    return jsonify({
        'message': 'Welcome',
        'username': current_username,
        'user_id' : current_user_id,
        'user_role': current_user_role
    })

@blueprint_student.route('/get_chat_history', methods=['GET'])
@jwt_and_csrf_required
def get_chat_history():

    chatHistory_dictList = getChatHistory_byUser(g.current_user_id, g.current_username)
    return jsonify({'chat_history': chatHistory_dictList})


# @blueprint_student.route("/get_hint", methods=['POST'])
# @jwt_and_csrf_required
# def get_hint():

#     requestJSON = request.json
    
#     print('reqJSON: ', requestJSON)
#     this_scenario_type = "file_wrangler"
#     # this_scenario_type = requestJSON["scenario_type"]
#     this_username=g.current_username

#     print('get_hint using scenario type: ', this_scenario_type)

#     generated_hint = request_and_generate_hint.delay(this_scenario_type, this_username).get(timeout=None)
    
#     generated_hint = generated_hint['generated_hint']
#     print('generated hint: ',generated_hint)

#     return jsonify({'generated_hint': generated_hint})
#     # return {
#     #         "scen_type": this_scenario_type,
#     #         "username": this_username,
#     #         "generated_hint": generated_hint
#     #     }
    

