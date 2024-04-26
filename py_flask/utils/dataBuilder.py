from sqlalchemy.orm import joinedload
from py_flask.database.models import ScenarioGroups, Scenarios, Users, GroupUsers, StudentGroups
from py_flask.utils.chat_utils import getChannelDictList_byUser

def get_group_data():
    groups = (
        StudentGroups.query
            .options(
                joinedload(StudentGroups.users)
                .joinedload(GroupUsers.user))
            .options(
                joinedload(StudentGroups.scenario_groups)
                .joinedload(ScenarioGroups.scenario))
            .all()
    )

    group_data = []
    for group in groups:
        # if group.hidden: continue
        group_info = {
            "id": group.id,
            "name": group.name,
            "owner_id": group.owner_id,
            "code": group.code,
            "hidden": group.hidden,
            "users": [{"id": gu.user.id, "username": gu.user.username} for gu in group.users],
            "scenarios": [{"id": sg.scenario.id, "name": sg.scenario.name} for sg in group.scenario_groups]
        }
        group_data.append(group_info)

    return group_data

def get_user_data():
    users = Users.query.all()

    user_data = []
    for user in users:

        # skip admin
        if user.id == 1: continue

        # find GroupUsers instance for this user
        group_user = GroupUsers.query.filter_by(user_id=user.id).first()

        channel_data = getChannelDictList_byUser(user.id, user.username)
        # get group ID from GroupUsers row w/ user's group_id
        group_id = group_user.group_id if group_user else None
        user_info = {
            "id": user.id,
            "username": user.username,
            "membership": group_id,
            "channel_data": channel_data,
            "scenarios": [{"id": s.id, "name": s.name} for s in user.scenarios]
        }
        user_data.append(user_info)

    return user_data


def get_scenario_data():
    scenarios = (
        Scenarios.query
        .options(
            joinedload(Scenarios.scenario_groups)
            .joinedload(ScenarioGroups.group)
            .joinedload(StudentGroups.users)
            .joinedload(GroupUsers.user))
        .all()
    )

    scenario_data = []
    for scenario in scenarios:

        # assumes each scenario can be associated with only one group
        group = scenario.scenario_groups[0].group if scenario.scenario_groups else None
        scenario_info = {
            "id": scenario.id,
            "name": scenario.name,
            "description": scenario.description,
            "octet": scenario.octet,
            "owner_id": scenario.owner_id,
            "status": scenario.status,
            "created_at": scenario.created_at.isoformat(),
            "membership": group.id if group else None,
            "students": [{"id": gu.user.id, "username": gu.user.username} for gu in group.users] if group else []
        }
        scenario_data.append(scenario_info)

    return scenario_data
