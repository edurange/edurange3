import React, { useContext } from 'react';
import Instr_ScenTable from './tables/Instr_ScenTable.jsx';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './components/CreateScenario.jsx';
import Instr_GroupTable from './tables/Instr_GroupTable.jsx';
import CreateGroup from './components/CreateGroup.jsx';
import Placard from '@components/Placard'
import Creation_Instructions from './components/Creation_Instructions.jsx';
import { InstructorRouter_context } from '../Instructor_router.jsx';
import './Instr_Dash.css';
import TestUsers from './TestUsers.jsx';

function Instr_Dash() {

  const { 
    scenarios_state, 
    scenarioDetail_state, 
    set_scenarioDetail_state, tempUsers_state, set_tempUsers_state  } = useContext(InstructorRouter_context);

  if (!scenarios_state) { return <></> }

  return (

    <div className='newdash-frame'>
      <div className='newdash-frame-carpet'>

        <Frame_side />

        <div className='instructor-dash-frame'>

          <div className='instructor-dash-column-main'>
            <div className='instructor-dash-section'>
              <Placard placard_text='STUDENT GROUPS' />
              <CreateGroup />
              <Instr_GroupTable />
            </div>
            <div className='instructor-dash-section'>
              <Placard placard_text='SCENARIOS' />
              <CreateScenario />
              <Instr_ScenTable set_scenarioDetail_state={set_scenarioDetail_state} />
            </div>
          </div>

          <div className='instructor-dash-column-alt'>

            <TestUsers userList={tempUsers_state}/>
            <Creation_Instructions />
          </div>
        </div>

      </div>
    </div>

  );
}

export default Instr_Dash;
