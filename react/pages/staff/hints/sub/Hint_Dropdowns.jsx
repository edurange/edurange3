import React, { useContext } from 'react';
import { StaffRouter_context } from '../../Staff_router';
import '../Hints_Main.css';
import { HintConfig_Context } from '../Hints_Controller';

function Hint_Dropdowns() {

    const {
        users_state,
        groups_state,
        scenarios_state,
    } = useContext(StaffRouter_context);

    const {
        selectedScenario_state, set_selectedScenario_state, 
        selectedHintUser_state, set_selectedHintUser_state
    } = useContext(HintConfig_Context);

    return (
        <div className="dropdowns-container">
            <div className="scenario-select">
                <label htmlFor="scenarioSelectLabel">Group:</label>
                <select
                    id="scenarioSelect"
                    value={selectedScenario_state ? selectedScenario_state.id : ""}
                    onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selectedOption = scenarios_state.find(option => Number(option.id) === selectedId);
                        if (selectedOption) {
                            set_selectedScenario_state(selectedOption);
                        } else {
                            console.error('No matching scenario found!');
                        }
                    }
                    }
                    style={{ marginRight: '10px' }}
                >

                    <option value="">Select Scenario</option>
                    {scenarios_state.map((option) => (
                        <option key={option.id} value={option.id}>{`${option.name} (${option.scenario_type} id: ${option.id})`}</option>
                    ))}
                </select>
            </div>

            <div className="user-select">
                <label htmlFor="userSelectLabel">User:</label>
                <select
                    id="userSelect"
                    value={selectedHintUser_state ? selectedHintUser_state?.username : ""}
                    onChange={(event) => {

                        const selectedId = Number(event.target.value);
                        const selectedOption = users_state.find(option => Number(option.id) === selectedId);
                        
                        if (selectedOption) {
                            set_selectedHintUser_state(selectedOption);
                        } else {
                            console.error('No matching user found!');
                        }
                    }
                    }
                    style={{ marginRight: '10px' }}
                >
                    <option value="">{selectedHintUser_state ? selectedHintUser_state.username : "Select User"}</option>
                    {users_state.map((option) => (
                        <option key={option.id} value={option.id}>{`${option.username} (group: ${groups_state.find(groupOption => Number(option.membership) === Number(groupOption.id))?.name ?? ""}, id: ${option.id})`}</option>
                    ))}
                </select>
            </div>
        </div>

    );
}

export default Hint_Dropdowns;
