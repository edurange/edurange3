# -*- coding: utf-8 -*-
"""User models."""
import datetime as dt
import random
import string
from sqlalchemy import inspect

from py_flask.database.db_classes import (
    Column,
    Model,
    SurrogatePK,
    db,
    reference_col,
    relationship,
    Edu3Mixin
)
from py_flask.config.extensions import bcrypt

def generate_registration_code(size=8, chars=string.ascii_lowercase + string.digits):
    return "".join(random.choice(chars) for _ in range(size))


class StudentGroups(Edu3Mixin, SurrogatePK, Model):
    """"Groups of Users"""
    __tablename__ = "groups"
    name = Column(db.String(40), unique=True, nullable=False)
    owner_id = reference_col("users", nullable=False)
    owner = relationship("Users", backref="groups")
    code = Column(
        db.String(8), unique=True, nullable=True, default=generate_registration_code()
    )
    hidden = Column(db.Boolean(), nullable=False, default=False)
    users = relationship("GroupUsers", backref="groups", cascade="all, delete-orphan")

class GroupUsers(Edu3Mixin, SurrogatePK, Model):
    """Users belong to groups"""
    ___tablename___ = "group_users"
    user_id = reference_col("users", nullable=False)
    user = relationship("Users", backref="group_users")
    group_id = reference_col("groups", nullable=False)
    group = relationship("StudentGroups", backref="group_users", viewonly=True)


class Users(Edu3Mixin, SurrogatePK, Model):
    """A user of the app."""
    __tablename__ = "users"
    username = Column(db.String(80), unique=True, nullable=False)
    password = Column(db.LargeBinary(128), nullable=True)   # hashed
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    active = Column(db.Boolean(), default=False)
    is_admin = Column(db.Boolean(), default=False)
    is_instructor = Column(db.Boolean(), default=False)
    is_static = Column(db.Boolean(), default=False) # static: user belongs to one group only (for generated groups)
    def __init__(self, username, password=None, **kwargs):
        """Create instance."""
        db.Model.__init__(self, username=username, **kwargs)
        if password:
            self.set_password(password)
        else:
            self.password = None
    def set_password(self, password):
        """Set password."""
        self.password = bcrypt.generate_password_hash(password)
    def check_password(self, value):
        """Check password."""
        return bcrypt.check_password_hash(self.password, value)
    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Users({self.username!r})>"


class Scenarios(Edu3Mixin, SurrogatePK, Model):
    """A scenario."""
    __tablename__ = "scenarios"
    name = Column(db.String(40), unique=False, nullable=False)
    description = Column(db.String(80), unique=False, nullable=True)
    subnet = Column(db.String(18), unique=True, nullable=True)
    owner_id = reference_col("users", nullable=False)
    owner = relationship("Users", backref="scenarios", lazy="subquery")
    status = Column(db.Integer, default=0, nullable=False)
    attempt = Column(db.Integer, default=0, nullable=False, server_default="0")
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    resps = relationship("Responses", backref="scenarios", cascade="all, delete-orphan")
    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Scenario({self.name!r})>"


class Notification(Edu3Mixin, SurrogatePK, Model):
    #more columns could be added. Type of notification is one thing
    detail = Column(db.String(60), unique=False, nullable=False)
    date = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)


class ScenarioGroups(Edu3Mixin, SurrogatePK, Model):
    """Groups associated with scenarios"""
    __tablename__ = "scenario_groups"
    group_id = reference_col("groups", nullable=False)
    group = relationship("StudentGroups", backref="scenario_groups")
    scenario_id = reference_col("scenarios", nullable=False)
    scenario = relationship("Scenarios", backref="scenario_groups")


class Responses(Edu3Mixin, SurrogatePK, Model):
    """Student responses to scenario questions"""
    __tablename__ = "responses"
    user_id = reference_col("users", nullable=False)
    user = relationship("Users", backref="responses")
    scenario_id = reference_col("scenarios", nullable=False)
    scenario = relationship("Scenarios", backref="responses", viewonly=True)
    question = Column(db.Integer, default=0, nullable=False)
    student_response = Column(db.String(40), unique=False, nullable=True)
    #correct = Column(db.Boolean(), default=False)
    points = Column(db.Integer, default=0, nullable=False)
    response_time = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    attempt = Column(db.Integer, default=0, nullable=False)
    # learning objective field?


class BashHistory(Edu3Mixin, SurrogatePK, Model):
    """Bash Histories, associated with users and scenarios"""
    __tablename__ = "bash_history"
    scenario_name = Column(db.String(40), unique=False, nullable=False)
    container_name = Column(db.String(40), nullable=False, unique=False)
    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    current_directory = Column(db.String(200), nullable=False, unique=False)
    input = Column(db.String(250), nullable=False, unique=False)
    output = Column(db.String(10000), nullable=False, unique=False)
    prompt = Column(db.String(80), nullable=False, unique=False)

class ChatHistory(Edu3Mixin, SurrogatePK, Model):
    """Chat Histories, associated with users and scenarios"""

    __tablename__ = "chat_history"
    
    sid = reference_col("scenarios", nullable=False)
    #scenario = relationship("Scenarios", backref="scenario_groups")
    
    sender = reference_col("users", nullable=False)
    recipient = reference_col("users", nullable=True)    
    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    message_contents = Column(db.String(10000), nullable=False, unique=False)
    

class GroupChatHistory(Edu3Mixin, SurrogatePK, Model):
    """Group Chat Histories"""

    __tablename__ = "group_chat_history"
    
    sid = reference_col("scenarios", nullable=False)
    sender = reference_col("users", nullable=False)
    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    message_contents = Column(db.String(10000), nullable=False, unique=False)
