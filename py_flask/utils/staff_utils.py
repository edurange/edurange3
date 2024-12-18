import os
from py_flask.utils.auth_utils import register_user
from sqlalchemy.exc import SQLAlchemyError
from py_flask.utils.error_utils import custom_abort
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
    TA_Assignments,
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

def edit_taAssignments(students_idList, ta_id, is_assigning):
    if is_assigning is None:
        custom_abort('is_assigning bool not provided', 400)

    db_ses = db.session
    ta_dbObj = Users.query.get(ta_id)
    if not ta_dbObj:
        custom_abort('TA not found', 404)

    assignedUsers_idList = []

    for user_id in students_idList:
        user_dbObj = Users.query.get(user_id)
        if not user_dbObj:
            continue
        
        existing_studentTAlink = TA_Assignments.query.filter_by(student_id=user_id, ta_id=ta_id).first()

        if is_assigning:
            if not existing_studentTAlink:
                new_assignment = TA_Assignments(student_id=user_id, ta_id=ta_id)
                db_ses.add(new_assignment)
                assignedUsers_idList.append(user_id)
        else:
            if existing_studentTAlink:
                db_ses.delete(existing_studentTAlink)
                assignedUsers_idList.append(user_id)

    db_ses.commit()

    return {
        'result': 'success',
        'assignedUsers_idList': assignedUsers_idList,
        'ta_id': ta_id,
        'is_assigning': is_assigning
    }



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
    
    def get_logsTable(model):
        method = "first" if optional_user_id else "all"
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

def getRecentLogs(student_id, number_of_logs):

    def get_logsTable(model):
        query = model.query.filter_by(user_id=student_id)
        return query.order_by(model.timestamp.desc()).limit(number_of_logs).all()
    
    bashLogs = get_logsTable(BashHistory)
    chatLogs = get_logsTable(ChatMessages)
    responseLogs = get_logsTable(Responses)

    returnDict = {
        "bash": [{"index": i, "bashEntry": log.to_dict().get('input')} for i, log in enumerate(bashLogs)],
        "chat": [{"index": i, "chatEntry": log.to_dict().get('content')} for i, log in enumerate(chatLogs)],
        "responses": [{"index": i, "responsesEntry": log.to_dict().get('content')} for i, log in enumerate(responseLogs)]
    }

    return returnDict
    

