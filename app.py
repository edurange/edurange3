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
        async with AsyncSessionLocal() as session:
            result = await session.execute(Users.__table__.select().limit(1))
            existing_admin = result.scalars().all()
            if not existing_admin:
                await create_admin(session)

            # Create "ALL" group if it doesn't exist
            result = await session.execute(Users.__table__.select().where(Users.username == os.environ["FLASK_USERNAME"]))
            admin = result.scalar()
            if admin:
                a_id = admin.id
                result = await session.execute(StudentGroups.__table__.select().limit(1))
                group = result.scalars().all()
                if not group:
                    await create_all_group(session, a_id)

        # Initialize system resources asynchronously
        initialize_system_resources_task.delay()

async def create_admin(session):
    username = os.environ["FLASK_USERNAME"]
    password = os.environ["PASSWORD"]
    new_admin = Users(
        username=username,
        password=password,
        active=True,
        is_admin=True,
        is_staff=True,
    )
    session.add(new_admin)
    await session.commit()

async def create_all_group(session, id):
    new_group = StudentGroups(name="ALL", owner_id=id, code="", hidden=True)
    session.add(new_group)
    await session.commit()

# Run initialization
if __name__ == "__main__":
    asyncio.run(initialize_app())


# """Create an application instance."""
# import os
# from py_flask.config.init import create_app
# from py_flask.config.extensions import db
# from py_flask.database.models import StudentGroups, Users
# from py_flask.utils.common_utils import generate_alphanum
# from py_flask.utils.tasks import initialize_system_resources_task
# import asyncio

# # Initialize Quart app
# app = create_app()

# async def initialize_app():
#     # Use an async context manager for app context
#     async with app.app_context():
#         # Generate and store an archive ID
#         current_archive_id = generate_alphanum(8)
#         with open('./logs/archive_id.txt', 'w') as log_id_file:
#             log_id_file.write(current_archive_id)

#         # Create tables
#         await db.create_all()

#         # Create admin user if not already present
#         existing_admin = await Users.query.limit(1).all()
#         if not existing_admin:
#             await create_admin()

#         # Create "ALL" group if it doesn't exist
#         admin = await Users.query.filter_by(username=os.environ["FLASK_USERNAME"]).first()
#         if admin:
#             a_id = admin.id
#             group = await StudentGroups.query.limit(1).all()
#             if not group:
#                 await create_all_group(a_id)

#         # Initialize system resources
#         initialize_system_resources_task.delay()

# async def create_admin():
#     username = os.environ["FLASK_USERNAME"]
#     password = os.environ["PASSWORD"]
#     await Users.create(
#         username=username,
#         password=password,
#         active=True,
#         is_admin=True,
#         is_staff=True,
#     )

# async def create_all_group(id):
#     await StudentGroups.create(name="ALL", owner_id=id, code="", hidden=True)

# # Run initialization
# asyncio.run(initialize_app())

