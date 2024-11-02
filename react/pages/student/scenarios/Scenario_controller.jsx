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

    const { userData_state, responseData_state, set_responseData_state, scorebook_state, set_scorebook_state } = useContext(HomeRouter_context);

    const [guideContent_state, set_guideContent_state] = useState({});

    const [leftPaneName_state, set_leftPaneName_state] = useState("info");
    const [rightPaneName_state, set_rightPaneName_state] = useState("guide");
    const meta = guideContent_state.scenario_meta;

    const [sliderNum_state, set_SliderNum_state] = useState(45); // pane size ratio, bigger num = bigger left side
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

    function compileScorebook (responseData) {
        const scenarioChapters = guideContent_state?.contentYAML?.studentGuide?.chapters ?? [];
        const scorebook = {
            0: {
                points_possible : 0,
                points_awarded : 0
            },
            1337: {
                points_possible : 0,
                points_awarded : 0
            }
        };
        for (let i = 0 ; i < scenarioChapters.length; i++) {

            let thisChapPointsPossible = 0;

            scenarioChapters[i].content_array
                .filter((chapter)=> chapter.type === "question")
                .map((chapter) => {
                thisChapPointsPossible += Number(chapter.points_possible)
            });

            let thisChapPointsAwarded = 0;
        
            for (let key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                    thisChapPointsAwarded += responseData_state[key].points_awarded
                }
            }

            const newScoreEntry = {
                points_possible : thisChapPointsPossible,
                points_awarded : scenarioChapters[i].points_awarded ?? 0
            };
            scorebook [ scenarioChapters[i].chapter_num ] = newScoreEntry
        }
        return scorebook;
    };

    const scenario_type = guideContent_state?.scenario_meta?.scenario_type;
    const scenario_name = guideContent_state?.scenario_meta?.scenario_name;

    useEffect(() => {
        async function getYaml() {
            try {
                const contentReturn = await axios.get(`get_yaml_content/${scenarioID}`);
                const contentData = contentReturn.data;
                console.log('contendata: ', contentData)
                set_guideContent_state(contentData);

            } catch (error) {
                console.error('Error fetching data:', error);
            };
        };
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
                set_responseData_state(responseData);
                set_scorebook_state(compiledScorebook);
            } catch (error) {
                console.error('Error fetching data:', error);
            };
        };
        getResponses();
    }, [guideContent_state]);

    if ((!meta)) { return (<>Scenario not found</>); }; // GUARD
    if (!guideContent_state) {
        console.log('missing guideContent_state')
        return
    }

    const saniname = userData_state?.username.replace(/-/g, '');
    const SSH_username = guideContent_state.credentialsJSON?.[saniname]?.[0]?.username;
    const SSH_password = guideContent_state.credentialsJSON?.[saniname]?.[0]?.password;
    const SSH_IP = guideContent_state.SSH_IP;

    const theseChapters = guideContent_state?.contentYAML?.studentGuide?.chapters;
    const thisBriefing = guideContent_state?.briefingYAML?.studentGuide?.chapters;
    const thisDebrief = guideContent_state.debriefYAML?.studentGuide?.chapters;

    if (!theseChapters) { return null };
    const fullBook = [...thisBriefing, ...theseChapters, ...thisDebrief]
    if (!fullBook) { return null };

    const scenario_questions = theseChapters?.flatMap(chapter =>
        chapter.content_array?.filter(item => item.type === 'question')
    ) || [];

    let scenario_points_possible = 0;
    let chapter_points_possible = 0;

    scenario_questions.map((question) => {
        scenario_points_possible += question.points_possible
    })

    let chapter_response_total_points = 0;
    let scenario_response_total_points = 0;

    for (let key in responseData_state) {
        if (responseData_state.hasOwnProperty(key)) {
            scenario_response_total_points += responseData_state[key].points_awarded
        }
    }

    if (Number(pageID) > 0 && (Number(pageID) !== 1337)) {

        const thisChapter = theseChapters[Number(pageID - 1)]
        const chapter_questions = thisChapter.content_array?.filter(item => item.type === 'question')

        chapter_questions.map(question => chapter_points_possible += question.points_possible)
        const chapter_question_nums = chapter_questions.map(chap => Number(chap.question_num))

        for (let i = 0; i < chapter_question_nums.length; i++) {
            const this_response = responseData_state[chapter_question_nums[i]]
            chapter_response_total_points += this_response?.points_awarded ?? 0
        }
    }

    const panes = {
        info: (<InfoPane guideContent={guideContent_state} />),
        guide: (<GuidePane
            chapter_num={pageID}
            meta={meta}
            guideContent={fullBook}
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
                            guideContent={guideContent_state?.contentYAML}
                            updatePane={set_leftPaneName_state}
                            paneSide={"left"}
                            scenario_points_possible={scenario_points_possible}
                            scenario_points_awarded={scenario_response_total_points}
                            chapter_points_possible={chapter_points_possible}
                            chapter_points_awarded={chapter_response_total_points}
                            credentialsJSON={guideContent_state.credentialsJSON}
                            SSH_IP={guideContent_state.SSH_IP}
                        />
                    </div>

                    <div className='scenario-rightpane-frame' style={{ minWidth: rightWidth, maxWidth: rightWidth, left: rightOffset }}>
                        {rightPaneToShow}
                        {<FootControls
                            page_number={pageID}
                            guideContent={guideContent_state?.contentYAML}
                            updatePane={set_rightPaneName_state}
                            paneSide={"right"}
                            scenario_points_possible={scenario_points_possible}
                            scenario_points_awarded={scenario_response_total_points}
                            chapter_points_possible={chapter_points_possible}
                            chapter_points_awarded={chapter_response_total_points}
                            credentialsJSON={guideContent_state.credentialsJSON}
                            SSH_IP={guideContent_state.SSH_IP}
                        />}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Scenario_controller;
