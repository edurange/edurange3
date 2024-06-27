import React, { useContext, useState, useEffect } from 'react';
import Dropdown from '../../../components/Dropdown.jsx';
import '../../../components/Dropdown.css'
import { InstructorRouter_context } from '../Instructor_router.jsx';
import Table from '../../../components/Table.jsx';

function Instr_LogsViewer() {

    const [user_filter_state, set_user_filter_state] = useState(null);
    const [logTypeFilter_state, set_logTypeFilter_state] = useState(null);
    const [dateRangeFilter_state, set_dateRangeFilter_state] = useState(null);

    const [validations_state, set_validations_state] = useState({
        user_filter: false,
        scenarioID_filter: false,
        logType_filter: false,
        dateRange_filter: false
    });
    const {
        scenarios_state, users_state, logs_state,
        set_scenarioDetail_state, tempUsers_state } = useContext(InstructorRouter_context);

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

    const user_filter = [
        { value: 'ALL', label: 'ALL' },
        ...users_state.map((user) => ({ value: user.id, label: user.username }))
    ];
    
    const scenarioID_filter = [
        { value: 'ALL', label: 'ALL' },
        ...scenarios_state.map((scenario) => ({ value: scenario.id, label: scenario.id }))
    ];

    const logType_filter = [
        { value: 'ALL', label: 'ALL' }, 
        { value: 'chat', label: 'chat' }, 
        { value: 'bash', label: 'bash' }, 
        { value: 'responses', label: 'responses' }
    ];
    const dateRange_filter = [{ value: 'ALL', label: 'ALL' }, ];

    const logs_colData = [
        {
            label: 'id',
            css_class: 'col-xsmall'
        },
        {
            label: 'user_id',
            css_class: 'col-xsmall'
        },
        {
            label: 'scenario_type',
            css_class: 'col-medium'
        },
        {
            label: 'archive_id',
            css_class: 'col-small'
        },
        {
            label: 'content',
            css_class: 'xxlarge'
        },
    ]

    const logs_rowData = logs_state ?? []

    return (
        <div className='logsViewer-frame'>

            <div className='logsViewer-carpet'>


                <div className='dropdown-frame'>
                    <div className='dropdown-carpet'>

                        <Dropdown
                            label="User Filter"
                            optionsArray={user_filter}
                            default_value=''
                            choice_stateSetter={(value) => console.log("Student Filter: ", value)}
                            validation_setter={(isValid) => handleValidationChange('user_filter', isValid)}
                        />

                        <Dropdown
                            label="LogType Filter"
                            optionsArray={logType_filter}
                            default_value={""}
                            choice_stateSetter={(value) => console.log("Dropdown 2: ", value)}
                            validation_setter={(isValid) => handleValidationChange('dropdown2', isValid)}
                        />

                        <Dropdown
                            label="Scenario Filter"
                            optionsArray={scenarioID_filter}
                            default_value=''
                            choice_stateSetter={(value) => console.log("Scenario Filter: ", value)}
                            validation_setter={(isValid) => handleValidationChange('scenarioID_filter', isValid)}
                        />

                        <Dropdown
                            label="DateRange Filter"
                            optionsArray={dateRange_filter}
                            default_value={""}
                            choice_stateSetter={(value) => console.log("Dropdown 3: ", value)}
                            validation_setter={(isValid) => handleValidationChange('dropdown3', isValid)}
                        />
                        <button disabled={!allValid}>Submit</button>


                    </div>
                </div>
                <div className='logsViewer-body'>
                    <div className='logsViewer-item'>
                        <Table 
                            type_value={'chat'} 
                            type_label={'log_type'} 
                            columnData={logs_colData} 
                            rowData={logs_rowData?.chatLogs} 
                            use_crud={false} />
                    </div>
                    <div className='logsViewer-item'>
                        <Table 
                            type_value={'bash'} 
                            type_label={'log_type'} 
                            columnData={logs_colData} 
                            rowData={logs_rowData?.bashLogs} 
                            use_crud={false} />
                    </div>
                    <div className='logsViewer-item'>
                        <Table 
                            type_value={'response'} 
                            type_label={'log_type'} 
                            columnData={logs_colData} 
                            rowData={logs_rowData?.responseLogs} 
                            use_crud={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Instr_LogsViewer;
