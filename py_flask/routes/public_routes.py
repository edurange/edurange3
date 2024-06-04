from py_flask.config.extensions import db
from py_flask.database.models import Users, Channels, ChannelUsers
from py_flask.utils.chat_utils import getChannelDictList_byUser
from py_flask.utils.auth_utils import register_user, login_er3
from py_flask.database.user_schemas import LoginSchema, RegistrationSchema
import secrets
import traceback

from sqlalchemy.exc import SQLAlchemyError

from py_flask.utils.error_utils import (
    Err_Custom_FullInfo
)

from flask import (
    Blueprint,
    request,
    session,
    jsonify,
    current_app,
)
db_ses = db.session
edurange3_csrf = secrets.token_hex(32)


blueprint_public = Blueprint(
    'edurange3_public', 
    __name__, 
    url_prefix='/api')


@blueprint_public.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):

    # log full error, including traceback
    current_app.logger.error(f"SQLAlchemy Error: {error}\n{traceback.format_exc()}")

    # return detail in debug mode or generic error message in prod
    if current_app.config['DEBUG']:
        response_error = Err_Custom_FullInfo(f"Database error occurred: {str(error)}", 500)
    
    else: response_error = Err_Custom_FullInfo(f"Database error occurred.", 500)

    return response_error

# catch-all handler
@blueprint_public.errorhandler(Exception)
def general_error_handler(err_message, err_code):

    status_code = 500
    error_message = "Unknown error."

    if err_code is not None: status_code = err_code
    if err_message is not None: error_message = err_message

    error_handler = Err_Custom_FullInfo(error_message, status_code)
    return error_handler.get_response()



@blueprint_public.route("/login", methods=["POST"])
def login_edurange3():
    validation_schema = LoginSchema()  # instantiate validation schema

    print('trying to login with: ', request.json)
    validated_data = validation_schema.load(request.json)  # validate login. reject if bad.
    
    validated_user_obj = Users.query.filter_by(username=validated_data["username"]).first()

    if 'X-XSRF-TOKEN' not in session:
        session['X-XSRF-TOKEN'] = secrets.token_hex(32)

    validated_user_dump = validation_schema.dump(vars(validated_user_obj))

    if not validated_user_dump:
        return (Err_Custom_FullInfo("User not found", 404))

    chan_data = getChannelDictList_byUser(validated_user_dump['id'], validated_user_dump['username'])

    validated_user_dump['channel_data'] = chan_data
    
    del validated_user_dump['password']

    temp_role = "student"
    if validated_user_dump.get("is_admin"): temp_role = "admin"
    elif validated_user_dump.get("is_instructor"): temp_role = "instructor"
    validated_user_dump['role'] = temp_role

    logged_in_return = login_er3(validated_user_dump)

    return logged_in_return


@blueprint_public.route("/register", methods=["POST"])
def registration():
    
    validation_schema = RegistrationSchema()  # instantiate validation schema
    validated_data = validation_schema.load(request.json) # validate registration. reject if bad.
    
    existing_db_user = Users.query.filter_by(username=validated_data["username"]).first()

    if existing_db_user is None:
        retObj = register_user(validated_data)
        newChan = retObj['channel']
        newUser_id = retObj['user_id']
        return jsonify({
            "message":"account successfully registered",
            "user_id": newUser_id,
            })
    
    else: return (Err_Custom_FullInfo('User already exists.  Account NOT registered!', 409))