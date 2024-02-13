# -*- coding: utf-8 -*-

# this was previously `autoapp.py`

"""Create an application instance."""
from py_flask.config.init import create_app
from py_flask.config.extensions import db
import os
from datetime import datetime

from flask import session
from flask_login import current_user

# from app import create_app
from py_flask.database.models import StudentGroups, User

app = create_app()
app.app_context().push()
db.create_all()

def create_admin():
    username = os.environ["FLASK_USERNAME"]
    password = os.environ["PASSWORD"]
    User.create(
        username=username,
        password=password,
        active=True,
        is_admin=True,
        is_instructor=True,
    )


def create_all_group(id):
    StudentGroups.create(name="ALL", owner_id=id, code="", hidden=True)


admin_exists = User.query.limit(1).all()

if not admin_exists:
    create_admin()

group = StudentGroups.query.limit(1).all()
admin = User.query.filter_by(username=os.environ["FLASK_USERNAME"]).first()
a_id = admin.get_id()
if not group:
    create_all_group(a_id)
