import React, { useContext, useEffect } from 'react';
import '@assets/css/tables.css';
import '@student/chat/Chat_Student.css';
import '@student/chat/Chat_HistoryBox.css';
import Instr_SenderBox from '@student/chat/Instr_SenderBox';
import { InstructorRouter_context } from './Instructor_router';
import Instr_Chat_HistoryBox from '../student/chat/Instr_Chat_HistoryBox';

function Panopticon() {
    const {
        lastChat_ref, chatObjs_UL_state,
        selectedMessage_state, set_selectedMessage_state,
    } = useContext(InstructorRouter_context);

    // if (!selectedMessage_state) {
    //     console.log('selectedMessageState not found')
    //     return <>MISSING selectedMessageState</>;
    // }

    if (!chatObjs_UL_state) {
        return <>MISSING CHAT LIBRARY.</>;
    }

    console.log('panopticon loaded successfully')
    console.log(selectedMessage_state)
    return (
        <div className="table-frame">

            <div className="chatInstr-historyBox">
                <Instr_Chat_HistoryBox lastChat_ref={lastChat_ref} chatObjs_array={chatObjs_UL_state} />
            </div>

            <Instr_SenderBox 
                scenario_type={selectedMessage_state?.scenario_type} 
                scenario_id={selectedMessage_state?.scenario_id} 
            />
        </div>
    );
}

export default Panopticon;