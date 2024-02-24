import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import "@frame/frame.css";
import './Instr_ScenDetail.css';
import InfoPane from '../../student/scenarios/panes/info/InfoPane';
import SSH_web from '../../student/scenarios/panes/ssh/SSH_web';
import { HomeRouter_context } from '../../pub/Home_router';
import Chat_Instructor from '../chat/Instr_Chat';
import GuidePane from '../../student/scenarios/panes/guide/GuidePane';

function Instr_ScenDetail() {
  
  const { scenarioID, pageID } = useParams();
  const { userData_state } = useContext(HomeRouter_context);
  const [guideContent_state, set_guideContent_state] = useState({});

  const [leftPaneName_state, set_leftPaneName_state] = useState("info");
  const [rightPaneName_state, set_rightPaneName_state] = useState("guide");
  const meta = guideContent_state.scenario_meta;

  const [sliderNum_state, set_SliderNum_state] = useState(45); // pane size ratio, bigger num = bigger left side
  const leftWidth = `${sliderNum_state}%`;
  const rightWidth = `${100-sliderNum_state}%`;
  const rightOffset = `${sliderNum_state}%`;

  if (!userData_state?.role) return (<>Log in to continue.</>)

  function handleSliderChange (event) {
    set_SliderNum_state(event.target.value);
};

  if (!scenarioID) return (<>Missing Scenario ID</>)
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


  if ((!meta)) { return (<>Scenario not found</>); }; // GUARD
  if ((!guideContent_state)) { return (<>Scenario not found</>); }; // GUARD

  console.log(guideContent_state?.credentialsJSON?.username)
  const SSH_username = guideContent_state.credentialsJSON.username;
  const SSH_password = guideContent_state.credentialsJSON.password;

  const SSH_IP = guideContent_state.SSH_IP;

  const panes = {
    info : (
      <InfoPane
        guideContent={guideContent_state}
      />
    ),  
    ssh : (
      <SSH_web
        scenario_id={scenarioID}
        SSH_address={SSH_IP}
        SSH_username={SSH_username}
        SSH_password={SSH_password} 
      />
    ), 

    chat: (<Chat_Instructor/>),

    guide : (<GuidePane guideContent={guideContent_state}/>)
  };
  const leftPaneToShow = panes[leftPaneName_state];
  const rightPaneToShow = panes[rightPaneName_state];

  return (
    <>
    <div className='scenario-paneSlider-frame'>
                    <input className='scenario-paneSlider' type="range" min="0" max="100" value={sliderNum_state} onChange={handleSliderChange} />
    </div>
      <div className='scenario-frame'>
        <div className='scenario-frame-carpet'>
          <div className="scenario-leftpane-frame" style={{ minWidth: leftWidth, maxWidth: leftWidth }}>
            {leftPaneToShow}
            {/* <FootControls 
              guideContent={guideContent_state} 
              updatePane={set_leftPaneName_state}
              paneSide={"left"}
            /> */}
          </div>

          <div className='scenario-rightpane-frame' style={{ minWidth: rightWidth, maxWidth: rightWidth, left: rightOffset }}>
            {rightPaneToShow}
            {/* <FootControls  
              guideContent={guideContent_state} 
              updatePane={set_rightPaneName_state}
              paneSide={"right"}
            /> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default Instr_ScenDetail;