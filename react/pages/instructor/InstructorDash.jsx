import React, { useContext } from 'react';
import Instructor_ScenTable from './tables/Instructor_ScenTable.jsx';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './CreateScenario.jsx';
import Instructor_GroupTable from './tables/Instructor_GroupTable.jsx';
import CreateGroup from './CreateGroup.jsx';
import Placard from '@components/Placard'
import Creation_Instructions from './Creation_Instructions.jsx';
import { InstructorRouter_context } from './Instructor_router.jsx';
import { HomeRouter_context } from '../home/Home_router.jsx';
import { navArrays } from '@modules/nav/navItemsData.jsx';
import './InstructorDash.css';

function InstructorDash() {

  const { 
    instr_scenarios_state, 
    scenarioDetail_state, 
    set_instr_scenarioDetail_state } = useContext(InstructorRouter_context);
  const { 
    navName_state } = useContext(HomeRouter_context);

  if (!instr_scenarios_state) { return <></> }
  if (!navName_state) {return <></>}

  const navArr_toShow = navArrays[`side_${navName_state}`];
  return (

    <div className='newdash-frame'>
      <div className='newdash-frame-carpet'>

        <Frame_side navArr_toShow={navArr_toShow} />

        <div className='instructor-dash-frame'>

          <div className='instructor-dash-column-main'>
            <div className='instructor-dash-section'>
              <Placard placard_text='STUDENT GROUPS' />
              <CreateGroup />
              <Instructor_GroupTable />
            </div>
            <div className='instructor-dash-section'>
              <Placard placard_text='SCENARIOS' />
              <CreateScenario />
              <Instructor_ScenTable set_instr_scenarioDetail_state={set_instr_scenarioDetail_state} />
            </div>
          </div>

          <div className='instructor-dash-column-alt'>
            <Creation_Instructions />
          </div>
        </div>

      </div>
    </div>

  );
}

export default InstructorDash;
