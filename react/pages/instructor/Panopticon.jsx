

import React, { useContext } from 'react';
import '@assets/css/tables.css';
import '@student/chat/Chat_Student.css'
import '@student/chat/Chat_HistoryBox.css'
import Instr_SenderBox from '@student/chat/Instr_SenderBox';
import Instr_Chat_Unibox from '@student/chat/Instr_Chat_HistoryBox';
import { InstructorRouter_context } from './Instructor_router';
import Instr_Groups from './groups/Instr_Groups';

function Panopticon() {

    const {
        users_state, groups_state, lastChat_ref,
        chatLibrary_state, set_chatLibrary_state,
        channelAccess_state, set_channelAccess_state,
    } = useContext(InstructorRouter_context);

    // if (!channelAccess_state) { return <>User not found.</> } 

    console.log('panop here')
    if (!chatLibrary_state) { return <>MISSING CHAT LIBRARY.</> }
    console.log('panop here 2')

    const handleCheckboxChange = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    console.log('LIBRARY : ', chatLibrary_state)

    const messages_array = []

    if (!messages_array) { return }


    return (
        <div className="table-frame">
            <div className="chatInstr-historyBox">
                <div className="instr-historybox-frame">
                    <div className='chat-historybox-carpet'>
                        

                        {messages_array?.map((chat, index) => (
                            <div key={index} ref={index === messages_array?.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">

                                <input
                                    type="checkbox"
                                    checked={selectedMessage_state === chat}
                                    onChange={(e) => handleCheckboxChange(chat, e.target.checked)}
                                    className="message-select-checkbox"
                                />
                                <Msg_Bubble message_obj={chat} />
                            </div>
                        ))}


                    </div>
                </div>
            </div>
            <Instr_SenderBox />

        </div>
    );
};

export default Panopticon;