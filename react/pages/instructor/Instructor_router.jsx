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

    const [instr_students_state, set_instr_students_state] = useState([])
    const [instr_studentGroups_state, set_instr_studentGroups_state] = useState([])
    const [instr_scenarios_state, set_instr_scenarios_state] = useState([])
    const [instr_scenarioGroups_state, set_instr_scenarioGroups_state] = useState([])
    const [instr_scenarioDetail_state, set_instr_scenarioDetail_state] = useState({})

    async function get_instructorData() {
        try {
            const response = await axios.get("/get_instructor_data");
            const responseData = response.data;
            const instr_data = buildInstructorData(responseData);
            console.log("Instructor Data: ",instr_data)
            set_instr_students_state(instr_data.users);
            set_instr_studentGroups_state(instr_data.userGroups);
            set_instr_scenarios_state(instr_data.scenarios);
            set_instr_scenarioGroups_state(instr_data.scenarioGroups);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

    if (!instr_scenarios_state) {return <></>}

    return (
        <InstructorRouter_context.Provider value={{
            instr_students_state, set_instr_students_state,
            instr_studentGroups_state, set_instr_studentGroups_state,
            instr_scenarios_state, set_instr_scenarios_state,
            instr_scenarioGroups_state, set_instr_scenarioGroups_state,
            instr_scenarioDetail_state, set_instr_scenarioDetail_state
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
