import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Instr_Dash from './dashboard/Instr_Dash';
import Chat_Instructor from './chat/Instr_Chat';
import Instr_SetMaster from './dashboard/Instr_SetMaster';
import Instr_Groups from './groups/Instr_Groups';
import Group_detail from './groups/Group_detail';
import Frame_side from '../../frame/sidenav/Frame_side';
import Instr_Scenarios from './scenarios/Instr_Scenarios';
import Instr_ScenDetail from './scenarios/Instr_ScenDetail';
import Instr_Students from './users/Instr_Students';
import Instr_ScenTable from './scenarios/Instr_ScenTable';

export const InstructorRouter_context = React.createContext();

function Instructor_router() {

    const [users_state, set_users_state] = useState([])
    const [groups_state, set_groups_state] = useState([])
    const [scenarios_state, set_scenarios_state] = useState([])
    const [scenarioDetail_state, set_scenarioDetail_state] = useState({})
    const [userDetail_state, set_userDetail_state] = useState({})
    const [tempUsers_state, set_tempUsers_state] = useState([]);

    async function get_instructorData() {
        try {
            const response = await axios.get("/get_instructor_data");
            const responseData = response.data;
            console.log('respy:', responseData);
            set_users_state(responseData?.users);
            set_groups_state(responseData?.groups);
            set_scenarios_state(responseData?.scenarios);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

    if (!scenarios_state) { return <></> }

    return (

        <div className='newdash-frame'>
            <div className='newdash-frame-carpet'>

            <Frame_side />

                <InstructorRouter_context.Provider value={{

                    users_state, set_users_state,
                    groups_state, set_groups_state,
                    scenarios_state, set_scenarios_state,

                    scenarioDetail_state, set_scenarioDetail_state,
                    userDetail_state, set_userDetail_state,
                    tempUsers_state, set_tempUsers_state
                }}>

                    <Routes>
                        <Route path="/*" element={<Instr_Dash />} />
                        <Route path="/scenarios/*" element={<Instr_Scenarios />} />
                        <Route path="/scenarios/:scenarioID" element={<Instr_SetMaster />} />
                        <Route path="/scenarios/:scenarioID/:pageID" element={<Instr_SetMaster />} />
                        <Route path="/scenarios/:scenarioID/chat" element={<Chat_Instructor />} />
                        <Route path="/groups/*" element={<Instr_Groups />} />
                        <Route path="/groups/:groupID/*" element={<Group_detail />} />
                        <Route path="/students/*" element={<Instr_Students />} />
                        <Route path="/students/:studentID/*" element={<Instr_SetMaster />} />
                    </Routes>

                </InstructorRouter_context.Provider>

            </div>
        </div>
    );
};

export default Instructor_router;
