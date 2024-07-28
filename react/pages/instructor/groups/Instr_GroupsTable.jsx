
import React, { useContext } from 'react';
import axios from 'axios';
import Copy_button_flex from '@components/Copy_button_flex';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '@pub/Home_router';
import '@assets/css/tables.css';
import { AppContext } from '../../../config/AxiosConfig';


function Instr_GroupsTable() {

    const { groups_state, set_groups_state } = useContext(InstructorRouter_context);

    const {
        desiredNavMetas_state, set_desiredNavMetas_state,
    } = useContext(AppContext);

    async function handle_deleteGroup_click(event, groupName) {
        event.stopPropagation();

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
    function handleDetailClick (event, group) {
        event.stopPropagation();
        set_desiredNavMetas_state([`/instructor/groups/${group.id}`, 'dash']);
    };

    if (!groups_state) { return <></> } 

    return (
        <div className="table-frame">

            <div className="table-header">
                <div className='table-header-item col-xxsmall' >ID</div>
                <div className='table-header-item col-xlarge'>Group Name</div>
                <div className='table-header-item col-medium'>Code</div>
                <div className='table-header-item col-medium'>UserCt</div>
                <div className='table-header-item control-panel'>CONTROL PANEL</div>
            </div>
            {
                groups_state.length > 0 ? (
                    groups_state
                    .filter(group => group.name !== 'ALL')
                    .map((group, index) => (
                        <div key={index + 432} onClick={(event) => handleDetailClick(event, group)}>
                            <div className="table-row">
                                <div className='table-cell-item highlightable-cell col-xxsmall'>{group.id}</div>
                                <div className='table-cell-item highlightable-cell col-xlarge'>{group.name}</div>
                                <div className='table-cell-item highlightable-cell col-medium gap-small nopad'><Copy_button_flex textLabel={group.code} thingToCopy={group.code}/></div>
                                <div className='table-cell-item col-medium table-userlist'>{group.users?.length ?? 0}</div>
                                <div className='table-cell-item highlightable-cell control-panel'>
                                    <button className='row-btns red-btn' onClick={(event) => handle_deleteGroup_click(event, group.name)}>DELETE</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (<></>)
            }

        </div>
    );
};

export default Instr_GroupsTable;