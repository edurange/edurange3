
import React, { useContext } from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { InstructorRouter_context } from "../../instructor/Instructor_router";

// this is for instructors to look at the history of an individual student; 
// includes all channels a student has available

function Instr_Chat_HistoryBox({lastChat_ref, messages_array}) {
    
    const { selectedMessage_state, set_selectedMessage_state, chatLibrary_state } = useContext(InstructorRouter_context);

    if (!chatLibrary_state) {return}

    const handleCheckboxChange = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    if (!messages_array){return}
    
    return (
        <div className="instr-historybox-frame">
            <div className='chat-historybox-carpet'>
                {messages_array?.map((chat, index) =>  (
                    <div key={index} ref={index === messages_array?.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">

                        <input
                            type="checkbox"
                            checked={selectedMessage_state === chat}
                            onChange={(e) => handleCheckboxChange(chat, e.target.checked)}
                            className="message-select-checkbox"
                        />
                        <Msg_Bubble message_obj={chat}/>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Instr_Chat_HistoryBox;