import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import FootControls from './controls/FootControls';
import InfoPane from './panes/info/InfoPane';
import GuidePane from './panes/guide/GuidePane';
import SSH_web from './panes/ssh/SSH_web';
import Chat_Student from '../chat/Chat_Student';
import { useParams } from 'react-router-dom';
import { HomeRouter_context } from '@pub/Home_router';
import './Scenario_controller.css';
import "@frame/frame.css";
import { StudentRouter_context } from '../Student_router';
import buildGuide from '@modules/utils/guide_modules';

function Scenario_controller() {

    const { scenarioID, pageID } = useParams();
    const { responseData_state, set_responseData_state } = useContext(StudentRouter_context);
    const { userData_state } = useContext(HomeRouter_context);
    const [guideContent_state, set_guideContent_state] = useState({});
    const [guideBook_state, set_guideBook_state] = useState([])

    const [leftPaneName_state, set_leftPaneName_state] = useState("info");
    const [rightPaneName_state, set_rightPaneName_state] = useState("guide");
    const meta = guideContent_state.scenario_meta;

    const [sliderNum_state, set_SliderNum_state] = useState(45); // pane size ratio, bigger num = bigger left side
    const leftWidth = `${sliderNum_state}%`;
    const rightWidth = `${100 - sliderNum_state}%`;
    const rightOffset = `${sliderNum_state}%`;

    if (!userData_state?.role) return (<>Log in to continue.</>)

    function handleSliderChange(event) {
        set_SliderNum_state(event.target.value);
    };

    if (!scenarioID) return (<>Missing Scenario ID</>)
    
    const scenario_type = guideContent_state?.scenario_meta?.scenario_description;

    useEffect(() => {
        async function getContent() {
            try {
                const contentReturn = await axios.get(`get_content/${scenarioID}`);
                const contentData = contentReturn.data;
                const contentJSON = contentReturn?.data?.contentJSON
                const guideReturn = buildGuide(scenarioID, contentJSON);
                
                set_guideContent_state(contentData);
                set_guideBook_state(guideReturn);

            } catch (error) {
                console.error('Error fetching data:', error);
            };
        };
        getContent();
    }, [scenarioID]);
    
    
    useEffect(() => {
        async function getResponses() {
            try {
                const contentReturn = await axios.post(`get_responses_byStudent`, {
                    scenario_id: scenarioID
                });
                const contentData = contentReturn?.data;
                set_responseData_state(contentData);
            } catch (error) {
                console.error('Error fetching data:', error);
            };
        };
        getResponses();
    }, []);
    

    if ((!meta)) { return (<>Scenario not found</>); }; // GUARD
    if (!guideBook_state || !guideContent_state) {return}

    const saniname = userData_state?.username.replace(/-/g, '');
    const SSH_username = guideContent_state.credentialsJSON?.[saniname]?.[0]?.username;
    const SSH_password = guideContent_state.credentialsJSON?.[saniname]?.[0]?.password;
    const SSH_IP = guideContent_state.SSH_IP;

    const panes = {
        info: (<InfoPane guideContent={guideContent_state}/>),
        guide: (<GuidePane guideBook={guideBook_state} guideContent={guideContent_state} />),
        chat: (<Chat_Student scenario_type={scenario_type} />),
        ssh: (
            <SSH_web
                scenario_id={scenarioID}
                SSH_address={SSH_IP}
                SSH_username={SSH_username}
                SSH_password={SSH_password}
            />
        )
    };

    const leftPaneToShow = panes[leftPaneName_state];
    const rightPaneToShow = panes[rightPaneName_state];

    const scenario_questions = guideBook_state?.flatMap(chapter => 
        chapter.filter(item => item.itemContentType === 'question')
      );
    let scenario_points = 0;
    scenario_questions.map(question => scenario_points += question.itemContent?.Points)
    
    const chapter_questions = scenario_questions.filter(question => question.chapterNumber === Number(pageID))
    let chapter_points = 0;
    chapter_questions.map(question => chapter_points += question.itemContent?.Points)

    const chapter_pointers = chapter_questions.map (chap => Number(chap.itemContentPointer))

    let chapter_response_total_points = 0;
    let scenario_response_total_points = 0;
    
    for (let key in responseData_state) {
        if (responseData_state.hasOwnProperty(key)) {
            scenario_response_total_points += responseData_state[key].points_awarded
        }
      }
    for (let i = 0; i < chapter_pointers.length; i++) {
        const this_response = responseData_state[chapter_pointers[i]]
        chapter_response_total_points += this_response?.points_awarded ?? 0
    }

    return (
        <>
            <div className='scenario-paneSlider-frame'>
                <input className='scenario-paneSlider' type="range" min="0" max="100" value={sliderNum_state} onChange={handleSliderChange} />
            </div>
            <div className='scenario-frame'>
                <div className='scenario-frame-carpet'>
                    <div className="scenario-leftpane-frame" style={{ minWidth: leftWidth, maxWidth: leftWidth }}>
                        {leftPaneToShow}
                        <FootControls
                            page_number={pageID}
                            guideContent={guideContent_state}
                            guideBook={guideBook_state}
                            updatePane={set_leftPaneName_state}
                            paneSide={"left"}
                            scenario_points_possible={scenario_points}
                            scenario_points_awarded={scenario_response_total_points}
                            chapter_points_possible={chapter_points}
                            chapter_points_awarded={chapter_response_total_points}
                        />
                    </div>

                    <div className='scenario-rightpane-frame' style={{ minWidth: rightWidth, maxWidth: rightWidth, left: rightOffset }}>
                        {rightPaneToShow}
                        { <FootControls
                            page_number={pageID}
                            guideContent={guideContent_state}
                            guideBook={guideBook_state}
                            updatePane={set_rightPaneName_state}
                            paneSide={"right"}
                            scenario_points_possible={scenario_points}
                            scenario_points_awarded={scenario_response_total_points}
                            chapter_points_possible={chapter_points}
                            chapter_points_awarded={chapter_response_total_points}
                        /> }
                    </div>
                </div>
            </div>
        </>
    );
};
export default Scenario_controller;
