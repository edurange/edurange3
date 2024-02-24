
import React, { useContext } from 'react';
import axios from 'axios';

import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';

function Group_detail() {

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


        </div>
    );
};

export default Group_detail;