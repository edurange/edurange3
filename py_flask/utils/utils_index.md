
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

parse_utils (marged json_utils and csv_utils):
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

    questionable:
        CatalogEntry
        displayProgress
        getTotalScore
        getScore
        getAttempt
        getProgress

    
        getResponses
        calcScr
        displayCorrectAnswers
        gather_files
        getDescription
        getPass
        item_generator
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
        setAttempt
