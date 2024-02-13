
import { scenarioShells } from '@modules/shells/scenarioType_shells';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

function CreateScenario() {

  const [newScenType_state, set_newScenType_state] = useState('');
  const [newScenName_state, set_newScenName_state] = useState('');
  const [newScen_groupName_state, set_newScen_groupName_state] = useState('');
  
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
    console.log('submit clicked');
    axios.post('/api/scenario_interface', {
      METHOD: 'CREATE',
      type: newScenType_state,
      name: newScenName_state,
      group_name: newScen_groupName_state
    });
  };

  return (
    <div>
      New Scenario Type:
      <form onSubmit={handle_createScenario_submit}>
        <select value={newScenType_state} onChange={handle_scenType_change} defaultValue="">
          <option value="" disabled>Choose Scenario Type</option>
          {Object.keys(scenarioShells).map((key) => {
            const scenario = scenarioShells[key];
            return (
              <option key={key} value={scenario.type}>{scenario.type}</option>
            );
          })}
        </select>
        <br />
        New Scenario Name:
        <br />
        <input
          type="text"
          placeholder="scenario unique name"
          value={newScenName_state}
          onChange={handle_scenName_change}
        />
        <br />
        <input
          type="text"
          placeholder="student group name"
          value={newScen_groupName_state}
          onChange={handle_groupName_change}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateScenario;


// import { scenarioShells } from '@modules/shells/scenarioType_shells';
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';

// function CreateScenario() {

//   const [newScenType_state, set_newScenType_state] = useState('');
//   const [newScenName_state, set_newScenName_state] = useState('');

//   const [newScen_groupName_state, set_newScen_groupName_state] = useState('');

//   const handle_scenTypebtn_change = (event) => {
//     set_newScenType_state(event.target.value);
//   };
//   const handle_scenName_change = (event) => {
//     set_newScenName_state(event.target.value);
//   };
//   const handle_groupName_change = (event) => {
//     set_newScen_groupName_state(event.target.value);
//   };


//     const handle_createScenario_submit = (event) => {
//         event.preventDefault();
//         console.log('submit clicked')
//         axios.post('/api/scenario_interface', {
//           METHOD: 'CREATE',
//           type: newScenType_state,
//           name: newScenName_state,
//           group_name: newScen_groupName_state
//         })
//       };

//     return (

//         <div>

//             New Scenario Type:
//             <form onSubmit={handle_createScenario_submit}>
//                 {Object.keys(scenarioShells).map((key) => {
//                     const scenario = scenarioShells[key];
//                     return (

//                         <div key={key}>
//                             <input
//                                 type="radio"
//                                 name="scenarioType"
//                                 value={scenario.type}
//                                 checked={newScenType_state === scenario.type}
//                                 onChange={handle_scenTypebtn_change}
//                             />
//                             <label>{scenario.type}</label>
//                         </div>
//                     );
//                 })}
//                 New Scenario Name:
//                 <br></br>
//                 <input
//                     type="text"
//                     placeholder="scenario unique name"
//                     value={newScenName_state}
//                     onChange={handle_scenName_change}
//                 />
//                 <br></br>
//                 <input
//                     type="text"
//                     placeholder="student group name"
//                     value={newScen_groupName_state}
//                     onChange={handle_groupName_change}
//                 />
//                 <button type="submit">Submit</button>
//             </form>
//         </div>)
// } export default CreateScenario;