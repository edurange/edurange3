import os

from py_flask.config.extensions import db
from py_flask.database.models import (
    Users,
    Notification,
    GroupUsers, 
    ChannelUsers,
    Channels,
    generate_registration_code
    )

path_to_key = os.path.dirname(os.path.abspath(__file__))



    # ARCHIVE CHAT MESSAGES (LIST OF USER DICT OBJS)
    # ARCHIVE RESPONSES (LIST OF USER DICT OBJS)
    # ARCHIVE BASH HISTORY (LIST OF USER DICT OBJS)

def archive_chat_forUsers(userDicts_list):
    return 0
def archive_responses_forUsers(userDicts_list):
    return 0
def archive_bashHistory_forUsers(userDicts_list):
    return 0