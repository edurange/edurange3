import axios from 'axios';
import React, { useContext, useState } from 'react';
import { InstructorRouter_context } from '../../Instructor_router';
import '@assets/css/tables.css'
import { HomeRouter_context } from '@pub/Home_router';

function Instr_ScenTable() {

    const { 
        instr_studentGroups_state, 
        set_instr_scenarioDetail_state, 
        instr_scenarios_state, set_instr_scenarios_state
    } = useContext(InstructorRouter_context);
    const { set_desiredNavMetas_state } = useContext(HomeRouter_context);

    const statusSwitch = {
        0: <div className='status-disabled'>Stopped</div>,
        1: <div className='status-success'>Started</div>,
        2: <div className='status-error'>Unknown</div>,
        3: <div className='status-neutral'>Starting</div>,
        4: <div className='status-neutral'>Stopping</div>,
        5: <div className='status-error'>ERROR</div>,
        7: <div className='status-standby'>Building</div>,
        8: <div className='status-standby'>Destroying</div>
    };

    if (!instr_studentGroups_state) {return <></>}


    async function handleStartClick(scenario) {
        const updatedScenariosStarting = instr_scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 3 }; 
            }
            return s;
        });
        set_instr_scenarios_state(updatedScenariosStarting);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'START',
            scenario_id: scenario.id
        });
        console.log(response);
    
        if (response.data.result === "success") {
            const updatedScenariosSuccess = instr_scenarios_state.map(s => {
                if (s.id === scenario.id) {
                    return { ...s, status: response.data.new_status };
                }
                return s;
            });
            set_instr_scenarios_state(updatedScenariosSuccess);
        }
    };
    async function handleStopClick(scenario) {
        const updatedScenariosStopping = instr_scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 4 }; 
            }
            return s;
        });
        set_instr_scenarios_state(updatedScenariosStopping);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'STOP',
            scenario_id: scenario.id
        });
        console.log(response);
    
        if (response.data.result === "success") {
            const updatedScenariosSuccess = instr_scenarios_state.map(s => {
                if (s.id === scenario.id) {
                    return { ...s, status: response.data.new_status };
                }
                return s;
            });
            set_instr_scenarios_state(updatedScenariosSuccess);
        }
    };
    async function handleDestroyClick(scenario) {
        const updatedScenariosDestroying = instr_scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 8 }; 
            }
            return s;
        });
        set_instr_scenarios_state(updatedScenariosDestroying);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'DESTROY',
            scenario_id: scenario.id
        });
        console.log(response);
    
        if (response.data.result === "success") {
            // remove the scenario from list if success
            const updatedScenariosAfterDestroy = instr_scenarios_state.filter(s => s.id !== scenario.id);
            set_instr_scenarios_state(updatedScenariosAfterDestroy);
        }
    };
  
    
    function handleDetailClick (scenario) {
        set_desiredNavMetas_state([`/instructor/scenarios/${scenario.id}/0`, 'dash']);
    };
    

    return (

        <div className="table-frame">
            <div className="table-header">
                
                <div className='table-cell-item col-xxsmall' >ID</div>
                <div className='table-cell-item col-medium'>Name</div>
                <div className='table-cell-item col-large'>Type</div>
                <div className='table-cell-item col-small'>Status</div>
                <div className='table-cell-item col-large'>CONTROL PANEL</div>
            </div>
            {instr_scenarios_state.slice(1).map((scenario, index) => (
                <div key={index+2000} >
                {/* <div key={index+2000} onClick={() => handleDetailClick(scenario)} > */}
                    <div className="table-row">
                        <div className='table-cell-item col-xxsmall'>{scenario.id}</div>
                        <div className='table-cell-item col-medium'>{scenario.name}</div>
                        <div className='table-cell-item col-large'>{scenario.description}</div>
                        <div className='table-cell-item col-small'>{statusSwitch[scenario.status]}</div>
                        <div className='table-cell-item row-btns col-xlarge'>
                            <button className='row-btn' onClick={() => handleStartClick(scenario)}>START</button>
                            <button className='row-btn' onClick={() => handleStopClick(scenario)}>STOP</button>
                            <button className='row-btn' onClick={() => handleDestroyClick(scenario)}>DESTROY</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default Instr_ScenTable;