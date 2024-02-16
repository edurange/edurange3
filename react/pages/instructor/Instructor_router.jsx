import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import InstructorDash from './InstructorDash';
import { buildInstructorData } from '@modules/utils/instructor_utils';

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
            console.log(instr_data)
            console.log(responseData)
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
                <Route path="/" element={<InstructorDash />}/>
            </Routes>

        </InstructorRouter_context.Provider>
    );
};

export default Instructor_router;
