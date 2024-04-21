import React, {useContext} from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { HomeRouter_context } from "../../pub/Home_router";

function Chat_HistoryBox({chatSessionID, chatHistory_state, lastChat_ref}) {

    const { userData_state } = useContext(HomeRouter_context);

    return (
        <div className="chat-historybox-frame">
            <div className='chat-historybox-carpet'>
                
                {chatHistory_state.map((chat, index) => (

                    // add div with checkbox to select channel property of 'chat' object -> use set_selectedChannels_state() to add to array

                    <div key={index} ref={index === chatHistory_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        
                        {/* Msg_Bubble is the individual chat message component */}
                        <Msg_Bubble message_obj={chat} chatSessionID={chatSessionID}/>
                    </div>
                ))}
            </div>
        </div>
    );

}; export default Chat_HistoryBox;