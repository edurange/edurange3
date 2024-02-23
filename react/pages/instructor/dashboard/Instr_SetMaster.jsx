import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import Frame_side from '@frame/sidenav/Frame_side';
import './Instr_Dash.css';
import './Instr_SetMaster.css';
import { InstructorRouter_context } from '../Instructor_router';
import { Link, useParams } from 'react-router-dom';
import { HomeRouter_context } from '../../pub/Home_router';
import buildGuide from '../../../modules/utils/guide_modules';

function Instr_SetMaster() {

  const {
    
    users_state, set_users_state,
    groups_state, set_groups_state,
    scenarios_state, set_scenarios_state,
    scenario_groups_state, set_scenario_groups_state,
    scenarioDetail_state, set_scenarioDetail_state} = useContext(InstructorRouter_context);

    const { scenarioID, pageID } = useParams();

    const tabActiveClass = 'setmaster-controlbar-tab setmaster-tab-active';
    const tabInactiveClass = 'setmaster-controlbar-tab setmaster-tab-inactive';
  
  const { userData_state } = useContext(HomeRouter_context);

  console.log("users_state: ",users_state);
  console.log("groups_state: ", groups_state);
  console.log("scenario_groups_state", scenario_groups_state);
  console.log("scenarios_state: ", scenarios_state);
  console.log("DEETS: ",scenarioDetail_state)
  if (!scenarioDetail_state) { return <></> }



  console.log('tgroup: ', groups_state)

  return (

    <div className='newdash-frame'>
      <div className='newdash-frame-carpet'>

        <Frame_side />

        <div className='instructor-dash-frame'>

            <div className='setmaster-controlbar-frame'>
              <div className='setmaster-controlbar-placard-frame'>
                <div className='setmaster-controlbar-placard-item'>

                  SCENARIO NAME: getsta123  
                </div>
                <div className='setmaster-controlbar-placard-item'>
                  TYPE: GETTING_STARTED
                </div>
              </div>
              <div className='setmaster-controlbar-tabs-frame'>

                <Link
                  to={`/instructor/scenarios/${scenarioID}/info`}
                  className={`setmaster-tab-left ${pageID === "info" ? tabActiveClass : tabInactiveClass}`}>
                  <div className='setmaster-controlbar-tab'>
                    Info
                  </div>
                </Link>
                <Link
                  to={`/instructor/scenarios/${scenarioID}/chat`}
                  className={`setmaster-tab-middles ${pageID === "chat" ? tabActiveClass : tabInactiveClass}`}>
                  <div className='setmaster-controlbar-tab'>
                    Chat
                  </div>
                </Link>
                <Link
                  to={`/instructor/scenarios/${scenarioID}/edit`}
                  className={`setmaster-tab-right ${pageID === "edit" ? tabActiveClass : tabInactiveClass}`}>
                  <div className='setmaster-controlbar-tab'>
                    Edit
                  </div>
                </Link>

                
              </div>
              <div className='setmaster-content-frame'>
                <div className='setmaster-set-frame'>
                  <div className='setmaster-info-frame'>
                    <div className='setmaster-info-item'>
                      {/* Scenario ID: {guideContent_state?.scenario_meta?.scenario_id} */}
                    </div>
                    <div className='setmaster-info-item'>
                      {/* Scenario Name: {guideContent_state?.unique_scenario_name} */}
                    </div>
                    <div className='setmaster-info-item'>
                      {/* Scenario Type: {guideContent_state?.scenario_meta?.scenario_description} */}
                    </div>
                    <div className='setmaster-info-item'>
                      Current Group: Group123? (fix)
                    </div>
                    <div className='setmaster-info-item'>
                      Students: 12 (fix)
                    </div>
                    <div className='setmaster-info-item'>
                      {/* Scenario Status: {guideContent_state?.scenario_meta?.scenario_status} */}
                    </div>
                  </div>
                  <div>
                    
                  </div>
                </div>
                CONTENT AREA
              </div>
            </div>

        </div>
      </div>
    </div>

  );
}

export default Instr_SetMaster;
