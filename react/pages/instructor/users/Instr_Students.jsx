import React, { useContext } from 'react';
import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Instr_StudentsTable from './Instr_StudentsTable';

function Instr_Students() {

    const { groups_state } = useContext(InstructorRouter_context);

    if (!groups_state) { return <></> } 

    return (
        <div className="table-frame">
            <Instr_StudentsTable/>
        </div>
    );
};

export default Instr_Students;