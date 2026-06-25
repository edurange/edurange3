import axios from 'axios';
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import '@assets/css/tables.css';
import { nanoid } from 'nanoid';
import { StudentRouter_context } from '../Student_router';

function ScenTable_student() {

    const navigate = useNavigate();

    const { scenarioList_state, set_scenarioList_state
     } = useContext(StudentRouter_context);

    async function fetchScenarioList() {
        try {
            const response = await axios.get("/get_group_scenarios");
            if (response.data.scenarios_list) {
                set_scenarioList_state(response.data.scenarios_list);
            }
        }
        catch (error) {console.log('get_group_scenarios:', error);}
    }
    useEffect(() => {fetchScenarioList();}, []);

    function handleNavClick (scenario_index) {
        const currentMeta = scenarioList_state[scenario_index];
        navigate(`${currentMeta.scenario_id}/0`);
    }

    return (
        <div className="table-frame">
            <div className="table-header">
                <div className='table-cell-item table-header-item scen-col-id'>ID</div>
                <div className='table-cell-item table-header-item scen-col-name'>Scenario</div>
                <div className='table-cell-item table-header-item scen-col-type'>Type</div>
                <div className='table-cell-item table-header-item scen-col-btn'></div>
            </div>
            {scenarioList_state.map((scenario, index) => (
                <div key={`scen-${scenario.scenario_id ?? index}`} onClick={() => handleNavClick(index)} className="table-row">
                    <div className='table-cell-item scen-col-id scen-id-cell'>{scenario.scenario_id}</div>
                    <div className='table-cell-item scen-col-name'>{scenario.scenario_name}</div>
                    <div className='table-cell-item scen-col-type'>{scenario.scenario_type}</div>
                    <div className='table-cell-item scen-col-btn'>
                        <button className='scen-view-btn' tabIndex={-1}>
                            View Scenario
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ScenTable_student;
