import { scenarioShells } from '@modules/shells/scenarioType_shells';
import axios from 'axios';
import React, { useState, useContext } from 'react';
import './InstructorDash.css';
import { InstructorRouter_context } from './Instructor_router';

function CreateScenario() {
  const [newScenType_state, set_newScenType_state] = useState('');
  const [newScenName_state, set_newScenName_state] = useState('');
  const [newScen_groupName_state, set_newScen_groupName_state] = useState('');
  const { instr_scenarios_state, instr_studentGroups_state, set_instr_scenarioDetail_state } = useContext(InstructorRouter_context);

  const handle_scenType_change = (event) => {
    set_newScenType_state(event.target.value);
  };
  const handle_scenName_change = (event) => {
    set_newScenName_state(event.target.value);
  };
  const handle_groupName_change = (event) => {
    set_newScen_groupName_state(event.target.value);
  };

  const handle_createScenario_submit = (event) => {
    event.preventDefault();
    if (!newScenName_state){
        console.log('wowie')
      return;
  }
    if (newScenName_state?.length < 3 || newScenName_state?.length > 25) {
      console.log('wowie')
    alert('Group name length must be between 3 and 25');
    return;
  }
    console.log('submit clicked');
    axios.post('/scenario_interface', {
      METHOD: 'CREATE',
      type: newScenType_state,
      name: newScenName_state,
      group_name: newScen_groupName_state
    });
  };

  if (!instr_scenarios_state) { return <></> }
  console.log(instr_scenarios_state)

  return (
    <div className='create-frame'>
      CREATE NEW SCENARIO
      <form onSubmit={handle_createScenario_submit} className='row-aligned form-frame'>

        <select
          value={newScen_groupName_state}
          onChange={handle_groupName_change}
        >
          <option value="" disabled>Choose Group</option>
          {instr_studentGroups_state.length > 2 ? (
            instr_studentGroups_state.slice(0).map((group, index) => (
              <option key={index} value={group.name}>{group.name}</option>
            ))) : (
            <option disabled>No groups found</option>
          )}
        </select>

        <select
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
        
        <button className='submit-btn row-btn' type="submit">CREATE</button>

      </form>
    </div>
  );
} export default CreateScenario;