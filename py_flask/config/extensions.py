# -*- coding: utf-8 -*-
"""Extensions module. Each extension is initialized in the app factory located in app.py."""

# consider rename to singletons.py

import os
from flask_bcrypt import Bcrypt
from flask_caching import Cache
from flask_debugtoolbar import DebugToolbarExtension
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from py_flask.config.settings import SQLALCHEMY_DATABASE_URI

# new
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker


bcrypt = Bcrypt()
db = SQLAlchemy()
migrate = Migrate()
cache = Cache()
debug_toolbar = DebugToolbarExtension()

from sqlalchemy.ext.declarative import declarative_base


#
# new
#

async_engine = create_async_engine(SQLALCHEMY_DATABASE_URI)
Base = declarative_base()

# Define async session factory
AsyncSessionLocal = sessionmaker(
    async_engine, 
    expire_on_commit=False, 
    class_=AsyncSession
)