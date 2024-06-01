
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
        users_state, lastChat_ref, 
        chatObjs_UL_state, // unordered list
        channelAccess_state
    } = useContext(InstructorRouter_context);

    const thisUser = users_state.filter(user => user.id === parseInt(userID))?.[0]
                        
    if (!thisUser || !channelAccess_state || !chatObjs_UL_state) { return <>Required data not found.</> } 
    
    const user_channels = channelAccess_state[thisUser.id]
    if (!user_channels) { return <>user_channels not found.</> } 


    return (
        <div className="table-frame">

            <div className="chatInstr-historyBox">
                <Instr_Chat_HistoryBox selectedUser_obj={thisUser} lastChat_ref={lastChat_ref} chatObjs_array={chatObjs_UL_state} />
            </div>
            <Instr_SenderBox/>

        </div>
    );
};

export default Instr_UserDetail;