
import React, { useContext } from 'react';
import axios from 'axios';

import '@assets/css/tables.css';
import { InstructorRouter_context } from '../../Instructor_router';

function Instr_GroupTable() {

    const { instr_studentGroups_state, set_instr_studentGroups_state } = useContext(InstructorRouter_context);

    async function handle_deleteGroup_click(groupName) {
        try {
            const response = await axios.post(`/delete_group`, {
                group_name: groupName
            });
            if (response.data.group_name) {
                set_instr_studentGroups_state(prevState => prevState.filter(group => group.name !== response.data.group_name));
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    }

    if (!instr_studentGroups_state) { return <></> } 

    return (
        <div className="table-frame">

            <div className="table-header">
                <div className='table-cell-item col-xxsmall' >ID</div>
                <div className='table-cell-item col-medium'>Name</div>
                <div className='table-cell-item col-small'>Code</div>
                <div className='table-cell-item col-small'>Actions</div>
            </div>
            {
                instr_studentGroups_state.length > 1 ? (
                    instr_studentGroups_state.slice(2).map((group, index) => (
                        <div key={index}>
                            <div className="table-row">
                                <div className='table-cell-item col-xxsmall'>{group.id}</div>
                                <div className='table-cell-item col-medium'>{group.name}</div>
                                <div className='table-cell-item col-small'>{group.code}</div>
                                <div className='table-cell-item col-small'>
                                    <button onClick={() => handle_deleteGroup_click(group.name)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (<></>)
            }

        </div>
    );
};

export default Instr_GroupTable;