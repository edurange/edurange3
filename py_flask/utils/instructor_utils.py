import os
from py_flask.utils.auth_utils import register_user
from sqlalchemy.exc import SQLAlchemyError

from py_flask.config.extensions import db
from py_flask.database.models import (
    Users,
    Notification,
    GroupUsers, 
    ChannelUsers,
    Channels,
    ChatMessages,
    BashHistory,
    Responses,
    generate_registration_code
    )
from py_flask.database.db_classes import Edu3Mixin

path_to_key = os.path.dirname(os.path.abspath(__file__))


def generateTestAccts(group_db_obj, new_user_count, group_code):

    # group_db_obj is pre-validated direct sqlalchemy db object, not dict
    group_obj_dict = group_db_obj.to_dict()

    generatedUsers = []

    for i in range(new_user_count):
        newPass = generate_registration_code()
        user_dict = {
            'username' : group_obj_dict['name'] + str(i),
            'password' : newPass,
            'confirm_password' : newPass,
            'code' : group_code,
        }
        retObj = register_user(user_dict)
        newUser_id = retObj['user_id']
        user_dict['id'] = newUser_id
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

def clearChannels(users_to_clear):
    db_ses = db.session

    cleared_user_ids = []
    for user_id in users_to_clear:

        user = Users.query.get(user_id)

        if not user: continue 

        ChannelUsers.query.filter_by(user_id=user_id).delete()
        Channels.query.filter_by(owner_id=user_id).delete()
        Channels.query.filter_by(name=user.username).delete()

        cleared_user_ids.append(user_id)

    db_ses.commit()

    return cleared_user_ids


def deleteUsers(users_to_delete):

    # ARCHIVE CHAT MESSAGES (FOR USER)
    # ARCHIVE RESPONSES (FOR USER)
    # ARCHIVE BASH HISTORY (FOR USER)

    # DELETE CHAT MESSAGES (FOR USER)
    # DELETE RESPONSES (FOR USER)
    # DELETE BASH HISTORY (FOR USER)

    # DELETE USER FROM CHANNELUSER TABLE
    # DELETE CHANNEL FROM CHANNELS TABLE WHERE OWNER = USERNAME
    # DELETE USER FROM GROUPUSERS TABLE

    # DELETE GROUP IF OWNED BY USER (USUALLY NOT)
    # DELETE SCENARIO IF OWNED BY USER (USUALLY NOT)
    # DELETE SCENARIO GROUP IF OWNED BY USER (USUALLY NOT)

    # DELETE USER

    try:
        db_ses = db.session
        
        clearGroups(users_to_delete)
        clearChannels(users_to_delete)
        deleted_users = []
        for user_id in users_to_delete:
            user = db_ses.query(Users).filter(Users.id == int(user_id)).first()
            if user:
                db_ses.delete(user)
                deleted_users.append(int(user_id))
            else: print ('deleteUser_error: user not found')
        db_ses.commit()
        return deleted_users

    except SQLAlchemyError as e:
        print('error deleting user: ', e)
        db_ses.rollback()
        return []

def getLogs(optional_user_id=None):
    method = "first" if optional_user_id else "all"

    def get_logsTable(model):
        query_result = model.query.filter_by(user_id=optional_user_id) if optional_user_id else model.query
        return getattr(query_result, method)()

    chatLogs = get_logsTable(ChatMessages)
    bashLogs = get_logsTable(BashHistory)
    responseLogs = get_logsTable(Responses)

    returnDict = {
        "chat": Edu3Mixin.to_list(chatLogs),
        "bash": Edu3Mixin.to_list(bashLogs),
        "responses": Edu3Mixin.to_list(responseLogs)
    }
    return returnDict