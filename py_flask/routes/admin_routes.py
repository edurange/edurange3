from sqlalchemy.exc import SQLAlchemyError
import traceback
from py_flask.database.models import Users, TA_Assignments, ScenarioGroups, GroupUsers, Scenarios
from py_flask.config.extensions import db
from quart import (
    Blueprint,
    request,
    jsonify,
    g,
    current_app
)

from py_flask.utils.auth_utils import jwt_and_csrf_required, admin_only

from py_flask.utils.error_utils import (
    custom_abort
)
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

blueprint_admin = Blueprint(
    'edurange3_admin',
    __name__, 
    url_prefix='/api')

@blueprint_admin.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):

    current_app.logger.error(f"SQLAlchemy Error: {error}\n{traceback.format_exc()}")
    if current_app.config['DEBUG']:
        custom_abort(f"Database error occurred: {str(error)}", 500)
    else: custom_abort(f"Database error occurred.", 500)

@blueprint_admin.errorhandler(Exception)
def general_error_handler(error): 
    error_handler = custom_abort(error)
    return error_handler.get_response()

def editRole(userID_list, is_promoting):
    
    db_ses = db.session
    editedUsers_idList = []

    for user_id in userID_list:
        user = Users.query.get(user_id)
        if user:
            user.is_staff = is_promoting
            db_ses.commit()
            editedUsers_idList.append(user_id)

    return {
        'result': 'success',
        'updated_user_list': editedUsers_idList,
        'is_promoting': is_promoting
        }

@blueprint_admin.route("/edit_role", methods=['POST'])
@jwt_and_csrf_required
def edit_role():
    admin_only()

    requestJSON = request.json

    users_idList = requestJSON['users_to_edit']
    is_promoting = requestJSON['is_promoting']

    if not users_idList or is_promoting is None:
        custom_abort('users_to_edit property required', 400)

    returnObj = editRole(users_idList, is_promoting)
        
    return jsonify(returnObj)
