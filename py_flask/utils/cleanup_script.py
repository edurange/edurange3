from py_flask.config.init import create_app
from py_flask.database.models import Scenarios
from py_flask.config.extensions import db
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Define the cutoff date (e.g., 30 days ago)
    cutoff_date = datetime.utcnow() - timedelta(days=30)

    # Query for old scenarios
    old_scenarios = Scenarios.query.filter(
        (Scenarios.last_used < cutoff_date) | (Scenarios.last_used.is_(None))
    ).all()

    print(f"Found {len(old_scenarios)} scenarios older than {cutoff_date} or with no last_used date")

    # Review the list of old scenarios
    for scenario in old_scenarios:
        print(f"ID: {scenario.id}, Name: {scenario.name}, Last Used: {scenario.last_used}, Octet: {scenario.octet}")

    # Manually free up the octets
    for scenario in old_scenarios:
        scenario.octet = None
        scenario.last_used = None
    
    db.session.commit()

    print("Octets have been freed up for old scenarios")

    # Verify the changes
    updated_scenarios = Scenarios.query.filter(Scenarios.octet.is_(None)).all()
    print(f"Number of scenarios with freed octets: {len(updated_scenarios)}")
