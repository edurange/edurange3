import React, { useState, useEffect } from 'react';

import Instructor_ScenTable from './Instructor_ScenTable';
import axios from 'axios';
import Instructor_ScenDetail from './Instructor_ScenDetail';
import { buildInstructorData } from '@modules/utils/buildInstructorData';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './CreateScenario.jsx';
import './InstructorDash.css';
import Instructor_GroupTable from './Instructor_GroupTable.jsx';
import CreateGroup from './CreateGroup.jsx';

export const InstructorDashContext = React.createContext();

function InstructorDash() {

  const [instructorData_state, set_instructorData_state] = useState({});
  const [scenarioDetail_state, set_scenarioDetail_state] = useState({})

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

  return (

    <InstructorDashContext.Provider value={{
      instructorData_state, 
      scenarioDetail_state, set_scenarioDetail_state
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
                    <CreateGroup/>
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
