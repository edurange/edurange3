# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import sys
import os
from flask import Flask
from py_flask.routes.public_routes import blueprint_public
from py_flask.routes.student_routes import blueprint_student
from py_flask.routes.instructor_routes import blueprint_instructor
from py_flask.routes.scenario_routes import blueprint_scenarios
from py_flask.routes.admin_routes import blueprint_admin
from py_flask.utils import commands
from py_flask import database
from py_flask.config.extensions import (
    bcrypt,
    cache,
    db,
    debug_toolbar,
    migrate,
    jwtman,
)

# check config object value
def create_app(config_object="py_flask.config.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask('edurange3')
    app.config.from_object(config_object)
    # set security attrs for 'session' cookie
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # store archive_id in config so other flask scripts have access

    register_extensions(app)
    register_blueprints(app)
    register_shellcontext(app)
    register_commands(app)
    configure_logger(app)
    return app

def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    cache.init_app(app)
    db.init_app(app)
    jwtman.init_app(app)
    debug_toolbar.init_app(app)
    migrate.init_app(app, db)
    return None

def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(blueprint_public)
    app.register_blueprint(blueprint_student)
    app.register_blueprint(blueprint_instructor)
    app.register_blueprint(blueprint_scenarios)
    app.register_blueprint(blueprint_admin)
    return None

def register_shellcontext(app):
    """Register shell context objects."""
    def shell_context():
        """Shell context objects."""
        return {"db": db, "Users": database.models.Users} # DEV_CHECK
    app.shell_context_processor(shell_context)

def register_commands(app):
    """Register Click commands."""
    app.cli.add_command(commands.test)
    app.cli.add_command(commands.lint)

def configure_logger(app):
    """Configure loggers."""
    handler = logging.StreamHandler(sys.stdout)
    if not app.logger.handlers:
        app.logger.addHandler(handler)
