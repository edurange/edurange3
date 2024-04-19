import React, {useContext} from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { HomeRouter_context } from "../../pub/Home_router";
import { InstructorRouter_context } from "../../instructor/Instructor_router";

function Chat_HistoryBox({chatSessionID, chatHistory_state, lastChat_ref}) {

    const { login_state, userData_state, userAlias_state } = useContext(HomeRouter_context);
    // const { users_state, set_users_state, groups_state, set_groups_state, chatHistory_state, set_chatHistory_state } = useContext(InstructorRouter_context);

    console.log('chatHistory_state: ', chatHistory_state)
    console.log('chatHistory_state with filter test: ', chatHistory_state.filter((hist) => hist?.data?.channel === 277))

    return (
        <div className="chat-historybox-frame">
            <div className='chat-historybox-carpet'>
                
                {chatHistory_state.map((chat, index) => (
                    <div key={index} ref={index === chatHistory_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        
                        {/* Msg_Bubble is the individual chat message component */}
                        <Msg_Bubble message_obj={chat} chatSessionID={chatSessionID}/>
                    </div>
                ))}
            </div>
        </div>
    );

}; export default Chat_HistoryBox;