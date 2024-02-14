import { scenarioShells } from '@modules/shells/scenarioType_shells';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

function CreateGroup() {

  const [newScenGroup_name_state, set_newScenGroup_name_state] = useState('');

  const handle_newGroup_name_change = (event) => {
    set_newScenGroup_name_state(event.target.value);
  };
  function handle_createGroup_submit(event) {
    event.preventDefault();
    axios.post('/create_group', {
      group_name: newScenGroup_name_state
    })
      .then(response => {
        console.log('Group created:', response.data);
        set_newScenGroup_name_state(''); // Reset the input field after submission
      })
      .catch(error => {
        console.error('Error creating group:', error);
      });
  };
    return (
      <div className='create-frame'>
      CREATE NEW GROUP
      <form className='create-frame' onSubmit={handle_createGroup_submit}>
      <input
        type="text"
        className="group-input"
        placeholder="Enter new group name"
        value={newScenGroup_name_state}
        onChange={handle_newGroup_name_change}
        />
      <button type="submit" className="group-submit-btn">CREATE</button>
    </form>
        </div>
    )
} export default CreateGroup;