import React, { useContext, useEffect, useState } from 'react';
import '@assets/css/tables.css';
import '@student/chat/Chat_Student.css';
import '@student/chat/Chat_HistoryBox.css';
import Instr_SenderBox from '@student/chat/Instr_SenderBox';
import { InstructorRouter_context } from './Instructor_router';
import Msg_Bubble from '../student/chat/Msg_Bubble';
import { HomeRouter_context } from '../pub/Home_router';

function Panopticon() {
    const {
        lastChat_ref, chatLibrary_state,
        selectedMessage_state, set_selectedMessage_state,
    } = useContext(InstructorRouter_context);

    const { userData_state } = useContext(HomeRouter_context);
    const [messages, setMessages] = useState([]);

    if (!selectedMessage_state) {return}

    useEffect(() => {
        if (chatLibrary_state) {
            const allMessages = [];
            Object.values(chatLibrary_state).forEach(chatArray => {
                allMessages.push(...chatArray);
            });
            setMessages(allMessages);
        }
    }, [chatLibrary_state]);

    const handleCheckboxChange = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    if (!chatLibrary_state) {
        return <>MISSING CHAT LIBRARY.</>;
    }

    return (
        <div className="table-frame">
            <div className="chatInstr-historyBox">
                <div className="instr-historybox-frame">
                    <div className='chat-historybox-carpet'>
                        {messages.map((chat, index) => (
                            <div key={index} ref={index === messages.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                                <input
                                    type="checkbox"
                                    checked={selectedMessage_state === chat}
                                    onChange={(e) => handleCheckboxChange(chat, e.target.checked)}
                                    className="message-select-checkbox"
                                />
                                <Msg_Bubble user_id={userData_state?.id} message_obj={chat} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Instr_SenderBox />
        </div>
    );
}

export default Panopticon;