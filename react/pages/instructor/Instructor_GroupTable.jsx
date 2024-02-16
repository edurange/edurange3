import React, { useContext } from 'react';

import '@assets/css/tables.css';
import { InstructorRouter_context } from './Instructor_router';

function Instructor_GroupTable() {

    const { instr_studentGroups_state } = useContext(InstructorRouter_context);

    if (!instr_studentGroups_state) {return <></>}
    
    return (
        <div className="table-frame">

            <div className="table-header">
                <div className='table-cell-item col-xsmall' >ID</div>
                <div className='table-cell-item col-medium'>Name</div>
                <div className='table-cell-item col-small'>Code</div>
            </div>
            {instr_studentGroups_state.slice(0).map((group, index) => (
                <div key={index}>
                    <div className="table-row">
                        <div className='table-cell-item col-xsmall'>{group.id}</div>
                        <div className='table-cell-item col-medium'>{group.name}</div>
                        <div className='table-cell-item col-small'>{group.code}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Instructor_GroupTable;