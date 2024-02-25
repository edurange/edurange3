
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';

function Group_detail() {

    const { groupID } = useParams();
    const { groups_state, set_groups_state } = useContext(InstructorRouter_context);

    console.log(typeof(groupID))
    console.log(typeof(groups_state?.[0]?.id));

    let thisGroup = groups_state
                        .filter(group => group.id === parseInt(groupID))
                        .map((group) => group);

    thisGroup = thisGroup[0];
                        
    if (!thisGroup) { return <>Group not found.</> } 

    const thisGroupID = (thisGroup?.id);

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


    return (
        <div className="table-frame">
            {/* <Placard placard_text={`Group: ${thisGroup.name}`}/> */}
            
            <div>
                Name:  {thisGroup.name}
            </div>
            <div>
                ID:  {thisGroup.id}
            </div>
            <div>
                Student Members:  {thisGroup.users.map((user)=> user.id).join(', ')}
            </div>

        </div>
    );
};

export default Group_detail;