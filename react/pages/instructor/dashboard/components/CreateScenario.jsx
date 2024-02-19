
import { scenarioShells } from '@modules/shells/scenarioType_shells';
import axios from 'axios';
import React, { useState, useContext } from 'react';
import '../Instr_Dash.css';
import { InstructorRouter_context } from '../../Instructor_router';

function CreateScenario() {
  const [newScenType_state, set_newScenType_state] = useState('');
  const [newScenName_state, set_newScenName_state] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { instr_scenarios_state, instr_studentGroups_state, set_instr_scenarioDetail_state } = useContext(InstructorRouter_context);
  const [buttonDisabled_state, set_buttonDisabled_state] = useState(true);

  const handle_scenType_change = (event) => {
    set_newScenType_state(event.target.value);
    set_buttonDisabled_state(!event.target.value || !newScenName_state || !selectedGroup);
  };
  const handle_scenName_change = (event) => {
    set_newScenName_state(event.target.value);
    set_buttonDisabled_state(!event.target.value || !newScenType_state || !selectedGroup);
  };
  const handle_groupName_change = (event) => {
    const selectedGroupName = event.target.value;
    const group = instr_studentGroups_state.find(group => group.name === selectedGroupName);
    setSelectedGroup(group);
    set_buttonDisabled_state(!selectedGroupName || !newScenType_state || !newScenName_state);
  };

  const handle_createScenario_submit = (event) => {
    event.preventDefault();
    if (!newScenName_state) {
      return;
    }
    if (newScenName_state.length < 3 || newScenName_state.length > 25) {
      alert('Group name length must be between 3 and 25');
      return;
    }
    axios.post('/scenario_interface', {
      METHOD: 'CREATE',
      type: newScenType_state,
      name: newScenName_state,
      group_name: selectedGroup?.name,
      code: selectedGroup?.code
    });
    set_buttonDisabled_state(true);
  };

  if (!instr_scenarios_state) { return <></> }

  return (
    <div className='create-frame'>
      CREATE SCENARIO
      <form onSubmit={handle_createScenario_submit} className='row-aligned form-frame'>
        <select className='create-dropdown' value={selectedGroup?.name || ''} onChange={handle_groupName_change}>
          <option value="" disabled>{selectedGroup ? '' : 'Choose Group'}</option>
          {instr_studentGroups_state.length > 2 ? (
            instr_studentGroups_state.slice(2).map((group, index) => (
              <option key={index} value={group.name}>{group.name}</option>
            ))
          ) : (
            <option value="" disabled>No groups found</option>
          )}
        </select>
        <select
          className='create-dropdown' 
          value={newScenType_state}
          onChange={handle_scenType_change}
        >
          <option value="" disabled>Choose Scenario Type</option>
          {Object.keys(scenarioShells).map((key) => {
            const scenario = scenarioShells[key];
            return (
              <option key={key} value={scenario.type}>{scenario.type}</option>
            );
          })}
        </select>
        <input
          className='create-input-fields'
          type="text"
          placeholder="Enter a unique name"
          value={newScenName_state}
          onChange={handle_scenName_change}
        />
        <button className={`${buttonDisabled_state ? 'btn-disabled' : 'submit-btn row-btn' }`} type="submit" disabled={buttonDisabled_state}>
          CREATE
        </button>
      </form>
    </div>
  );
}
export default CreateScenario;

