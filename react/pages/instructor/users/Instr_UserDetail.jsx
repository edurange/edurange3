
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import '@assets/css/tables.css';
import '../../student/chat/Chat_Student.css'
import '../../student/chat/Chat_HistoryBox.css'
import { InstructorRouter_context } from '../Instructor_router';
import Instr_SenderBox from '../../student/chat/Instr_SenderBox';
import Instr_Chat_HistoryBox from '../../student/chat/Instr_Chat_HistoryBox';

function Instr_UserDetail() {

    const { userID } = useParams();
    const { 
        users_state, groups_state, lastChat_ref, 
        chatLibrary_state, set_chatLibrary_state,
        channelAccess_state, set_channelAccess_state,
    } = useContext(InstructorRouter_context);
    const thisUser = users_state.filter(user => user.id === parseInt(userID))?.[0]
                        
    if (!thisUser) { return <>User not found.</> } 
    if (!channelAccess_state) { return <>User not found.</> } 
    if (!chatLibrary_state) { return <>User not found.</> } 

    const user_channels = channelAccess_state[thisUser.id]

    const msglist = []
    user_channels.forEach(chan => {
        chatLibrary_state[chan]?.map((message) => msglist.push(message));
    });

    function getMembershipGroup(){

        const membershipGroup = groups_state?.
        filter((group) => group.id === thisUser.membership)
        
        return membershipGroup?.[0]
    }
    return (
        <div className="table-frame">

            <div className="chatInstr-historyBox">
                <Instr_Chat_HistoryBox user_obj={thisUser} lastChat_ref={lastChat_ref} messages_array={msglist} />
            </div>
            <Instr_SenderBox/>

        </div>
    );
};

export default Instr_UserDetail;