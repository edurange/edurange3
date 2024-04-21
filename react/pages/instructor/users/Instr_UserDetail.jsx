
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
    const { users_state, groups_state, lastChat_ref } = useContext(InstructorRouter_context);
    const thisUser = users_state.filter(user => user.id === parseInt(userID))?.[0]
                        
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
            <div className="chatInstr-historyBox">
                <Instr_Chat_HistoryBox user_obj={thisUser} lastChat_ref={lastChat_ref} />
            </div>
            <Instr_SenderBox user_to_message={thisUser}/>

        </div>
    );
};

export default Instr_UserDetail;