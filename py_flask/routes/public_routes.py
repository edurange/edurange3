from py_flask.config.extensions import db
from py_flask.database.models import Users, Channels, ChannelUsers, FeedbackMessage
from py_flask.utils.chat_utils import getChannelDictList_byUser
from py_flask.utils.auth_utils import register_user, login_er3
from py_flask.database.user_schemas import LoginSchema, RegistrationSchema
import secrets
import traceback
from sqlalchemy.future import select
from datetime import timedelta

from sqlalchemy.exc import SQLAlchemyError

from py_flask.utils.error_utils import (
    custom_abort
)
import jwt
from datetime import datetime, timedelta
from quart import Blueprint, request, session, jsonify, current_app
from quart import (
    Blueprint,
    request,
    session,
    jsonify,
    current_app,
    make_response
)
# db_ses = db.session
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
        custom_abort(f"Database error occurred: {str(error)}", 500)
    else: custom_abort(f"Database error occurred.", 500)

@blueprint_public.errorhandler(Exception)
def general_error_handler(error):
    error_handler = custom_abort(error)
    return error_handler.get_response()

from py_flask.config.extensions import AsyncSessionLocal

from quart import Blueprint, request, session, jsonify
from py_flask.config.extensions import bcrypt, AsyncSessionLocal
from py_flask.database.models import Users
from py_flask.utils.error_utils import custom_abort
import secrets

blueprint_public = Blueprint('edurange3_public', __name__, url_prefix='/api')


@blueprint_public.route("/login", methods=["POST"])
async def login_edurange3():
    reqJSON = await request.get_json()
    username = reqJSON.get("username")
    password = reqJSON.get("password")

    async with AsyncSessionLocal() as db_ses:
        result = await db_ses.execute(select(Users).where(Users.username == username))
        user = result.scalar_one_or_none()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return custom_abort("Invalid credentials.", 403)

    if "X-XSRF-TOKEN" not in session:
        session["X-XSRF-TOKEN"] = secrets.token_hex(32)

    validated_user_data = {
        "id": user.id,
        "username": user.username,
        "is_admin": user.is_admin,
        "is_staff": user.is_staff,
        "channel_data": await getChannelDictList_byUser(user.id, user.username),
        "role": "admin" if user.is_admin else "staff" if user.is_staff else "student",
    }

    # Create the JWT token
    payload = {
        "identity": {
            "username": validated_user_data["username"],
            "user_role": validated_user_data["role"],
            "user_id": validated_user_data["id"]
        },
        "exp": datetime.utcnow() + current_app.config["JWT_EXPIRATION_DELTA"]
    }
    access_token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm=current_app.config["JWT_ALGORITHM"])

    # Prepare response with JWT
    response = jsonify(validated_user_data)
    response.set_cookie(
        "edurange3_jwt",
        access_token,
        samesite="Lax",
        httponly=True,
        secure=True,
        path="/"
    )
    response.set_cookie(
        "X-XSRF-TOKEN",
        session["X-XSRF-TOKEN"],
        samesite="Lax",
        secure=True,
        path="/"
    )

    return response

@blueprint_public.route("/logout", methods=["POST"])
async def logout():

    response_data = {"message": f"User has been successfully logged out."}
    response = await make_response(jsonify(response_data))

    response.set_cookie('edurange3_jwt', '', expires=0, samesite='Lax', httponly=True, path='/')
    response.set_cookie('X-XSRF-TOKEN', '', expires=0, samesite='Lax', path='/')
    
    return response

@blueprint_public.route("/register", methods=["POST"])
def registration():
    
    validation_schema = RegistrationSchema()  # instantiate validation schema
    validated_data = validation_schema.load(request.json) # validate registration. reject if bad.
    
    existing_db_user = Users.query.filter_by(username=validated_data["username"]).first()

    if existing_db_user is None:
        retObj = register_user(validated_data)
        newChan = retObj['channel_id']
        newUser_id = retObj['user_id']
        return jsonify({
            "message":"account successfully registered",
            "user_id": newUser_id,
            "channel_id": newChan.id
        })
    
    else: custom_abort('User already exists.  Account NOT registered!', 409)

@blueprint_public.route("/error_test", methods=["POST"])
def error_test():
    custom_abort('test error back at ya', 400)
    return jsonify({'response': 'you shouldnt see this'})

@blueprint_public.route("/feedback", methods=["POST"])
def submit_feedback():

    requestJSON = request.json
    db_ses = db.session
    scenario_type = requestJSON['scenario_type'] if requestJSON['scenario_type'] else 'NONE'
    content = requestJSON['content']

    new_message = FeedbackMessage (
        scenario_type = scenario_type,
        content = content
    )
    
    db_ses.add(new_message)
    db_ses.commit()

    return jsonify(
        {'scenario_type': scenario_type, 'content': content}
        )
