import axios from 'axios';
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '@scenarios/list/ScenarioTable.css'
import { InstructorDashContext } from './InstructorDash';

function Instructor_ScenTable({set_scenarioDetail_state}) {

    const navigate = useNavigate();
;

    const { instructorData_state } = useContext(InstructorDashContext);

    if (!instructorData_state?.scenarios) {
        return <></>
    }
    console.log('INSTRUCTOR DATA STATE: ',instructorData_state);
    const scenList = instructorData_state?.scenarios;
    // async function fetchScenarioList() {
    //     try {
    //         const response = await axios.post("/api/scenario_interface",{METHOD: 'LIST'});
    //         console.log(response);
    //         if (response.data.scenarios_list) {
    //             set_scenariosList_state(response.data.scenarios_list);
    //         };
    //     }
    //     catch (error) {console.log('get_scenarios_list error:', error);};
    // };
    // useEffect(() => {fetchScenarioList();}, []);

    function handleInspectClick (scenario_index) {

        set_scenarioDetail_state(instructorData_state?.scenarios[scenario_index])
        // navigate(`${currentMeta.scenario_id}/0`);
    };
    function handleStartClick (scenario) {
        axios.post('/api/scenario_interface',{
            METHOD: 'START',
            scenario_id: scenario.scenario_id
        }
        )
    };
    function handleStopClick (scenario) {
        axios.post('/api/scenario_interface',{
            METHOD: 'STOP',
            scenario_id: scenario.scenario_id
        }
        )
    };
    function handleDestroyClick (scenario) {
        axios.post('/api/scenario_interface',{
            METHOD: 'DESTROY',
            scenario_id: scenario.scenario_id
        }
        )
    };



    return (
        <div className="newdash-datatable-frame">

            <div className="newdash-datatable-header">
                <div className='table-cell-item table-active' >ID</div>
                <div className='table-cell-item table-scenario-name'>Name</div>
                <div className='table-cell-item table-scenario-name'>Type</div>
                <div className='table-cell-item table-scenario-name'>Status</div>
                <div className='table-cell-item table-scenario-name'>CONTROL PANEL</div>
            </div>
            {instructorData_state.scenarios.slice(0).map((scenario, index) => (
                <div  key={index} onClick={() => handleInspectClick(index)} >
                    <div className="table-row">
                        <div className='table-cell-item table-active'>{scenario.id}</div>
                        <div className='table-cell-item table-scenario-name'>{scenario.description}</div>
                        <div className='table-cell-item table-scenario-name'>{scenario.name}</div>
                        <div className='table-cell-item table-scenario-name'>{scenario.status}</div>
                        <button onClick={() => handleStartClick(scenario)}>START</button>
                        <button onClick={() => handleStopClick(scenario)}>STOP</button>
                        <button onClick={() => handleDestroyClick(scenario)}>DESTROY</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Instructor_ScenTable;