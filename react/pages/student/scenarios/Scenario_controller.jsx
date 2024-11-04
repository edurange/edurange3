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

function Scenario_controller() {

    const { 
        userData_state, 
        scorebook_state, set_scorebook_state, 
        responseData_state, set_responseData_state, 
        guideContent_state, set_guideContent_state 
    } = useContext(HomeRouter_context);

    const [leftPaneName_state, set_leftPaneName_state] = useState("info");
    const [rightPaneName_state, set_rightPaneName_state] = useState("guide");
    const [sliderNum_state, set_SliderNum_state] = useState(45);
    const leftWidth = `${sliderNum_state}%`;
    const rightWidth = `${100 - sliderNum_state}%`;
    const rightOffset = `${sliderNum_state}%`;
    const { scenarioID, pageID } = useParams();
    
    if (!userData_state?.role) return (<>Log in to continue.</>)

    function handleSliderChange(event) {
        set_SliderNum_state(event.target.value);
    };

    if (!scenarioID) return (<>Missing Scenario ID</>)
    if (!guideContent_state) return (<>Missing Content</>)

    function compileScorebook(responseData) {
        const scenarioChapters = guideContent_state?.contentYAML?.studentGuide?.chapters ?? [];
        const scorebook = {};

        scenarioChapters.forEach((chapter) => {
            let chapterPointsPossible = 0;
            let chapterPointsAwarded = 0;

            chapter.content_array
                .filter((item) => item.type === "question")
                .forEach((question) => {
                    chapterPointsPossible += Number(question.points_possible ?? 0);

                    const response = responseData[question.question_num];
                    if (response) {
                        chapterPointsAwarded += Number(response.points_awarded ?? 0);
                    }
                });

            scorebook[chapter.chapter_num] = {
                points_possible: chapterPointsPossible,
                points_awarded: chapterPointsAwarded
            };
        });

        scorebook.total = {
            points_possible: Object.values(scorebook).reduce((acc, curr) => acc + curr.points_possible, 0),
            points_awarded: Object.values(scorebook).reduce((acc, curr) => acc + curr.points_awarded, 0)
        };

        return scorebook;
    }
    const scenario_type = guideContent_state?.scenario_meta?.scenario_type;
    const scenario_name = guideContent_state?.scenario_meta?.scenario_name;

    useEffect(() => {
        async function getYaml() {
            try {
                const contentReturn = await axios.get(`get_yaml_content/${scenarioID}`);
                const contentData = contentReturn.data;
                set_guideContent_state(contentData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getYaml();
    }, [scenarioID]);

    useEffect(() => {
        async function getResponses() {
            try {
                const contentReturn = await axios.post(`get_responses_byStudent`, {
                    scenario_id: scenarioID
                });
                
                const responseData = contentReturn?.data;
                const compiledScorebook = compileScorebook(responseData);

                set_responseData_state(responseData)
                set_scorebook_state(compiledScorebook);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getResponses();
    }, [guideContent_state]);

    if (!guideContent_state?.scenario_meta) return (<>Scenario not found</>);
    if (!guideContent_state) return null;

    const saniname = userData_state?.username.replace(/-/g, '');
    const SSH_username = guideContent_state.credentialsJSON?.[saniname]?.[0]?.username;
    const SSH_password = guideContent_state.credentialsJSON?.[saniname]?.[0]?.password;
    const SSH_IP = guideContent_state.SSH_IP;

    const theseChapters = guideContent_state?.contentYAML?.studentGuide?.chapters;
    const thisBriefing = guideContent_state?.briefingYAML?.studentGuide?.chapters;
    const thisDebrief = guideContent_state.debriefYAML?.studentGuide?.chapters;

    if (!theseChapters) return null;
    const fullBook = [...thisBriefing, ...theseChapters, ...thisDebrief];
    if (!fullBook) return null;

    const scenario_questions = theseChapters.flatMap(chapter =>
        chapter.content_array?.filter(item => item.type === 'question')
    ) || [];

    let scenario_points_possible = 0;
    scenario_questions.forEach((question) => {
        scenario_points_possible += question.points_possible;
    });

    let scenario_response_total_points = 0;
    for (let key in scorebook_state) {
        if (scorebook_state.hasOwnProperty(key)) {
            scenario_response_total_points += scorebook_state[key]?.points_awarded ?? 0;
        }
    }

    const panes = {

        info: (<InfoPane/>),

        guide: (<GuidePane
            fullBook={fullBook}
            chapter_num={pageID}
            meta={guideContent_state.scenario_meta}
            scenarioID={scenarioID}
            pageID={pageID}
        />),

        chat: (<Chat_Student scenario_id={scenarioID} scenario_type={scenario_type} scenario_name={scenario_name} />),
        
        ssh: (
            <SSH_web
                scenario_id={scenarioID}
                SSH_address={SSH_IP}
                SSH_username={SSH_username}
                SSH_password={SSH_password}
            />
        ),
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
                        <FootControls
                            page_number={pageID}
                            updatePane={set_leftPaneName_state}
                            fullBook={fullBook}
                            paneSide={"left"}
                            scenario_points_possible={scenario_points_possible ?? ''}
                            scenario_points_awarded={scenario_response_total_points ?? ''}
                            chapter_points_possible={scorebook_state[pageID]?.points_possible ?? ''}
                            chapter_points_awarded={scorebook_state[pageID]?.points_awarded ?? ''}
                            credentialsJSON={guideContent_state.credentialsJSON}
                            SSH_IP={guideContent_state.SSH_IP}
                        />
                    </div>
                    <div className='scenario-rightpane-frame' style={{ minWidth: rightWidth, maxWidth: rightWidth, left: rightOffset }}>
                        {rightPaneToShow}
                        <FootControls
                            page_number={pageID}
                            updatePane={set_rightPaneName_state}
                            fullBook={fullBook}
                            paneSide={"right"}
                            scenario_points_possible={scenario_points_possible ?? 0}
                            scenario_points_awarded={scenario_response_total_points ?? 0}
                            chapter_points_possible={scorebook_state[pageID]?.points_possible ?? 0}
                            chapter_points_awarded={scorebook_state[pageID]?.points_awarded ?? 0}
                            credentialsJSON={guideContent_state.credentialsJSON}
                            SSH_IP={guideContent_state.SSH_IP}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Scenario_controller;
