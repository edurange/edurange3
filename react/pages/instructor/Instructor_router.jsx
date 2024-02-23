import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Instr_Dash from './dashboard/Instr_Dash';
import { buildInstructorData } from '@modules/utils/instr_modules';
import Scenario_controller from '../student/scenarios/Scenario_controller';
import Chat_Instructor from './chat/Instr_Chat';
import Instr_ScenDetail from './dashboard/components/Instr_ScenDetail';
import Instr_SetMaster from './dashboard/Instr_SetMaster';

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
            set_users_state(responseData?.users);
            set_groups_state(responseData?.groups);
            set_scenarios_state(responseData?.scenarios);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

    if (!scenarios_state) {return <></>}

    return (
        <InstructorRouter_context.Provider value={{

            users_state, set_users_state,
            groups_state, set_groups_state,
            scenarios_state, set_scenarios_state,

            scenarioDetail_state, set_scenarioDetail_state,
            userDetail_state, set_userDetail_state,
            tempUsers_state, set_tempUsers_state
            }}>

            <Routes>
                <Route path="/*" element={<Instr_Dash />}/>
                <Route path="/scenarios/*" element={<Instr_SetMaster />}/>
                <Route path="/scenarios/:scenarioID" element={<Instr_SetMaster />} />
                <Route path="/scenarios/:scenarioID/:pageID" element={<Instr_SetMaster />} />
                <Route path="/scenarios/:scenarioID/chat" element={<Chat_Instructor />} />
            </Routes>

        </InstructorRouter_context.Provider>
    );
};

export default Instructor_router;
