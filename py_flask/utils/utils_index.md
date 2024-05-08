
every function in the utils directory; please update this w/ changes

auth_utils:
    instructor_only
    jwt_and_csrf_required
    login_er3
    register_user

instructor_utils:
    assignUserToGroup
    createUserGroup
    generateTestAccts
    list_all_scenarios
    NotifyCapture
    NotifyClear
    removeUserFromGroup

terraform_utils (was scenario_json):
    adjust_network
    build_users
    build_uploads
    build_execute_files
    find_and_copy_template
    write_resource

csv_utils:
    readCSV
    groupCSV

instructorData_utils:
    get_user
    get_users
    get_groups
    get_group_users
    get_scenarios
    get_scenario_groups
    get_student_responses 
    get_instructor_data

guide_utils:
    getContent ( gets generic data, unique data, and user credentials for scenarios, for UI )
    getScenarioMeta ( gets metadata for a scenario, used for listings etc in UI )
    bashResponse
    readQuestions ( returns all questions for a certain scenario )
    evaluateResponse ( grades a student's answer, returns true/false, correct answer, and pts awarded )
    get_dockerPort

scenario_utils:
    keep:
        gather_files (used in scenario creation)
        item_generator (used in scenario creation, parsing)
        identify_type
        identify_state
    nix:
        gen_chat_names (moved to chat_utils)

tasks:
    create_scenario_task
    start_scenario_task
    stop_scenario_task
    update_scenario_task
    destroy_scenario_task