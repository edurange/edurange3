import React, { useContext, useEffect } from 'react';
import '@assets/css/tables.css';
import '@student/chat/Chat_Student.css';
import '@student/chat/Chat_HistoryBox.css';
import Instr_SenderBox from '@student/chat/Instr_SenderBox';
import { InstructorRouter_context } from './Instructor_router';
import Instr_Chat_HistoryBox from '../student/chat/Instr_Chat_HistoryBox';

function Panopticon() {
    const {
        lastChat_ref, chatLibrary_state,
        selectedMessage_state, set_selectedMessage_state,
    } = useContext(InstructorRouter_context);

    if (!selectedMessage_state) {return}

    if (!chatLibrary_state) {
        return <>MISSING CHAT LIBRARY.</>;
    }

    return (
        <div className="table-frame">

            <div className="chatInstr-historyBox">
                <Instr_Chat_HistoryBox lastChat_ref={lastChat_ref} chatLibrary={chatLibrary_state} />
            </div>

            <Instr_SenderBox />
        </div>
    );
}

export default Panopticon;