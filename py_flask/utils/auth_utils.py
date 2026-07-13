import json
from datetime import timedelta
from functools import wraps

from flask import (
    current_app,
    g,
    jsonify,
    make_response,
    request,
    session,
    Response,
)
from flask_jwt_extended import create_access_token, decode_token

from py_flask.config.extensions import db
from py_flask.database.models import (
    ChannelUsers,
    Channels,
    GroupUsers,
    StudentGroups,
    Users,
)
from py_flask.utils.error_utils import custom_abort

# Session/JWT lifetime in seconds. Keep in sync with PERMANENT_SESSION_LIFETIME
# in py_flask/config/init.py and `expires_delta` in login_er3 below.
SESSION_LIFETIME_SECONDS = 60 * 60 * 12  # 12 hours
SESSION_LIFETIME = timedelta(seconds=SESSION_LIFETIME_SECONDS)

###########
#  This `@jwt_and_csrf_required()` decorator function should be used on ALL 
#  non-legacy routes except those not requiring login.
#
#  On every successful call it rotates the JWT (fresh `exp` = now + 12h) and
#  re-issues the two auth cookies, so any `/api` activity slides both the JWT
#  and the Flask session (CSRF reference) forward. This keeps a student's
#  browser session alive for as long as they remain active, without forcing
#  periodic polling.
###########
def _rotate_auth_cookies(response):
    """Re-issue fresh `edurange3_jwt` and `X-XSRF-TOKEN` cookies on `response`.

    Routes may return a Flask `Response`, a tuple `(body, status[, headers])`,
    a plain `dict` (auto-jsonified later by Flask), or `None`. Normalize
    everything to a `Response` so we can attach `Set-Cookie` headers without
    breaking the underlying payload.
    """
    if response is None:
        return response
    try:
        if not isinstance(response, Response):
            if isinstance(response, dict):
                # `make_response` does not handle dicts; jsonify first.
                response = make_response(jsonify(response))
            else:
                # Tuples like (jsonify(...), 200) and bare strings are OK.
                response = make_response(response)

        identity = json.dumps({
            "username": g.current_username,
            "user_role": g.current_user_role,
            "user_id": g.current_user_id,
        })
        fresh_token = create_access_token(identity=identity, expires_delta=SESSION_LIFETIME)
        is_secure = not current_app.config.get('DEBUG', False)
        response.set_cookie(
            'edurange3_jwt',
            fresh_token,
            samesite='Lax',
            httponly=True,
            secure=is_secure,
            path='/',
            max_age=SESSION_LIFETIME_SECONDS,
        )
        # Keep the readable CSRF mirror in lockstep with the (rotated) session.
        server_CSRF = session.get('X-XSRF-TOKEN')
        if server_CSRF:
            response.set_cookie(
                'X-XSRF-TOKEN',
                server_CSRF,
                samesite='Lax',
                secure=is_secure,
                path='/',
                max_age=SESSION_LIFETIME_SECONDS,
            )
    except Exception:
        # Rotation must never break the underlying response. On failure we
        # return `response` as Flask received it; the existing auth cookies
        # stay valid until their natural expiry / next successful rotation.
        current_app.logger.exception("Failed to rotate auth cookies")
    return response


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

            validated_jwt_token = decode_token(token)
            decoded_payload = json.loads(validated_jwt_token["sub"])

            g.current_username = decoded_payload["username"]
            g.current_user_id = decoded_payload["user_id"]
            g.current_user_role = decoded_payload["user_role"]
            # Places values in special Flask `g` object which ONLY lasts for life of request
            # The `g` object can be accessed by any routes decorated with jwt_and_csrf_required()
            # To avoid auth 'misses', use the `g` object any time the values are needed

        except Exception as err:
            custom_abort('Invalid Credentials', 403)

        response = fn(*args, **kwargs)
        # Sliding window: roll the JWT cookie forward on every authenticated
        # response. The Flask session cookie is also re-signed because
        # session.permanent is True (see login route) and
        # SESSION_REFRESH_EACH_REQUEST defaults to True.
        return _rotate_auth_cookies(response)
    
    return wrapper

def staff_only():
    if g.current_user_role not in ('staff', 'admin'):
        custom_abort("Insufficient role privileges.", 403)

def admin_only():
    if g.current_user_role != 'admin':
        custom_abort("Insufficient role privileges.", 403)

def login_er3(userObj):
    login_return = make_response(jsonify(userObj))
    token_return = create_access_token(identity=json.dumps({
        "username": userObj["username"],
        "user_role": userObj["role"],
        "user_id": userObj["id"]
    }), expires_delta=SESSION_LIFETIME)

    is_secure = not current_app.config.get('DEBUG', False)

    login_return.set_cookie(
        'edurange3_jwt',
        token_return,
        samesite='Lax',
        httponly=True,
        secure=is_secure,
        path='/',
        max_age=SESSION_LIFETIME_SECONDS,
    )
    login_return.set_cookie(
        'X-XSRF-TOKEN',
        session['X-XSRF-TOKEN'],
        samesite='Lax',
        secure=is_secure,
        path='/',
        max_age=SESSION_LIFETIME_SECONDS,
    )
    return login_return


####
# account utils available to student (e.g. non-staff) routes
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
