import os
from flask import abort, jsonify, g
from py_flask.utils.auth_utils import register_user
from sqlalchemy.exc import SQLAlchemyError

from py_flask.config.extensions import db
from py_flask.database.models import (
    Users,
    Notification,
    GroupUsers, 
    generate_registration_code
    )

path_to_key = os.path.dirname(os.path.abspath(__file__))


def generateTestAccts(group_db_obj, new_user_count, group_code):

    # group_db_obj is pre-validated direct sqlalchemy db object, not dict
    group_obj_dict = group_db_obj.to_dict()

    generatedUsers = []

    for i in range(new_user_count):
        newPass = generate_registration_code()
        user_dict = {
            'username' : group_obj_dict['name'] + '-' + str(i),
            'password' : newPass,
            'confirm_password' : newPass,
            'code' : group_code,
        }
        user_dict['id'] = register_user(user_dict)
        generatedUsers.append(user_dict)

    return generatedUsers

def addGroupUsers(group_obj, userDict_list):
    db_ses = db.session
    
    assigned_user_ids = []

    for user_dict in userDict_list:
        user_id = user_dict['id']
        user = Users.query.get(user_id)
        if user:
            existing_relations = db_ses.query(GroupUsers).filter_by(user_id=user_id).all()
            for relation in existing_relations:
                db_ses.delete(relation)

            new_relation = GroupUsers(user=user, group=group_obj, group_id=group_obj.id)
            db_ses.add(new_relation)

            assigned_user_ids.append(user_id)
    db_ses.commit()
    return assigned_user_ids


def NotifyCapture(description):
    Notification.create(detail=description)

def NotifyClear():
    notification = Notification.query.all()
    for i in notification:
        i.delete()

def clearGroups(users_to_clear):

    db_ses = db.session

    cleared_user_ids = []
    for user_id in users_to_clear:
        user = Users.query.get(user_id)
        if user:
            existing_relations = db_ses.query(GroupUsers).filter_by(user_id=user_id).all()
            for relation in existing_relations:
                db_ses.delete(relation)
                cleared_user_ids.append(user_id)
    db_ses.commit()
    return cleared_user_ids


def deleteUsers(users_to_delete):

    try:
        db_ses = db.session
        
        clearedUsers = clearGroups(users_to_delete)
        deleted_users = []
        for user_id in clearedUsers:
            user = db_ses.query(Users).filter(Users.id == user_id).first()
            if user:
                db_ses.delete(user)
                deleted_users.append(user_id)

        db_ses.commit()
        return deleted_users

    except SQLAlchemyError as e:
        db_ses.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500