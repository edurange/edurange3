
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';
import Instr_Chat from '../chat/Instr_Chat';

function Instr_UserDetail() {

    const { userID } = useParams();
    const { scenarios_state, users_state, groups_state } = useContext(InstructorRouter_context);

    console.log(users_state)
    console.log('param user id: ', userID);
    const thisUser = users_state.filter(user => user.id === parseInt(userID))?.[0]

    console.log(thisUser)
    // thisUser = thisUser[0];
                        
    if (!thisUser) { return <>User not found.</> } 


    function getMembershipGroup(){

        const membershipGroup = groups_state?.
        filter((group) => group.id === thisUser.membership)
        
        return membershipGroup?.[0]
    }

    const membershipGroup = getMembershipGroup();

    return (
        <div className="table-frame">

            Chat should be here
            <Instr_Chat />
            
            <div>
                Username:  {thisUser.username}
            </div>
            <div>
                User ID:  {thisUser.id}
            </div>
            <div>
                <br></br>
            </div>
            <div>
                User Belongs to Group:
                <div>
                    Group Name: {membershipGroup?.name}
                </div>
                <div>
                    Group ID: {membershipGroup?.id}
                </div>
                <div>
                    Group Users Ct: {membershipGroup?.users?.length}
                </div>
            </div>

        </div>
    );
};

export default Instr_UserDetail;