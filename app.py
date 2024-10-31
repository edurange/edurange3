# -*- coding: utf-8 -*-

# this app.py was previously autoapp.py
# the previous app.py is now config/init.py

# -*- coding: utf-8 -*-
# this app.py was previously autoapp.py
# the previous app.py is now config/init.py

"""Create an application instance."""
import os
import asyncio
from py_flask.config.init import create_app
from py_flask.config.extensions import async_engine, AsyncSessionLocal
from py_flask.database.models import StudentGroups, Users
from py_flask.utils.common_utils import generate_alphanum
from py_flask.utils.tasks import initialize_system_resources_task

# Initialize Quart app
app = create_app()

async def initialize_app():
    # Use an async context manager for app context
    async with app.app_context():
        # Generate and store an archive ID
        current_archive_id = generate_alphanum(8)
        with open('./logs/archive_id.txt', 'w') as log_id_file:
            log_id_file.write(current_archive_id)

        # Create tables asynchronously
        async with async_engine.begin() as conn:
            await conn.run_sync(Users.metadata.create_all)  # Update with actual base metadata if different

        # Create admin user if not already present
        async with AsyncSessionLocal() as db_ses:
            result = await db_ses.execute(Users.__table__.select().limit(1))
            existing_admin = result.scalars().all()
            if not existing_admin:
                await create_admin(db_ses)

            # Create "ALL" group if it doesn't exist
            result = await db_ses.execute(Users.__table__.select().where(Users.username == os.environ["FLASK_USERNAME"]))
            admin = result.scalar()
            if admin:
                a_id = admin.id
                result = await db_ses.execute(StudentGroups.__table__.select().limit(1))
                group = result.scalars().all()
                if not group:
                    await create_all_group(db_ses, a_id)

        # Initialize system resources asynchronously
        initialize_system_resources_task.delay()

from py_flask.config.extensions import AsyncSessionLocal

async def create_admin():
    username = os.environ["FLASK_USERNAME"]
    password = os.environ["PASSWORD"]
    new_admin = Users(
        username=username,
        password=password,
        active=True,
        is_admin=True,
        is_staff=True,
    )
    async with AsyncSessionLocal() as db_ses:
        db_ses.add(new_admin)
        await db_ses.commit()

async def create_all_group(id):
    new_group = StudentGroups(name="ALL", owner_id=id, code="", hidden=True)
    async with AsyncSessionLocal() as db_ses:
        db_ses.add(new_group)
        await db_ses.commit()


# Run initialization
if __name__ == "__main__":
    asyncio.run(initialize_app())
