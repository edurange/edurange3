
from py_flask.config.extensions import db
from py_flask.database.models import User
from flask import (
    Blueprint,
    request,
    jsonify,
    make_response,
    abort,
    g, # see note
)
from py_flask.utils.tasks import add_numbers_task
from py_flask.config.settings import CELERY_BROKER_URL
from celery import Celery
from py_flask.utils.auth_utils import jwt_and_csrf_required
celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_BROKER_URL)
db_ses = db.session
blueprint_tasks = Blueprint(
    'edurange3_tasks', 
    __name__, 
    url_prefix='/api')

@blueprint_tasks.errorhandler(418)
def custom_error_handler(error):
    response = jsonify({"error": "request denied"})
    response.status_code = 418
    response.content_type = "application/json"
    return response

@blueprint_tasks.route("/task_test", methods=["POST"])
def add_numbers_route():

    requestJSON = request.json 

    num1 = requestJSON['first']
    num2 = requestJSON['second']

    taskreturn = add_numbers_task.delay(num1, num2).get()

    print (taskreturn)
    return jsonify(taskreturn)
