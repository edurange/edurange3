
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Scenario_controller from './scenarios/Scenario_controller';
import Scenarios_home from './scenarios/Scenarios_home';
import Chat_Student from '@student/chat/Chat_Student';
import Frame_side from '@frame/sidenav/Frame_side';
export const StudentRouter_context = React.createContext();
import '@assets/css/dashboard.css';

function Student_router() {

    const fakeNotif = {
        id: 123,
        timeStamp: Date.now(),
        message: "something"
    }

    const [notifsArray_state, set_notifsArray_state] = useState([fakeNotif]);
    const [guideBook_state, set_guideBook_state] = useState({});
    const [guideContent_state, set_guideContent_state] = useState({});
    const [scenarioList_state, set_scenarioList_state] = useState([]);
    const [scenarioPage_state, set_scenarioPage_state] = useState({
        chapter: 0,
        sectionAnchor: 0,
    });

    /////////////////////////////////////////////////

    async function fetchScenarioList() {
        try {
            const response = await axios.get("/get_group_scenarios");
            if (response.data.scenarioTable) {
                set_scenarioList_state(response.data.scenarioTable);
            };
        }
        catch (error) { console.log('get_scenarios_list error:', error); };
    };
    useEffect(() => { fetchScenarioList(); }, []);

    return (

        <div className='newdash-frame'>
            <div className='newdash-frame-carpet'>

                <Frame_side smallMode={true} hiddenMode={false} />

                <div className="newdash-infopane-frame">
                    <div className='newdash-infopane-content'>

                        <StudentRouter_context.Provider value={{
                            scenarioList_state, set_scenarioList_state,
                            scenarioPage_state, set_scenarioPage_state,
                            guideBook_state, set_guideBook_state,
                            guideContent_state, set_guideContent_state,
                            notifsArray_state, set_notifsArray_state
                        }}>
                            <Routes>
                                <Route path="/" element={<Scenarios_home />} />
                                <Route path="/:scenarioID" element={<Scenario_controller />} />
                                <Route path="/:scenarioID/:pageID" element={<Scenario_controller />} />
                                <Route path="/:scenarioID/chat" element={<Chat_Student />} />
                            </Routes>
                        </StudentRouter_context.Provider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student_router;
