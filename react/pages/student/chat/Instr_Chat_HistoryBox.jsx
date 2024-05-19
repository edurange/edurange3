

import React, { useContext, useEffect, useState } from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { InstructorRouter_context } from "../../instructor/Instructor_router";
import { HomeRouter_context } from "../../pub/Home_router";

function Instr_Chat_HistoryBox({ lastChat_ref, chatLibrary, selectedUser_obj }) {
    const { selectedMessage_state, set_selectedMessage_state } = useContext(InstructorRouter_context);
    const { userData_state } = useContext(HomeRouter_context);

    const [messagesToDisplay_state, set_messagesToDisplay_state] = useState([]);
    
    useEffect(() => {

        // if selectedUser_obj is supplied in component prop, this component displays
        // chat for only that user (all of their avail channels)
        if (selectedUser_obj?.channel_data?.available_channels) {
            const user_channels = selectedUser_obj.channel_data.available_channels;
            const msglist = user_channels.flatMap(chan => chatLibrary[chan.id] || []);
            set_messagesToDisplay_state(msglist);
        

        // if no user is supplied, chats for all users will be displayed
        } else {
            const allMessages = Object.values(chatLibrary).flat();
            set_messagesToDisplay_state(allMessages);
        }
    }, [selectedUser_obj, chatLibrary]);

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesToDisplay_state]);

    const handleCheckboxChange = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    if (!messagesToDisplay_state.length) return null;

    return (
        <div className="instr-historybox-frame">
            <div className='chat-historybox-carpet'>
                {messagesToDisplay_state.map((chat, index) => (
                    <div key={index} ref={index === messagesToDisplay_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
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
    );
}

export default Instr_Chat_HistoryBox;