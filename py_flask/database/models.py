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



class Channels(Edu3Mixin, SurrogatePK, Model):
    """"Chat Channels"""
    __tablename__ = "channels"
    name = Column(db.String(40), unique=True, nullable=False) # DEV_FIX make owner username by default
    owner_id = reference_col("users", nullable=False)
    owner = relationship("Users", backref="channels")
    users = relationship("ChannelUsers", backref="channels", cascade="all, delete-orphan")


class ChannelUsers(Edu3Mixin, SurrogatePK, Model):
    """Users belong to channels"""
    ___tablename___ = "channel_users"
    user_id = reference_col("users", nullable=False)
    channel_id = reference_col("channels", nullable=False)
    user = relationship("Users", backref="channel_users")
    channel = relationship("Channels", backref="channel_users", viewonly=True)


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
        
        if password: self.set_password(password)
        else: self.password = None
    
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
    scenario_type = Column(db.String(80), unique=False, nullable=True)
    octet = Column(db.Integer, unique=True, nullable=True)
    owner_id = reference_col("users", nullable=False)
    owner = relationship("Users", backref="scenarios", lazy="subquery")
    status = Column(db.Integer, default=0, nullable=False)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    resps = relationship("Responses", backref="scenarios", cascade="all, delete-orphan")
    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Scenario({self.name!r})>"


class Notification(Edu3Mixin, SurrogatePK, Model):
    detail = Column(db.String(60), unique=False, nullable=False)
    date = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

class ScenarioGroups(Edu3Mixin, SurrogatePK, Model):
    """Groups associated with scenarios"""
    __tablename__ = "scenario_groups"
    group_id = reference_col("groups", nullable=False)
    group = relationship("StudentGroups", backref="scenario_groups")
    scenario_id = reference_col("scenarios", nullable=False)
    scenario = relationship("Scenarios", backref="scenario_groups")



#####
## ChatMessages, Responses, and BashHistory are the 3 main data points for tracking student progress
## By adding user_id, scenario_type, and scenario_id to ea of these tables, these tables can be 
## exported 'as is' for use in hint reccom algorithms, and use user_id as the main cross_ref
####

class ChatMessages(Edu3Mixin, SurrogatePK, Model):
    """Individual chat message"""
    ___tablename___ = "chat_messages"

    user_id = reference_col("users",nullable=False) 
    user = relationship("Users", backref="chat_messsages")

    scenario_type = Column(db.String(50), nullable=False, unique=False)
    scenario_id = reference_col("scenarios", nullable=False)
    scenario = relationship("Scenarios", backref="chat_messages", viewonly=True)

    channel = reference_col("channels", nullable=False)
    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    content = Column(db.String(5000), nullable=False, unique=False)

    archive_id = Column(db.String(8), nullable=False, unique=False)


class Responses(Edu3Mixin, SurrogatePK, Model):
    """Student responses to scenario questions"""
    __tablename__ = "responses"

    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    
    user_id = reference_col("users", nullable=False)
    user = relationship("Users", backref="responses")

    scenario_id = reference_col("scenarios", nullable=False)
    scenario_type = Column(db.String, nullable=False) 
    scenario = relationship("Scenarios", backref="responses", viewonly=True)

    question_number = Column(db.Integer, default=0, nullable=False)
    content = Column(db.String(80), unique=False, nullable=True)
    points_possible = Column(db.Integer, default=0, nullable=False)
    points_awarded = Column(db.Integer, default=0, nullable=False)

    archive_id = Column(db.String(8), nullable=False, unique=False)

class BashHistory(Edu3Mixin, SurrogatePK, Model):
    """Bash Histories, associated with users and scenarios"""
    __tablename__ = "bash_history"

    timestamp = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    user_id = reference_col("users", nullable=False)
    user = relationship("Users", backref="bash_history")

    scenario_type = Column(db.String(40), unique=False, nullable=False)
    scenario_id = reference_col("scenarios", nullable=False)
    scenario = relationship("Scenarios", backref="bash_history", viewonly=True)
    
    container_name = Column(db.String(40), nullable=False, unique=False)
    current_directory = Column(db.String(200), nullable=False, unique=False)
    input = Column(db.String(250), nullable=False, unique=False)
    output = Column(db.String(10000), nullable=False, unique=False)

    archive_id = Column(db.String(8), nullable=False, unique=False)
