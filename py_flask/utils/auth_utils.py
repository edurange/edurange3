from flask import (
    request,
    session,
    jsonify,
    make_response,
    g
)

from functools import wraps
from py_flask.database.models import GroupUsers, StudentGroups, User
from flask_jwt_extended import create_access_token, decode_token

###########
#  This `@jwt_and_csrf_required()` decorator function should be used on ALL 
#  non-legacy routes except those not requiring login.
###########
def jwt_and_csrf_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        
        # CSRF check (dev)
        client_CSRF = request.cookies.get('X-XSRF-TOKEN')
        if not client_CSRF: return jsonify({"error": "no client csrf request denied"}), 418
        server_CSRF = session.get('X-XSRF-TOKEN')
        if not server_CSRF: return jsonify({"error": "no server csrf request denied"}), 418
        if client_CSRF != server_CSRF:  return jsonify({"error": "csrf bad match"}), 418
        
        
        # CSRF check (prod)
        # client_CSRF = request.headers.get('X-CSRFToken')
        # edurange3_csrf = session.get('X-XSRF-TOKEN')
        # if (
        #     not edurange3_csrf
        #     or not client_CSRF
        #     or client_CSRF != edurange3_csrf):
        #         return jsonify({"error": "csrf request denied"}), 418
        
        # JWT check
        token = request.cookies.get('edurange3_jwt')
        if not token: return jsonify({"error": "jwt request denied"}), 418
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
            return jsonify({"error": "some request denied"}), 418

        return fn(*args, **kwargs)
    
    return wrapper

# returns true if argument is an element of this tuple, false otherwise.
def instructor_only():
    if g.current_user_role not in ('instructor', 'admin'):
        return jsonify({"error": "insufficient role privileges"}), 418

def login_er3(userObj):

    login_return = make_response(jsonify(userObj))
    # generates JWT and encodes these values. (NOT hidden from user)
    # note: 'identity' is a payload keyword for Flask-JWT-Simple. best to leave it
    token_return = create_access_token(identity=({  
        "username": userObj["username"],
        "user_role": userObj["role"],
        "user_id": userObj["id"]
        }))
    
    # httponly=True ; this property mitigates XSS attacks by 'blinding' JS to the value
    login_return.set_cookie(
        'edurange3_jwt', 
        token_return, 
        samesite='Lax', 
        httponly=True,
        secure=True,
        path='/'
    )
    # mitigate JWT/session related CSRF attacks
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
    data = validated_registration_data
    User.create(
            username=data["username"],
            password=data["password"],
            active=True,
    )
    
    # won't work unless provided code matches the code for an existing group
    group = StudentGroups.query.filter_by(code=data["code"]).first()
    user = User.query.filter_by(username=data["username"]).first()
    group_id = group.get_id()
    user_id = user.get_id()
    GroupUsers.create(user_id=user_id, group_id=group_id)

    return user_id

    
# delete account (Add here)