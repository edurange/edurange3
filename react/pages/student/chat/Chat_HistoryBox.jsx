import React, {useContext} from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import { HomeRouter_context } from "../../pub/Home_router";

function Chat_HistoryBox({lastChat_ref, chatData_state}) {

    const { userData_state } = useContext(HomeRouter_context);

    if (!chatData_state) {return;}
    
    console.log('historybox chatdata_state', chatData_state)

    return (
        <div className="chat-historybox-frame">
            <div className='chat-historybox-carpet'>
                
                {chatData_state.map((chat, index) => (

                    // add div with checkbox to select channel property of 'chat' object -> use set_selectedChannels_state() to add to array

                    <div key={index} ref={index === chatData_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        
                        {/* Msg_Bubble is the individual chat message component */}
                        <Msg_Bubble user_id={userData_state?.id} message_obj={chat?.data}/>
                    </div>
                ))}
            </div>
        </div>
    );

}; export default Chat_HistoryBox;