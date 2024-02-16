
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
    getContent
    getScenarioMeta
    bashResponse
    readQuestions
    evaluateResponse
    get_dockerPort

scenario_utils:
    

    evaluate: keep/move/edit/delete ?

    keep:
        gen_chat_names (moved to chat_utils)
        gather_files (used in scenario creation)
        item_generator (used in scenario creation, parsing)

    questionable:
        CatalogEntry
        displayProgress
        getTotalScore
        getScore
        getAttempt
        getProgress

    nix:
        setAttempt (doesn't even work right)
        getPass (gets ssh credentials for certain container)

    uncategorized:
        getResponses
        calcScr
        displayCorrectAnswers
        getDescription
        identify_type
        identify_state
        populate_catalog
        queryPolish
        readScenario
        recentCorrect
        responseSelector
        responseProcessing
        scoreSetup
        scoreCheck
        scoreCheck2