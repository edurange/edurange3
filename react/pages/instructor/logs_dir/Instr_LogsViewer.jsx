import React, { useContext, useState, useEffect, useMemo } from 'react';
import Dropdown from '@components/Dropdown.jsx';
import '@components/Dropdown.css'
import { InstructorRouter_context } from '../Instructor_router.jsx';
import LogTable from './LogTable.jsx';
import Placard from '@components/Placard.jsx';

function Instr_LogsViewer() {

    const [userFilter_state, set_userFilter_state] = useState('ALL');
    const [logTypeFilter_state, set_logTypeFilter_state] = useState('ALL');
    const [scenarioTypeFilter_state, set_scenarioTypeFilter_state] = useState('ALL');
    const [dateRangeFilter_state, set_dateRangeFilter_state] = useState('ALL');

    
    const [validations_state, set_validations_state] = useState({
        user_filter: false,
        scenarioID_filter: false,
        logType_filter: false,
        dateRange_filter: false
    });
    const { scenarios_state, users_state, logs_state } = useContext(InstructorRouter_context);
    const [logsToShow_state, set_logsToShow_state] = useState(logs_state)

    if (!scenarios_state || !users_state) { return <></> }

    // check if all dropdowns are valid
    const allValid = Object.values(validations_state).every(Boolean);

    const handleValidationChange = (dropdownKey, isValid) => {
        set_validations_state(prev => {

            // check if current state is different from new state
            if (prev[dropdownKey] === isValid) {
                return prev;
            }
            return {
                ...prev,
                [dropdownKey]: isValid
            };
        });
    };

    const logType_options = [
        {value: 'ALL', label: 'ALL'},
        {value: 'chat', label: 'chat'},
        {value: 'bash', label: 'bash'},
        {value: 'responses', label: 'responses'},
    ];
    
    const scenarioType_options = [
        {value: 'ALL', label: 'ALL'},
        {value: 'Getting_Started', label: 'Getting_Started'},
        {value: 'File_Wrangler', label: 'File_Wrangler'},
        {value: 'Ssh_Inception', label: 'Ssh_Inception'},
    ] 
    
    const userFilter_options = [
        { value: 'ALL', label: 'ALL' },
        ...users_state.map((user) => ({ value: user.id, label: user.id }))
    ];

    const scenarioFilter_options = [
        { value: 'ALL', label: 'ALL' },
        ...scenarios_state.map((scenario) => ({ value: scenario.id, label: scenario.id }))
    ];

    const dateRangeFilter_options = [{ value: 'ALL', label: 'ALL' },];

    function filterByType(logs_obj, logType_str) {
        let returnLogs = {}
        if (logType_str === 'ALL') {return logs_obj}
        else {returnLogs[logType_str] = logs_obj[logType_str]}
        return returnLogs
    }

    function filterByUser(logs_obj, userID) {

        const chatLogs = logs_obj.chat ?? [];
        const bashLogs = logs_obj.bash ?? [];
        const responseLogs = logs_obj.responses ?? [];

        if (userID === 'ALL') return logs_obj
        else {
            const filtered_chat = chatLogs.filter((message) => Number(message.user_id) === Number(userID));   
            const filtered_bash = bashLogs.filter((history) => history.user_id === Number(userID));   
            const filtered_responses = responseLogs.filter((response) => response.user_id === Number(userID));

            const returnLogs = {
                chat: filtered_chat,
                bash: filtered_bash,
                responses: filtered_responses
            }
            return returnLogs;
        }
    }

    function filterByScenarioType(logs_obj, scenarioType) {

        const chatLogs = logs_obj.chat ?? [];
        const bashLogs = logs_obj.bash ?? [];
        const responseLogs = logs_obj.responses ?? [];

        if (scenarioType === 'ALL') return logs_obj
        else {
            const filtered_chat = chatLogs.filter((message) => String(message.scenario_type) === String(scenarioType));   
            const filtered_bash = bashLogs.filter((history) => String(history.scenario_type) === String(scenarioType));   
            const filtered_responses = responseLogs.filter((response) => String(response.scenario_type) === String(scenarioType));

            const returnLogs = {
                chat: filtered_chat,
                bash: filtered_bash,
                responses: filtered_responses
            }
            return returnLogs;
        }
    }

    function filterByDateRange(logs, dateRange_array) {
        return logs;
    }

    if (!logs_state) return <>No Data</>

    useEffect(() => {
        let initial = logs_state;
        const filtered_byType = filterByType(initial, logTypeFilter_state);
        const filtered_byUser = filterByUser(filtered_byType, userFilter_state);
        const filtered_byScenarioType = filterByScenarioType(filtered_byUser, scenarioTypeFilter_state);
        set_logsToShow_state(filtered_byScenarioType)
    }, [userFilter_state, logTypeFilter_state, scenarioTypeFilter_state, logs_state]);
    
    return (
        <div className='logsViewer-frame'>

            <div className='logsViewer-carpet'>


                <div className='dropdown-frame'>
                    <div className='dropdown-carpet'>
                        <Placard
                            placard_text={'Filters'}
                            textSize={'larger'}
                        />
                        <div className='filters-row'>

                            <Dropdown
                                label="Log Type"
                                optionsArray={logType_options}
                                choice_state = {logTypeFilter_state}
                                choice_stateSetter={set_logTypeFilter_state}
                                validation_setter={(isValid) => handleValidationChange('dropdown2', isValid)}
                            />

                            <Dropdown
                                label="User"
                                optionsArray={userFilter_options}
                                choice_state = {userFilter_state}
                                choice_stateSetter={set_userFilter_state}
                                validation_setter={(isValid) => handleValidationChange('user_filter', isValid)}
                            />

                            <Dropdown
                                label="Scenario Type"
                                optionsArray={scenarioType_options}
                                choice_state = {scenarioTypeFilter_state}
                                choice_stateSetter={set_scenarioTypeFilter_state}
                                validation_setter={(isValid) => handleValidationChange('scenarioType_options', isValid)}
                            />

                            {/* <Dropdown
                                label="Date Range"
                                optionsArray={dateRangeFilter_options}
                                choice_state={['ALL']}
                                choice_stateSetter={set_dateRangeFilter_state}
                                validation_setter={(isValid) => handleValidationChange('dropdown3', isValid)}
                            /> */}
                            <button className='update-button' disabled={!allValid}>Update</button>

                        </div>

                    </div>
                </div>


                <div className='logsViewer-body'>
                    <div className='logsViewer-item'>
                        <LogTable
                            logType={'chat'}
                            rowData={logsToShow_state?.chat}
                            use_crud={false} />
                    </div>
                    <div className='logsViewer-item'>
                        <LogTable
                            logType={'bash'}
                            rowData={logsToShow_state?.bash}
                            use_crud={false} />
                    </div>
                    <div className='logsViewer-item'>
                        <LogTable
                            logType={'responses'}
                            rowData={logsToShow_state?.responses}
                            use_crud={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Instr_LogsViewer;
