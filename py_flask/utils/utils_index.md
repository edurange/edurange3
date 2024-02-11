
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
    scenario_create
    scenario_start
    scenario_stop
    scenario_update
    scenario_destroy

parse_utils:
    adjust_network
    build_users
    build_uploads
    build_execute_files
    find_and_copy_template
    groupCSV
    readCSV
    write_resource

panopticon_utils:
    get_user
    get_users
    get_groups
    get_group_users
    get_scenarios
    get_scenario_groups
    get_student_responses 
    get_instructor_data

scenario_utils:
    bashResponse
    CatalogEntry
    calcScr
    displayCorrectAnswers
    displayProgress
    evaluateResponse
    gather_files
    gen_chat_names
    getContent
    getScenarioMeta
    get_dockerPort
    getDescription
    getPass
    getResponses
    getTotalScore
    getScore
    getAttempt
    getProgress
    item_generator
    identify_type
    identify_state
    populate_catalog
    queryPolish
    readScenario
    recentCorrect
    readQuestions
    responseSelector
    responseProcessing
    scoreSetup
    scoreCheck
    scoreCheck2
    setAttempt
