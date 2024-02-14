import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import InstructorDash from './InstructorDash';
import { buildInstructorData } from '@modules/utils/buildInstructorData';

export const InstructorRouter_context = React.createContext();

function Instructor_router() {

    const [instructorData_state, set_instructorData_state] = useState({});
    const [scenarioDetail_state, set_scenarioDetail_state] = useState({})

    async function get_instructorData() {
        try {
            console.log("GETTING INSTRDATA")
            const response = await axios.get("/get_instructorData");
            const responseData = response.data;
            const instr_data = buildInstructorData(responseData);
            set_instructorData_state(instr_data);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);
    if (!instructorData_state) {return <></>}
    console.log(instructorData_state)
    return (
        <InstructorRouter_context.Provider value={{ 
            instructorData_state, set_instructorData_state,
            scenarioDetail_state, set_scenarioDetail_state
            }}>
            <Routes>
                <Route path="/" element={<InstructorDash />}/>
            </Routes>
        </InstructorRouter_context.Provider>
    );
};

export default Instructor_router;
