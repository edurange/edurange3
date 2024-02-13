
import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomeRouterContext } from '@home/Home_router';
import Scenario_controller from './guide/Scenario_controller';
import Scenarios_home from './Scenarios_home';
import Chat_Student from '@chat/student/Chat_Student';
import Notifications from '@notifications/Notifications';
import { navArrays } from '@modules/nav/navItemsData';
import Frame_side from '@frame/sidenav/Frame_side';
export const ScenariosRouterContext = React.createContext();

function Scenarios_router() {

  const { 
    login_state, set_login_state,
    navName_state,
    userData_state, set_userData_state
  } = useContext(HomeRouterContext);

  const fakeNotif= {
    id: 123,
    timeStamp: Date.now(),
    message: "something"
  }
  
  const [notifsArray_state, set_notifsArray_state] = useState([fakeNotif]);
  
  const navLongname = `side_${navName_state}`
  const navToShow = navArrays[navLongname];

    const [guideBook_state, set_guideBook_state] = useState({});
    const [guideContent_state, set_guideContent_state] = useState({});
    const [scenarioList_state, set_scenarioList_state] = useState([]);
    const [scenarioPage_state, set_scenarioPage_state] = useState({
        chapter: 0,
        sectionAnchor: 0,
    });
    const [guideMeta_state, set_guideMeta_state] = useState({
        created_at: null,
        scenario_description: null,
        scenario_id: null,
        group_name: null,
        scenario_owner_id: null,
        scenario_status: null,
    });

    /////////////////////////////////////////////////

    async function fetchScenarioList() {
        try {
            const response = await axios.get("/api/get_scenarios");
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

                <Frame_side navToShow={navToShow} smallMode={true} hiddenMode={false} />

                <div className="newdash-infopane-frame">
                    <div className='newdash-infopane-content'>

                        <ScenariosRouterContext.Provider value={{
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

                                <Route path="/notifications" element={<Notifications notifsArray={notifsArray_state} />} />
                            </Routes>
                        </ScenariosRouterContext.Provider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scenarios_router;
