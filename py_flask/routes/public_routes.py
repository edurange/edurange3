from py_flask.config.extensions import db
from flask import (
    Blueprint,
    request,
    jsonify,
    g
)
from py_flask.database.models import Users
from py_flask.utils.auth_utils import login_er3
from py_flask.utils.auth_utils import register_user
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
    validated_data = validation_schema.load(request.json) # validate login. reject if bad.
    
    validated_user_obj = Users.query.filter_by(username=validated_data["username"]).first()

    if 'X-XSRF-TOKEN' not in session:
        session['X-XSRF-TOKEN'] = secrets.token_hex(32)
    
    validated_user_dump = validation_schema.dump(vars(validated_user_obj))
    del validated_user_dump['password']   # remove pw hash from return obj
    # - only db-query-based role check. [`role`] property is soon placed in jwt.
    # - Afterward, role value should be accessed from `g.current_user_role` 
    temp_role = "student"

    if validated_user_dump["is_admin"]: temp_role = "admin"
    elif validated_user_dump["is_instructor"]: temp_role = "instructor"
    del validated_user_dump['is_instructor']
    del validated_user_dump['is_admin']
    
    validated_user_dump['role'] = temp_role

    logged_in_return = login_er3(validated_user_dump)
    
    return logged_in_return

@blueprint_public.route("/register", methods=["POST"])
def registration():
    
    validation_schema = RegistrationSchema()  # instantiate validation schema
    validated_data = validation_schema.load(request.json) # validate registration. reject if bad.
    
    existing_db_user = Users.query.filter_by(username=validated_data["username"]).first()
    
    if existing_db_user is None:
        register_user(validated_data)
        return jsonify({"response":"account successfully registered"})
    else: return jsonify({"response":"user already exists. account NOT registered"})