# -*- coding: utf-8 -*-

# this app.py was previously autoapp.py
# the previous app.py is now config/init.py

"""Create an application instance."""
import os
import redis
from py_flask.config.init import create_app
from py_flask.config.extensions import db
from py_flask.database.models import StudentGroups, Users
from py_flask.utils.common_utils import generate_alphanum, get_system_resources




app = create_app()
app.app_context().push()

current_archive_id = generate_alphanum(8)
with open('./logs/archive_id.txt', 'w') as log_id_file:
    log_id_file.write(current_archive_id)

db.create_all()

def initialize_system_resources():
    """Initialize system resources in Redis at startup"""
    try:
        sys_db_redis_client = redis.Redis(host='localhost', port=6379, db=1)
        
        # Check if resources are already set
        cpu_existing = sys_db_redis_client.get("cpu_resources")
        gpu_existing = sys_db_redis_client.get("gpu_resources")
        
        if cpu_existing is None or gpu_existing is None:
            print("Detecting and initializing system resources...")
            resources = get_system_resources()
            
            cpu_resources = resources['cpu_resources']
            gpu_resources = resources['gpu_resources']
            
            sys_db_redis_client.set("cpu_resources", cpu_resources)
            sys_db_redis_client.set("gpu_resources", gpu_resources)
            
            print(f"✓ System resources initialized: CPU cores={cpu_resources}, GPU={'enabled' if gpu_resources == -1 else 'disabled'}")
        else:
            print(f"✓ System resources already configured: CPU cores={int(cpu_existing)}, GPU={'enabled' if int(gpu_existing) == -1 else 'disabled'}")
            
    except Exception as e:
        print(f"Warning: Failed to initialize system resources: {e}")
        print("  Hint generation features may not work properly.")
        print("  Please ensure Redis is running and accessible.")

# Initialize system resources on startup
initialize_system_resources()

def create_admin():
    username = os.environ["FLASK_USERNAME"]
    password = os.environ["PASSWORD"]
    Users.create(
        username=username,
        password=password,
        active=True,
        is_admin=True,
        is_staff=True,
    )

def create_all_group(id):
    StudentGroups.create(name="ALL", owner_id=id, code="", hidden=True)

existing_admin = Users.query.limit(1).all()
if not existing_admin: create_admin()

group = StudentGroups.query.limit(1).all()
admin = Users.query.filter_by(username=os.environ["FLASK_USERNAME"]).first()

if admin: a_id = admin.id

if not group: create_all_group(a_id)





