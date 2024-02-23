
import React, { useContext } from 'react';
import axios from 'axios';

import '@assets/css/tables.css';
import { InstructorRouter_context } from '../../Instructor_router';
import Copy_button_small from '../../../../components/Copy_button_small';

function Instr_GroupTable() {

    const { groups_state, set_groups_state } = useContext(InstructorRouter_context);

    async function handle_deleteGroup_click(groupName) {
        try {
            const response = await axios.post(`/delete_group`, {
                group_name: groupName
            });
            if (response.data.group_name) {
                set_groups_state(prevState => prevState.filter(group => group.name !== response.data.group_name));
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    }

    if (!groups_state) { return <></> } 

    return (
        <div className="table-frame">

            <div className="table-header">
                <div className='table-cell-item col-xxsmall' >ID</div>
                <div className='table-cell-item col-xlarge'>Name</div>
                <div className='table-cell-item col-medium'>Code</div>
                <div className='table-cell-item col-medium'>UserCt</div>
                <div className='table-cell-item col-medium control-panel'>CONTROL PANEL</div>
            </div>
            {
                groups_state.length > 0 ? (
                    groups_state
                    .filter(group => group.name !== 'ALL')
                    .map((group, index) => (
                        <div key={index}>
                            <div className="table-row">
                                <div className='table-cell-item col-xxsmall'>{group.id}</div>
                                <div className='table-cell-item col-xlarge'>{group.name}</div>
                                <div className='table-cell-item col-medium'>{group.code} <Copy_button_small thingToCopy={group.code}/></div>
                                <div className='table-cell-item col-medium table-userlist'>{group.users?.length ?? 0}</div>
                                <div className='table-cell-item col-medium control-panel'>
                                    <button className='row-btns red-btn' onClick={() => handle_deleteGroup_click(group.name)}>Delete</button>
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