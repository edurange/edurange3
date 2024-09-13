import axios from 'axios';
import React, { useContext } from 'react';
import { StaffRouter_context } from '../Staff_router';
import { HomeRouter_context } from '@pub/Home_router';
import edurange_icons from '../../../modules/ui/edurangeIcons';
import { AppContext } from '../../../config/AxiosConfig';
import './Staff_TableGrid.css';

export const statusSwitch = {
    0: <span className='status-disabled'>Stopped</span>,
    1: <span className='status-success'>Started</span>,
    2: <span className='status-error'>Unknown</span>,
    3: <span className='status-neutral'>Starting</span>,
    4: <span className='status-neutral'>Stopping</span>,
    5: <span className='status-error'>ERROR</span>,
    7: <span className='status-standby'>Building</span>,
    8: <span className='status-standby'>Destroying</span>,
    9: <span className='status-neutral'>Archiving</span>,
    10: <span className='status-disabled'>Archived</span>
};

function Staff_ScenGrid() {

    const {
        groups_state,
        scenarios_state, set_scenarios_state
    } = useContext(StaffRouter_context);
    const {
        desiredNavMetas_state, set_desiredNavMetas_state,
    } = useContext(AppContext);

    if (!groups_state) { return <></> }

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
            const updatedScenariosAfterDestroy = scenarios_state.filter(s => s.id !== scenario.id);
            set_scenarios_state(updatedScenariosAfterDestroy);
        }
    };

    function handleDetailClick(event, scenario) {
        set_desiredNavMetas_state([`/staff/scenarios/${scenario.id}`, 'dash']);
    };

    const getGroupNameById = (groupId) => {
        const group = groups_state.find(group => group.id === groupId);
        return group ? group.name : 'none';
    };

    return (
<div className="table-scengrid">
    <div className="table-tablegrid-header">
        <div className="tablegrid-header-item">ID</div>
        <div className="tablegrid-header-item">Scenario Name</div>
        <div className="tablegrid-header-item">Type</div>
        <div className="tablegrid-header-item">St.Group</div>
        <div className="tablegrid-header-item">Status</div>
        <div className="tablegrid-header-item">C_PANEL</div>
    </div>
    {scenarios_state.map((scenario, index) => (
        <div key={index} className="table-tablegrid-row" onClick={(event) => handleDetailClick(event, scenario)}>
            <div className="tablegrid-item">{scenario.id}</div>
            <div className="tablegrid-item">{scenario.name}</div>
            <div className="tablegrid-item">{scenario.scenario_type}</div>
            <div className="tablegrid-item">{getGroupNameById(scenario.membership)}</div>
            <div className="tablegrid-item">{statusSwitch[scenario.status]}</div>
            <div className="tablegrid-item">
                <button
                    className='tablegrid-btn green-btn'
                    onClick={(event) => handleStartClick(event, scenario)}
                    title="Start Scenario" 
                >
                    {edurange_icons.playSign}
                </button>
                <button
                    className='tablegrid-btn grey-btn'
                    onClick={(event) => handleStopClick(event, scenario)}
                    title="Stop Scenario" 
                >
                    {edurange_icons.stopSign}
                </button>
                <button
                    className='tablegrid-btn red-btn'
                    onClick={(event) => handleDestroyClick(event, scenario)}
                    title="Destroy Scenario" 
                >
                    {edurange_icons.trash}
                </button>
            </div>
        </div>
    ))}
</div>

    );

};
export default Staff_ScenGrid;
