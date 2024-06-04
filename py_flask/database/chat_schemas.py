from py_flask.config.extensions import db, bcrypt
from py_flask.database.models import (
    ChatMessages
    )
from flask_marshmallow import Marshmallow
from marshmallow import (
    validate,
    validates_schema,
    )
from marshmallow.fields import String, Integer, DateTime
ma = Marshmallow()
from py_flask.utils.error_utils import Err_Custom_FullInfo
from marshmallow import validates, ValidationError, fields
import marshmallow.validate as validate

class ChatMessage_Schema(ma.SQLAlchemyAutoSchema):

    user_id = Integer(required=True, validate=[validate.Length(min=1, max=40) ])
    scenario_type = String(required=True, validate=[validate.Length(min=1, max=40) ])
    scenario_id = Integer(required=True, validate=[validate.Length(min=1, max=4) ])
    channel_id = Integer(required=True, validate=[validate.Length(min=1, max=4) ])
    timestamp = DateTime(required=True)
    content = String(required=True, validate=[validate.Length(min=1, max=1000) ])

    thread_uid = String(required=True, validate=[validate.Length(12) ])
    message_uid = String(required=True, validate=[validate.Length(12) ])
    parent_uid = String(required=True, validate=[validate.Length(12) ])
    # child_uid_array = fields.List(fields.String(validate=[validate.Length(equal=12), validate.Regexp(r'^[a-zA-Z0-9]*$')]), validate=validate.Length(min=0))
    child_uid_array = fields.List(fields.String())
    # child_uid_array = String(required=True, validate=[validate.Length(min=3, max=40) ])
    
    @validates_schema
    def validate_message(self, data, **kwargs):

        db_ses = db.session

        # user_id_input = data.get("user_id")
        # scenario_type_input = data.get("scenario_type")
        # scenario_id_input = data.get("scenario_id")
        # channel_id_input = data.get("channel_id")
        # scenario_id_input = data.get("scenario_id")
        # timestamp_input = data.get("timestamp")
        # content_input = data.get("content")
        # thread_uid_input = data.get("thread_uid")
        # message_uid_input = data.get("message_uid")
        # parent_uid_input = data.get("parent_uid")
        # child_uid_array_input = data.get("child_uid_array")

    class Meta:
        model = ChatMessages

class ThreadUID_Schema(ma.SQLAlchemyAutoSchema):
    thread_uid = ma.String(required=True, validate=validate.Length(equal=12))

    @validates('thread_uid')
    def validate_thread_uid(self, value):
        if not value.isalnum():
            raise Err_Custom_FullInfo("Thread UID must be 12 alphanums.", 400)
