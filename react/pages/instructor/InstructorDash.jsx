import React, { useState, useEffect } from 'react';

import Instructor_ScenTable from './Instructor_ScenTable';
import axios from 'axios';
import Instructor_ScenDetail from './Instructor_ScenDetail';
import { buildInstructorData } from '@modules/utils/buildInstructorData';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './CreateScenario.jsx';
import './InstructorDash.css';
import Instructor_GroupTable from './Instructor_GroupTable.jsx';

export const InstructorDashContext = React.createContext();

function InstructorDash() {

  // CREATE NEW SCENARIO GROUP 

  // State of desired name input field for adding NEW ScenarioGroup to db
  // IMPORTANT! (not to be confused with the name of currently existing scen group that is used as arg for create_scenario!)
  const [newScenGroup_name_state, set_newScenGroup_name_state] = useState('');
  const [instructorData_state, set_instructorData_state] = useState({});


  async function getData() {
    try {
      const response = await axios.get("/api/get_instructorData");
      const responseData = response.data;
      const instr_data = buildInstructorData(responseData);
      console.log(instr_data)
      set_instructorData_state(instr_data);
    }
    catch (error) { console.log('get_instructorData error:', error); };
  };

  useEffect(() => { getData(); }, []);

  const handle_newGroup_name_change = (event) => {
    set_newScenGroup_name_state(event.target.value);
  };
  function handle_createGroup_submit(event) {
    event.preventDefault();
    axios.post('/api/create_group', {
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


  // EXISTING SCENARIOS
  // state of info for currently selected scenario (previously created), from instructor table
  const [scenarioDetail_state, set_scenarioDetail_state] = useState({})

  return (

    <InstructorDashContext.Provider value={{
      instructorData_state
    }}>



      <div className='newdash-frame'>
        <div className='newdash-frame-carpet'>

          <Frame_side navToShow={'side_scenarios_instructor'} />

          <div className='instructor-dash-frame'>

            <div className='instructor-dash-column'>
              <div className='instructor-dash-section'>
                <Instructor_ScenDetail scenario_detail={scenarioDetail_state} />
              </div>

              <div className='instructor-dash-section'>
                <Instructor_ScenTable set_scenarioDetail_state={set_scenarioDetail_state} />
              </div>
            </div>


            <div className='instructor-dash-column'>
              <div className='instructor-dash-section'>
                <div className="group-creation-container">

                  <div className='instructor-dash-section'>
                    <form onSubmit={handle_createGroup_submit}>
                      <input
                        type="text"
                        className="group-input"
                        placeholder="Enter new group name"
                        value={newScenGroup_name_state}
                        onChange={handle_newGroup_name_change}
                      />
                      <button type="submit" className="group-submit-btn">Create Group</button>
                    </form>
                    <Instructor_GroupTable/>
                  </div>

                </div>
              </div>

              <div className='instructor-dash-section'>
                <CreateScenario />
              </div>
            </div>

          </div>
        </div>
      </div>
    </InstructorDashContext.Provider>

  );
}

export default InstructorDash;
