
import React, { useContext } from 'react';
import { InstructorRouter_context } from '../Staff_router';
import Copy_button_flex from '@components/Copy_button_flex';
import '../scenarios/Staff_TableGrid.css'; 
import axios from 'axios';
import { AppContext } from '../../../config/AxiosConfig';


function Staff_GroupsGrid() {
    const {
        groups_state, set_groups_state
    } = useContext(InstructorRouter_context);

    const {
        errorModal_state, set_errorModal_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        clipboard_state, set_clipboard_state
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

    function handleDetailClick(event, group) {
        event.stopPropagation();
        set_desiredNavMetas_state([`/staff/groups/${group.id}`, 'dash']);
    };

    return (
        <div className="table-groupsgrid">
            <div className="table-tablegrid-header">
                <div className="tablegrid-header-item">ID</div>
                <div className="tablegrid-header-item">Group Name</div>
                <div className="tablegrid-header-item">Code</div>
                <div className="tablegrid-header-item">User Count</div>
                <div className="tablegrid-header-item">C_PANEL</div>
            </div>
            {groups_state.length > 0 ? (
                groups_state
                    .filter(group => group.name !== 'ALL')
                    .map((group, index) => (
                        <div key={index + 432} className="table-tablegrid-row" onClick={(event) => handleDetailClick(event, group)}>
                            <div className="tablegrid-item">{group.id}</div>
                            <div className="tablegrid-item">{group.name}</div>
                            <div className="tablegrid-item gap-small nopad">
                                <Copy_button_flex textLabel={group.code} thingToCopy={group.code} />
                            </div>
                            <div className="tablegrid-item table-userlist">{group.users?.length ?? 0}</div>
                            <div className="tablegrid-item">
                                <button className='tablegrid-btn red-btn' onClick={(event) => handle_deleteGroup_click(event, group.name)}>DELETE</button>
                            </div>
                        </div>
                    ))
            ) : (
                <></>
            )}
        </div>
    );
};
export default Staff_GroupsGrid;