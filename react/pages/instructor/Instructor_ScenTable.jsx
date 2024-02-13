import axios from 'axios';
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import '@scenarios/list/ScenarioTable.css';
import { InstructorDashContext } from './InstructorDash';

function Instructor_ScenTable() {

    const navigate = useNavigate();

    const { instructorData_state, set_scenarioDetail_state } = useContext( InstructorDashContext );
    
        function handleDetailClick (scenario_index) {
            const currentMeta = instructorData_state.scenarios[scenario_index];
            console.log('got click with index: ', scenario_index)
            console.log('meta is: ', currentMeta)
            set_scenarioDetail_state(currentMeta);
        };

    if (!instructorData_state?.scenarios) {return <></>}

    return (
        <div className="newdash-datatable-frame">
            <div className="newdash-datatable-header">
                <div className='table-cell-item table-int' >ID</div>
                <div className='table-cell-item table-name'>Name</div>
                <div className='table-cell-item table-scenario-type'>Type</div>
            </div>
            {instructorData_state.scenarios.slice(0).map((scenario, index) => (
                <div  key={index} onClick={() => handleDetailClick(index)} >
                    <div className="table-row">
                        <div className='table-cell-item table-int'>{scenario.id}</div>
                        <div className='table-cell-item table-name'>{scenario.name}</div>
                        <div className='table-cell-item table-scenario-type'>{scenario.description}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Instructor_ScenTable;