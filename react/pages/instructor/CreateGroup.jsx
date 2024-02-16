
import axios from 'axios';
import React, { useState } from 'react';
import './InstructorDash.css';
import '@assets/css/tables.css';

function CreateGroup() {
  const [groupName_state, set_groupName_state] = useState('');
  const [testUsersBool_state, set_testUsersBool_state] = useState(false);
  const [testUserCt_state, set_testUserCt_state] = useState(1);

  const handle_newGroup_name_change = (event) => {
    set_groupName_state(event.target.value);
  };

  function handle_testUsersBool_toggle (event) {
    set_testUsersBool_state(event.target.checked);
  };

  function handle_testUserCt_change (event) {
    const value = parseInt(event.target.value, 10);
    if (value >= 0 && value <= 100) {
      set_testUserCt_state(value);
    }
  };

  async function handle_createGroup_submit (event) {
    event.preventDefault();
    if (!groupName_state){return;}
    if (groupName_state?.length < 3 || groupName_state?.length > 25) {
      alert('Group name length must be between 3 and 25');
      return;
    }
    try {
      const response = await axios.post('/create_group', {
        group_name: groupName_state,
        should_generate: testUsersBool_state,
        new_user_count: testUserCt_state,
        code: '12345' // FIX , GROUP CODE
      });
      console.log('Group created:', response.data);
      set_groupName_state(''); // Reset the input field after submission
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };
  

  return (
    <div className='create-frame'>
      CREATE NEW GROUP
      <form className='create-group-row' onSubmit={handle_createGroup_submit}>
        <input
          type="text"
          className="create-group-input"
          placeholder="Enter new group name"
          value={groupName_state}
          onChange={handle_newGroup_name_change}
        />

        <div className='gen-test-users-frame'>

          <div className='box-and-text-container'>

            <div className='gen-test-users-text'>
              GENERATE TEMP USERS?
            </div>
            <input
              className='test-user-checkbox'
              type="checkbox"
              checked={testUsersBool_state}
              onChange={handle_testUsersBool_toggle}
            />
          </div>
          {testUsersBool_state && (
            <div>
              <input
                type="number"
                value={testUserCt_state}
                onChange={handle_testUserCt_change}
                min="1"
                max="100"
              />
            </div>
          )}
        </div>

        <div className='row-btns'>
          <button type="submit" className="submit-btn row-btn">CREATE</button>
        </div>

      </form>
    </div>
  );
}

export default CreateGroup;


// import { scenarioShells } from '@modules/shells/scenarioType_shells';
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import './InstructorDash.css';
// import '@assets/css/tables.css'


// function CreateGroup() {

//   const [groupName_state, set_groupName_state] = useState('');

//   const handle_newGroup_name_change = (event) => {
//     set_groupName_state(event.target.value);
//   };
//   function handle_createGroup_submit(event) {
//     event.preventDefault();
//     axios.post('/create_group', {
//       group_name: groupName_state
//     })
//       .then(response => {
//         console.log('Group created:', response.data);
//         set_groupName_state(''); // Reset the input field after submission
//       })
//       .catch(error => {
//         console.error('Error creating group:', error);
//       });
//   };

//   return (
//     <div className='create-frame'>
//       CREATE NEW GROUP
//       <form className='create-group-row' onSubmit={handle_createGroup_submit}>
//         <input
//           type="text"
//           className="create-group-input"
//           placeholder="Enter new group name"
//           value={groupName_state}
//           onChange={handle_newGroup_name_change}
//         />

//         <div className='gen-test-users-frame'>
//           <div className='gen-test-users-text'>
//             GENERATE TEST USERS?
//           </div>
//           <checkbox>
//             check box here
//           </checkbox>
//           <input>
//             arrow-based input to select an integer (up to 100)
//             preferably this only displays if checkbox is checked
//           </input>
//         </div>

//         <div className='row-btns'>
//           <button type="submit" className="submit-btn row-btn">CREATE</button>
//         </div>

//       </form>
//     </div>
//   )
// } export default CreateGroup;