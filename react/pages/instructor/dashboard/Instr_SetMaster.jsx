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
    instr_scenarios_state,
    scenarioDetail_state,
    set_instr_scenarioDetail_state } = useContext(InstructorRouter_context);
    const [guideContent_state, set_guideContent_state] = useState({});

    const { scenarioID, pageID } = useParams();
    const [guideBook_state, set_guideBook_state] = useState([])

    // if ((guideBook_state.length < 1) || (!meta)) { return (<>Scenario not found</>); } // GUARD

    const tabActiveClass = 'setmaster-controlbar-tab setmaster-tab-active';
    const tabInactiveClass = 'setmaster-controlbar-tab setmaster-tab-inactive';
  
    useEffect(() => {
      async function getContent() {
        try {
          const contentReturn = await axios.get(`get_content/${scenarioID}`);
          const contentData = contentReturn.data;
          set_guideContent_state(contentData);
        } catch (error) {
          console.error('Error fetching data:', error);
        };
      };
      getContent();
    }, [scenarioID]);
  
    // const chapterToShow = () => {
    //   if (Number(pageID) === 0){ return <HomeChapter/>; }
    //   else if (Number(pageID) === 1337){ return <HomeChapter/>; }
    //   else { return guideBook_state[Number(pageID) - 1]; }
    // };

  const { userData_state } = useContext(HomeRouter_context);

  if (!guideContent_state) { return <></> }

  console.log(guideContent_state)

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
                      Scenario ID: 12345
                    </div>
                    <div className='setmaster-info-item'>
                      Scenario Name: getsta123
                    </div>
                    <div className='setmaster-info-item'>
                      Scenario Type: Getting_Started
                    </div>
                    <div className='setmaster-info-item'>
                      Current Group: Group123
                    </div>
                    <div className='setmaster-info-item'>
                      Students: 12
                    </div>
                    <div className='setmaster-info-item'>
                      Scenario Status: Started
                    </div>
                  </div>
                  <div>
                    Student Table
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
