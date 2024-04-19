
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';
import Chat_Instructor from '../chat/Chat_Instructor';
import Chat_HistoryBox from '../../student/chat/Chat_HistoryBox';
import Chat_SenderBox from '../../student/chat/Chat_SenderBox';

function Instr_UserDetail() {

    const { userID } = useParams();
    const { scenarios_state, users_state, groups_state, set_chatHistory_state, chatHistory_state, lastChat_ref } = useContext(InstructorRouter_context);

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
            <div className="chatStu-historyBox">
                <Chat_HistoryBox chatSessionID='someSessionID' chatHistory_state={chatHistory_state} lastChat_ref={lastChat_ref} />
            </div>
            <Chat_SenderBox user_to_message={thisUser}/>

        </div>
    );
};

export default Instr_UserDetail;