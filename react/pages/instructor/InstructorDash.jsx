import React, { useContext } from 'react';

import Instructor_ScenTable from './Instructor_ScenTable';
import Instructor_ScenDetail from './Instructor_ScenDetail';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './CreateScenario.jsx';
import './InstructorDash.css';
import Instructor_GroupTable from './Instructor_GroupTable.jsx';
import CreateGroup from './CreateGroup.jsx';
import { InstructorRouter_context } from './Instructor_router.jsx';
import Placard from '@components/Placard'

function InstructorDash() {

  const {
    instructorData_state, set_instructorData_state,
    scenarioDetail_state, set_scenarioDetail_state
  } = useContext( InstructorRouter_context );

  return (

      <div className='newdash-frame'>
        <div className='newdash-frame-carpet'>

          <Frame_side navToShow={'side_scenarios_instructor'} />

          <div className='instructor-dash-frame'>

            <div className='instructor-dash-column-main'>

              <div className='instructor-dash-section'>
                <Placard placard_text='STUDENT GROUPS'/>
                <CreateGroup/>
                <Instructor_GroupTable/>
              </div>

              <div className='instructor-dash-section'>
                <Placard placard_text='SCENARIOS'/>
                <CreateScenario />
                <Instructor_ScenTable set_scenarioDetail_state={set_scenarioDetail_state} />
                <div className='instructor-dash-section'>
                  <Instructor_ScenDetail scenario_detail={scenarioDetail_state} />
                </div>
              </div>


            </div>


            <div className='instructor-dash-column-alt'>
                  <div className='instructions-bubble'>
                    Basic instructions
                  </div>
                  <br />
                  <div className='instructions-bubble'>
                    First, ensure you have a student group with students.  If you don't
                    have a group, or the group doesn't have students, create a group and/or 
                    populate it with students, then proceed.
                  </div>
                  <div className='instructions-bubble'>
                    Next, choose a scenario 'type' from the dropdown menu.
                  </div>
                  <div className='instructions-bubble'>
                    Once you've chosen a type, input a UNIQUE name for your scenario. 
                    It is important that this name is not the same as another in your database.
                  </div>
                  <div className='instructions-bubble'>
                    Finally, type in the exact name of one of the CURRENTLY EXISTING student groups, and click CREATE.
                  </div>
                  <div className='instructions-bubble'>
                    IMPORTANT:  Currently, students cannot be added after a scenario is created, so it is important 
                    to create your group and its students BEFORE you create the scenario, if you want those students to have access.
                  </div>

                </div>
              </div>

            </div>

        </div>

  );
}

export default InstructorDash;
