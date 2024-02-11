# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import sys
from datetime import datetime

from flask import Flask, render_template

from py_flask.routes.public_routes import blueprint_edurange3_public
from py_flask.routes.student_routes import blueprint_edurange3_student
from py_flask.routes.instructor_routes import blueprint_edurange3_instructor
from py_flask.routes.scenario_routes import blueprint_edurange3_scenarios


from py_scripts import commands
from py_flask import database
# from py_scripts import commands, public, user, tutorials, api

from py_flask.config.extensions import (
    bcrypt,
    cache,
    db,
    debug_toolbar,
    flask_static_digest,
    login_manager,
    migrate,
    jwtman,
)
from py_flask.database.models import User

# check config object value
def create_app(config_object="py_flask.config.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask('edurange3') # hard coded value instead of root dir value (was causing problems)
    # app = Flask(__name__.split(".")[0])
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    register_errorhandlers(app)
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
 
    login_manager.init_app(app)
    debug_toolbar.init_app(app)
    migrate.init_app(app, db)
    flask_static_digest.init_app(app)

    return None


def register_blueprints(app):
    """Register Flask blueprints."""

    app.register_blueprint(blueprint_edurange3_public)
    app.register_blueprint(blueprint_edurange3_student)
    app.register_blueprint(blueprint_edurange3_instructor)
    app.register_blueprint(blueprint_edurange3_scenarios)

    return None


def register_errorhandlers(app):
    """Register error handlers."""

    def render_error(error):
        """Render error template."""
        error_code = getattr(error, "code", 500)
        return (
            render_template(f"{error_code}.html"),
            error_code,
        )

    for errcode in [401, 403, 404, 500]:
        app.errorhandler(errcode)(render_error)

    return None


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"db": db, "User": database.models.User} # DEV_CHECK

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
