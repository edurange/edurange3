



from flask_login import current_user, login_required, login_user, logout_user
from flask import (
    Blueprint,
    request,
    session,
    jsonify,
    g
)

from py_flask.db.models import User,GroupUsers, ScenarioGroups, Scenarios, StudentGroups,  Responses, Notification
from py_flask.config.extensions import db
from py_flask.utils.auth_utils import jwt_and_csrf_required

db_ses = db.session

blueprint_routing_sample = Blueprint(
    'edurange3_public', 
    __name__, 
    url_prefix='/api')

### very simple example (protected) route
@blueprint_routing_sample.route("/edurange3/api/jwt_auth", methods=["POST"]) # DEV_ONLY
@jwt_and_csrf_required
def jwt_auth():
    decoded = g.decoded_jwt_token   # use this to get the decoded jwt token dict/object (use g.decoded_jwt_token, not the decode() method)
    return jsonify({"message": f"Welcome {decoded['sub']}"}) # the original jwt payload is stored in the ['sub'] property...in this case, the username.

@blueprint_routing_sample.route("/edurange3/api/sample", methods=["POST"]) # DEV_ONLY
@jwt_and_csrf_required
def sample_route():

    requestObject = request.json
    reqSecret = requestObject["secret"]

    if reqSecret == "sesame":
        return jsonify({"message": "good job!!"})
    
    return jsonify({"message": "nope"}) # the original jwt payload is stored in the ['sub'] property...in this case, the username.
