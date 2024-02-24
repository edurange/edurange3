import axios from 'axios';
import React, { useContext, useState } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import '@assets/css/tables.css'
import { HomeRouter_context } from '@pub/Home_router';

function Instr_ScenTable() {

    const { 
        groups_state, 
        set_scenarioDetail_state, 
        scenarios_state, set_scenarios_state
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

    if (!groups_state) {return <></>}


    async function handleStartClick(event, scenario) {
        event.stopPropagation();
        const updatedScenariosStarting = scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 3 }; 
            }
            return s;
        });
        set_scenarios_state(updatedScenariosStarting);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'START',
            scenario_id: scenario.id
        });
    
        if (response.data.result === "success") {
            const updatedScenariosSuccess = scenarios_state.map(s => {
                if (s.id === scenario.id) {
                    return { ...s, status: response.data.new_status };
                }
                return s;
            });
            set_scenarios_state(updatedScenariosSuccess);
        }
    };

    async function handleStopClick(event, scenario) {
        event.stopPropagation();
        const updatedScenariosStopping = scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 4 }; 
            }
            return s;
        });
        set_scenarios_state(updatedScenariosStopping);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'STOP',
            scenario_id: scenario.id
        });
    
        if (response.data.result === "success") {
            const updatedScenariosSuccess = scenarios_state.map(s => {
                if (s.id === scenario.id) {
                    return { ...s, status: response.data.new_status };
                }
                return s;
            });
            set_scenarios_state(updatedScenariosSuccess);
        }
    };
    async function handleDestroyClick(event, scenario) {
        event.stopPropagation();
        const updatedScenariosDestroying = scenarios_state.map(s => {
            if (s.id === scenario.id) {
                return { ...s, status: 8 }; 
            }
            return s;
        });
        set_scenarios_state(updatedScenariosDestroying);
    
        const response = await axios.post('/scenario_interface', {
            METHOD: 'DESTROY',
            scenario_id: scenario.id
        });
    
        if (response.data.result === "success") {
            // remove the scenario from list if success
            const updatedScenariosAfterDestroy = scenarios_state.filter(s => s.id !== scenario.id);
            set_scenarios_state(updatedScenariosAfterDestroy);
        }
    };
  
    function handleDetailClick (event, scenario) {
        set_desiredNavMetas_state([`/instructor/scenarios/${scenario.id}/0`, 'dash']);
    };

    const getGroupNameById = (groupId) => {
        const group = groups_state.find(group => group.id === groupId);
        return group ? group.name : 'none';
    };

    return (
        <div className="table-frame">
            <div className="table-header">
                <div className='table-cell-item col-xxsmall'>ID</div>
                <div className='table-cell-item col-large'>Scenario Name</div>
                <div className='table-cell-item col-large'>Type</div>
                <div className='table-cell-item col-medium'>St.Group</div>
                <div className='table-cell-item col-medium'>Status</div>
                <div className='table-cell-item control-panel'>CONTROL PANEL</div>
            </div>
            {scenarios_state.map((scenario, index) => (
                <div key={index + 2000} onClick={(event) => handleDetailClick(event, scenario)}>
                    <div className="table-row">
                        <div className='table-cell-item col-xxsmall'>{scenario.id}</div>
                        <div className='table-cell-item col-large'>{scenario.name}</div>
                        <div className='table-cell-item col-large'>{scenario.description}</div>
                        <div className='table-cell-item col-medium'>{getGroupNameById(scenario.membership)}</div>
                        <div className='table-cell-item col-medium'>{statusSwitch[scenario.status]}</div>
                        <div className='table-cell-item control-panel'>
                            <button className='row-btns green-btn' onClick={(event) => handleStartClick(event, scenario)}>START</button>
                            <button className='row-btns grey-btn' onClick={(event) => handleStopClick(event, scenario)}>STOP</button>
                            <button className='row-btns red-btn' onClick={(event) => handleDestroyClick(event, scenario)}>DESTROY</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
    
};
export default Instr_ScenTable;