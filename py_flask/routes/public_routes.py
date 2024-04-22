from py_flask.config.extensions import db
from flask import (
    Blueprint,
    request,
    jsonify,
    g
)
from py_flask.database.models import Users, Channels, ChannelUsers
from py_flask.utils.chat_utils import getChannelDictList_byUser
from py_flask.utils.auth_utils import register_user, login_er3
from py_flask.database.user_schemas import LoginSchema, RegistrationSchema
from werkzeug.exceptions import abort
from flask import current_app
import secrets

from flask import (
    Blueprint,
    request,
    session,
    jsonify,
    make_response,
)
db_ses = db.session
edurange3_csrf = secrets.token_hex(32)


blueprint_public = Blueprint(
    'edurange3_public', 
    __name__, 
    url_prefix='/api')




@blueprint_public.errorhandler(418)
def custom_error_handler(error):
    response = jsonify({"error": "request pubroute denied"})
    response.status_code = 418
    response.content_type = "application/json"
    return response


@blueprint_public.route("/login", methods=["POST"])
def login_edurange3():
    validation_schema = LoginSchema()  # instantiate validation schema
    validated_data = validation_schema.load(request.json)  # validate login. reject if bad.
    
    validated_user_obj = Users.query.filter_by(username=validated_data["username"]).first()

    if 'X-XSRF-TOKEN' not in session:
        session['X-XSRF-TOKEN'] = secrets.token_hex(32)

    validated_user_dump = validation_schema.dump(vars(validated_user_obj))

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
    else: return jsonify({"message":"user already exists. account NOT registered"})