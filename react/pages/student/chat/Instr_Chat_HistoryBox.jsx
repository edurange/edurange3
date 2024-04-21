
import React, { useContext } from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { InstructorRouter_context } from "../../instructor/Instructor_router";

// this is for instructors to look at the history of an individual student; 
// includes all channels a student has available

function Instr_Chat_HistoryBox({user_obj, lastChat_ref}) {
    const { selectedMessage_state, set_selectedMessage_state, chatHistory_state } = useContext(InstructorRouter_context);

    const handleCheckboxChange = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    const user_available_channels = user_obj?.channel_data?.available_channels?.map((avChan => avChan.id))


    console.log('instr_chat_historybox chatHistory_State: ', chatHistory_state)
    return (
        <div className="chat-historybox-frame">
            <div className='chat-historybox-carpet'>
                {chatHistory_state.filter(chat => user_available_channels.includes(chat.data?.channel)).map((chat, index) => (
                    <div key={index} ref={index === chatHistory_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">

                        <input
                            type="checkbox"
                            checked={selectedMessage_state === chat}
                            onChange={(e) => handleCheckboxChange(chat, e.target.checked)}
                            className="message-select-checkbox"
                        />
                        <Msg_Bubble message_obj={chat} chatSessionID={12345}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Instr_Chat_HistoryBox;


// import React from "react";
// import './Chat_HistoryBox.css';
// import Msg_Bubble from './Msg_Bubble';
// import { InstructorRouter_context } from "../../instructor/Instructor_router";

// function Instr_Chat_HistoryBox({chatSessionID, chatHistory_state, lastChat_ref}) {

//     const { selectedChannels_state, set_selectedChannels_state } = useContext(InstructorRouter_context);

//     console.log('chatHistory_state: ', chatHistory_state)
//     console.log('chatHistory_state with filter test: ', chatHistory_state.filter((hist) => hist?.data?.channel === 277))

//     return (
//         <div className="chat-historybox-frame">
//             <div className='chat-historybox-carpet'>
                
//                 {chatHistory_state.map((chat, index) => (

//                     // add div with checkbox to select channel property of 'chat' object -> use set_selectedChannels_state() to add to array

//                     <div key={index} ref={index === chatHistory_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        
//                         {/* Msg_Bubble is the individual chat message component */}
//                         <Msg_Bubble message_obj={chat} chatSessionID={chatSessionID}/>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );

// }; export default Instr_Chat_HistoryBox;