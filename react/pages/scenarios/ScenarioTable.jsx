import axios from 'axios';
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import '@assets/css/tables.css';
import { ScenariosRouter_context } from '@scenarios/Scenarios_router';
import { nanoid } from 'nanoid';

function ScenarioTable() {

    const navigate = useNavigate();

    const { scenarioList_state,   set_scenarioList_state,
            scenarioMeta_state, set_scenarioMeta_state
     } = useContext( ScenariosRouter_context );

    async function fetchScenarioList() {
        try {
            const response = await axios.get("/get_group_scenarios");
            if (response.data.scenarios_list) {
                set_scenarioList_state(response.data.scenarios_list);
            };
        }
        catch (error) {console.log('get_scenarios_list error:', error);};
    };
    useEffect(() => {fetchScenarioList();}, []);

    function handleNavClick (scenario_index) {
        const currentMeta = scenarioList_state[scenario_index];
        navigate(`${currentMeta.scenario_id}/0`);
    };
    
    return (
        <div className="table-frame">
            <div className="table-header">
                <div className='table-cell-item table-int' >ID</div>
                <div className='table-cell-item col-small'>Name</div>
                <div className='table-cell-item col-xlarge'>Type</div>
                <div className='table-cell-item col-small'>Gr.Name</div>
            </div>
            {scenarioList_state.slice(0).map((scenario, index) => (
                <div key={nanoid(3)} onClick={() => handleNavClick(index)} >
                    <div className="table-row">
                        <div className='table-cell-item table-int'>{scenario.scenario_id}</div>
                        <div className='table-cell-item col-small'>{scenario.scenario_name}</div>
                        <div className='table-cell-item col-xlarge'>{scenario.scenario_type}</div>
                        <div className='table-cell-item col-small'>{scenario.group_name}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ScenarioTable;