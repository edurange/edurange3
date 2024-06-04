from py_flask.config.extensions import db
from py_flask.database.models import Users, Channels, ChannelUsers, ChatMessages
from py_flask.utils.chat_utils import getChannelDictList_byUser
from py_flask.utils.auth_utils import jwt_and_csrf_required
from py_flask.database.chat_schemas import ChatMessage_Schema, ThreadUID_Schema
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
edurange3_csrf = secrets.token_hex(32)


blueprint_chat = Blueprint(
    'edurange3_chat', 
    __name__, 
    url_prefix='/api')


@blueprint_chat.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):

    # log full error, including traceback
    current_app.logger.error(f"SQLAlchemy Error: {error}\n{traceback.format_exc()}")

    # return detail in debug mode or generic error message in prod
    if current_app.config['DEBUG']:
        response_error = Err_Custom_FullInfo(f"Database error occurred: {str(error)}", 500)
    
    else: response_error = Err_Custom_FullInfo(f"Database error occurred.", 500)

    return response_error

# catch-all handler
@blueprint_chat.errorhandler(Exception)
def general_error_handler(err_message, err_code):

    status_code = 500
    error_message = "Unknown error."

    if err_code is not None: status_code = err_code
    if err_message is not None: error_message = err_message

    error_handler = Err_Custom_FullInfo(error_message, status_code)
    return error_handler.get_response()


@blueprint_chat.route("/add_message", methods=["POST"])
@jwt_and_csrf_required
def add_message():

    try: req_message_obj = request.json['message_obj']
    except KeyError: req_message_obj = None

    if req_message_obj is None:
        return Err_Custom_FullInfo('"message_obj" property missing from Request', 400)

    validation_schema = ChatMessage_Schema()  
    validated_message_data = validation_schema.load(req_message_obj)  # validate supplied message obj. reject if bad.
    
    return_obj = {}

    return 0
    return return_obj

@blueprint_chat.route("/get_thread", methods=["POST"])
@jwt_and_csrf_required
def get_thread():

    db_ses = db.session

    try: req_root_thread_uid = request.json['root_thread_uid']
    except KeyError: req_root_thread_uid = None

    validation_schema = ThreadUID_Schema() # ONLY checks that input is 12 alphanums, reject if not
    threadUID_alphanumsOnly = validation_schema.load({"root_thread_uid": req_root_thread_uid})  

    thread_messages_raw = db_ses.query(ChatMessages).filter_by(root_thread_uid=threadUID_alphanumsOnly['root_thread_uid']).all()

    return jsonify([message.to_dict() for message in thread_messages_raw])

    
    