from py_flask.config.extensions import db

from flask import (
    request,
    session,
    jsonify,
    make_response,
    g
)
from datetime import timedelta

from functools import wraps
from py_flask.database.models import GroupUsers, StudentGroups, Users, Channels, ChannelUsers
from flask_jwt_extended import create_access_token, decode_token

from py_flask.utils.error_utils import (
    custom_abort,
)
###########
#  This `@jwt_and_csrf_required()` decorator function should be used on ALL 
#  non-legacy routes except those not requiring login.
###########
def jwt_and_csrf_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        
        # CSRF check (dev)
        client_CSRF = request.cookies.get('X-XSRF-TOKEN')
        if not client_CSRF: return jsonify({"error": "no client csrf request denied"}), 403
        server_CSRF = session.get('X-XSRF-TOKEN')
        if not server_CSRF: return jsonify({"error": "no server csrf request denied"}), 403
        if client_CSRF != server_CSRF:  return jsonify({"error": "csrf bad match"}), 403
        
        # JWT check
        token = request.cookies.get('edurange3_jwt')
        if not token: return jsonify({"error": "jwt request denied"}), 403
        try:

            validated_jwt_token = decode_token(token)  # check if signature still valid
            decoded_payload = validated_jwt_token["sub"]

            g.current_username = decoded_payload["username"]  
            g.current_user_id = decoded_payload["user_id"] 
            g.current_user_role = decoded_payload["user_role"] 
            # Places values in special Flask `g` object which ONLY lasts for life of request
            # The `g` object can be accessed by any routes decorated with jwt_and_csrf_required()
            # To avoid auth 'misses', use the `g` object any time the values are needed

        except Exception as err:
            custom_abort('Invalid Credentials', 403)

        return fn(*args, **kwargs)
    
    return wrapper

def instructor_only():
    if g.current_user_role not in ('instructor', 'admin'):
        custom_abort("Insufficient role privileges.", 403)

def admin_only():
    if g.current_user_role != 'admin':
        custom_abort("Insufficient role privileges.", 403)

def login_er3(userObj):

    login_return = make_response(jsonify(userObj))
    # generate JWT and encode these values. (NOT hidden from user)
    # note: 'identity' is a payload keyword for Flask-JWT-Extended. best to leave it
    token_return = create_access_token(identity=(
        {  
        "username": userObj["username"],
        "user_role": userObj["role"],
        "user_id": userObj["id"]
        }
        
        ), expires_delta=timedelta(hours=12))
    
    # httponly=True - mitigates XSS attacks by 'blinding' client to the JWT
    login_return.set_cookie(
        'edurange3_jwt',
        token_return, 
        samesite='Lax', 
        httponly=True,
        secure=True,
        path='/'
    )

    # CSRF token: mitigate JWT/session related CSRF attacks
    # no httponly=True ; JS needs access to value
    login_return.set_cookie(
        'X-XSRF-TOKEN', 
        session['X-XSRF-TOKEN'], 
        samesite='Lax',
        secure=True,
        path='/'
    )
    return login_return


####
# account utils available to student (e.g. non-instructor) routes
####


# create student account (add to postgreSQL db)
def register_user(validated_registration_data):
    db_ses = db.session
    data = validated_registration_data

    group = StudentGroups.query.filter_by(code=data["code"]).first()
    if group is None:
        return jsonify({"error": "group matching this code not found"}), 404

    new_user = Users(
        username=data["username"],
        password=data["password"], # automatically hashed
        active=True,
    )
    db_ses.add(new_user)
    db_ses.commit()

    this_user = Users.query.filter_by(username=data["username"]).first()
    if not this_user:
        return jsonify({"error": "User registration failed"}), 500
    
    # create new channel w/ this user_id as owner_id and PK (id)
    new_channel = Channels(
        name=this_user.username, # owner username as channel.name default
        owner_id=this_user.id
    )
    db_ses.add(new_channel)
    db_ses.commit()

    # new channel_users row w/ this_user_id as channel_id and this_user_id as user_id
    new_channel_user = ChannelUsers(
        user_id=this_user.id,
        channel_id=new_channel.id  # Use the newly created channel's ID
    )
    db_ses.add(new_channel_user)
    db_ses.commit()

    # new GroupUsers entry
    new_group_user = GroupUsers(
        user_id=this_user.id,
        group_id=group.id  # ID from the existing group
    )
    db_ses.add(new_group_user)
    db_ses.commit()

    retObj = {
        "user_id": this_user.id,
        "channel_id": new_channel.id
    }
    return retObj