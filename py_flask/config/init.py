# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import sys
import os
from quart import Quart
from py_flask.routes.public_routes import blueprint_public
from py_flask.routes.student_routes import blueprint_student
from py_flask.routes.staff_routes import blueprint_staff
from py_flask.routes.scenario_routes import blueprint_scenarios
from py_flask.routes.admin_routes import blueprint_admin
from py_flask.utils import commands
from py_flask import database
from py_flask.config.extensions import (
    bcrypt,
    cache,
    async_engine,
    AsyncSessionLocal,
    debug_toolbar,
    migrate,
    db,
    Base
)
from datetime import timedelta

def create_app(config_object="py_flask.config.settings"):
    """Create application factory."""

    app = Quart('edurange3')
    app.config.from_object(config_object)
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your_secret_key")
    app.config["JWT_ALGORITHM"] = "HS256"
    app.config["JWT_EXPIRATION_DELTA"] = timedelta(hours=12)

    register_extensions(app)
    register_blueprints(app)
    register_shellcontext(app)
    register_commands(app)
    configure_logger(app)

    # Initialize database tables asynchronously
    @app.before_serving
    async def initialize_db():
        async with async_engine.begin() as conn:
            # Instead of db.create_all(), use this:
            await conn.run_sync(Base.metadata.create_all)
    return app

def register_extensions(app):
    """Register Quart extensions."""
    bcrypt.init_app(app)
    cache.init_app(app)
    # jwtman.init_app(app)
    debug_toolbar.init_app(app)
    migrate.init_app(app, db)
    # Note: async_engine and AsyncSessionLocal are managed separately
    return None

def register_blueprints(app):
    """Register Quart blueprints."""
    app.register_blueprint(blueprint_public)
    app.register_blueprint(blueprint_student)
    app.register_blueprint(blueprint_staff)
    app.register_blueprint(blueprint_scenarios)
    app.register_blueprint(blueprint_admin)
    return None

def register_shellcontext(app):
    """Register shell context objects."""
    def shell_context():
        return {"db": db, "Users": database.models.Users}
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



# # check config object value
# def create_app(config_object="py_flask.config.settings"):
#     """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

#     :param config_object: The configuration object to use.
#     """
#     app = Quart('edurange3')
#     app.config.from_object(config_object)
#     # set security attrs for 'session' cookie
#     app.config['SESSION_COOKIE_SECURE'] = True
#     app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

#     # store archive_id in config so other flask scripts have access

#     register_extensions(app)
#     register_blueprints(app)
#     register_shellcontext(app)
#     register_commands(app)
#     configure_logger(app)
#     return app

# def register_extensions(app):
#     """Register Quart extensions."""
#     bcrypt.init_app(app)
#     cache.init_app(app)
#     db.init_app(app)
#     jwtman.init_app(app)
#     debug_toolbar.init_app(app)
#     migrate.init_app(app, db)
#     return None

# def register_blueprints(app):
#     """Register Quart blueprints."""
#     app.register_blueprint(blueprint_public)
#     app.register_blueprint(blueprint_student)
#     app.register_blueprint(blueprint_staff)
#     app.register_blueprint(blueprint_scenarios)
#     app.register_blueprint(blueprint_admin)
#     return None

# def register_shellcontext(app):
#     """Register shell context objects."""
#     def shell_context():
#         """Shell context objects."""
#         return {"db": db, "Users": database.models.Users} # DEV_CHECK
#     app.shell_context_processor(shell_context)

# def register_commands(app):
#     """Register Click commands."""
#     app.cli.add_command(commands.test)
#     app.cli.add_command(commands.lint)

# def configure_logger(app):
#     """Configure loggers."""
#     handler = logging.StreamHandler(sys.stdout)
#     if not app.logger.handlers:
#         app.logger.addHandler(handler)
