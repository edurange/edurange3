from py_flask.config.extensions import db, bcrypt
from py_flask.database.models import (
    GroupUsers, 
    Notification,
    ScenarioGroups, 
    Scenarios, 
    StudentGroups, 
    Users, 
    )
from flask_marshmallow import Marshmallow
from marshmallow import (
    fields, 
    Schema, 
    validate, 
    validates,
    ValidationError,
    validates_schema,
    )

from py_flask.utils.error_utils import (
    custom_abort,
    Err_Custom_FullInfo,
)

from marshmallow import Schema, fields, validates, ValidationError
from marshmallow.fields import String, Boolean, Integer
from marshmallow.validate import OneOf, Length, Regexp
ma = Marshmallow()

from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

class LoginSchema(ma.SQLAlchemyAutoSchema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=40))
    password = fields.String(required=True, validate=validate.Length(min=3, max=40))

    @validates_schema
    def validate_login(self, data, **kwargs):
        # Retrieve the user from the database by username
        user = Users.query.filter_by(username=data.get("username")).first()

        # Check if the user was found and if the password is correct
        if user is None:
            raise ValidationError("Invalid username.", fields=['username'])

        if not bcrypt.check_password_hash(user.password, data.get("password")):
            raise ValidationError("Invalid password.", fields=['password'])

        # Output for debugging; remove or replace with logging as appropriate for production
        print('Validation complete for user:', user.id)

    class Meta:
        model = Users



# class LoginSchema(ma.SQLAlchemyAutoSchema):
#     username = fields.String(required=True, validate=[validate.Length(min=3, max=40)])
#     password = fields.String(required=True, validate=[validate.Length(min=3, max=40)])
#     home_channel_id = fields.Integer(validate=validate.Range(min=1), required=False, load_only=True)

#     @validates_schema
#     def validate_login(self, data, **kwargs):
#         username_input = data.get("username")
#         password_plain_input = data.get("password")
#         user = db_ses.query(Users).filter_by(username=username_input).first()

#         if user is None:
#             raise ValidationError("Invalid username.", 'username')

#         if not bcrypt.check_password_hash(user.password, password_plain_input):
#             raise ValidationError("Invalid password.", 'password')

#         print('Validation complete for user:', user.id)

#     class Meta:
#         model = Users


# class LoginSchema(ma.SQLAlchemyAutoSchema):

#     username = String(required=True, validate=[validate.Length(min=3, max=40) ])
#     password = String(required=True, validate=[
#         validate.Length(min=3, max=40),
#         # validate.ContainsNoneOf[]
#         ])
    
#     @validates_schema
#     def validate_login(self, data, **kwargs):

#         username_input = data.get("username")
#         password_plain_input = data.get("password")
#         user = db_ses.query(Users).filter_by(username=username_input).first()
#         home_channel_id = ma.auto_field(validate=validate.Range(min=1), required=False)

#         print('made it to validate schema past db pull for user: ', user.id)
#         print('made it to validate schema past db pull for home_channel_id: ', home_channel_id)

#         if (
#             not user 
#             or not bcrypt.check_password_hash(user.password, password_plain_input)
#             ):
#                 custom_abort("Invalid credentials.", 403)

#     class Meta:
#         model = Users

class RegistrationSchema(ma.SQLAlchemyAutoSchema):
    banned_names = ["root", "ubuntu", "nobody", "ec2user", "user", "student", "guest", '' ]
    
    username = String(required=True, validate=[
        validate.Length(min=3, max=25, error="Username must be between 3 and 25 characters"),
        validate.ContainsNoneOf(banned_names, error="Nice try bucko, use a different name"),
        validate.Regexp('^[a-zA-Z0-9]+$', error="Username must be alphanumeric")
        ])
    
    code = String(required=True, validate=[validate.Length(min=0, max=8)])
    password = String(required=True, validate=[validate.Length(min=6, max=40)])
    confirm_password = String(required=True)
    
    @validates_schema
    def validate_registration(self, data, **kwargs):
        db_ses = db.session
        username_input = data.get("username")
        password_input = data.get("password")
        confirm_password_input = data.get("confirm_password")
        code_input = data.get("code")

        if password_input != confirm_password_input:
            raise ValidationError("Passwords do not match")


        user = db_ses.query(Users).filter_by(username=username_input).first()
        if user != None:
            return Err_Custom_FullInfo('User already exists in database.  Creation aborted.', 400)


        group = db_ses.query(StudentGroups).filter_by(code=code_input).first()

        if group is None:
            return Err_Custom_FullInfo('Student group w/ this code not found, aborting.', 403)

    class Meta:
        model = Users
        

class CreateGroupSchema(Schema):

    group_name = fields.String(required=True, validate=[
        validate.Length(min=3, max=25, error="Group name must be between 3 and 25 characters"),
        validate.Regexp('^[A-Za-z0-9]+(-?[A-Za-z0-9]+)*$', error="Group name must be alphanumeric")
    ])
    should_generate = fields.Boolean(required=True)
    new_user_count = fields.Integer(required=True, validate=validate.Range(min=1, max=100))
    code = fields.String(required=False)

    @validates_schema
    def validate_groupCreate(self, data, **kwargs):
        group_name_input = data.get("group_name")
        existingGroup = db_ses.query(StudentGroups).filter_by(name=group_name_input).first()
        if existingGroup is not None:
            raise ValidationError("Group already exists!", field_names=["group_name"])

    class Meta:
        model = StudentGroups

class UserSchema(Schema):
    username = fields.Str(required=True, validate=[Length(min=3, max=25), Regexp('^[A-Za-z0-9]+$')])

class TestUserListSchema(Schema):
    newUsers_list = fields.List(fields.Nested(UserSchema), required=True)
    @validates_schema
    def validate_usersList(self, data, **kwargs):
        # other custom validations
        pass
