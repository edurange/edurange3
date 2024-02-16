# -*- coding: utf-8 -*-

# this app.py was previously autoapp.py
# the previous app.py is now config/init.py

"""Create an application instance."""
import os
from py_flask.config.init import create_app
from py_flask.config.extensions import db
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

existing_admin = User.query.limit(1).all()
if not existing_admin: create_admin()

group = StudentGroups.query.limit(1).all()
admin = User.query.filter_by(username=os.environ["FLASK_USERNAME"]).first()
a_id = admin.get_id()

if not group: create_all_group(a_id)