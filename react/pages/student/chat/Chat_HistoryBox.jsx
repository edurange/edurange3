import React, {useContext, useState, useEffect} from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import './Msg_Bubble.css';
import { HomeRouter_context } from "../../pub/Home_router";
import { useSortedData } from "../../../modules/utils/sorting_modules";

function Chat_HistoryBox({lastChat_ref, chatData_state}) {

    const { userData_state } = useContext(HomeRouter_context);

    if (!chatData_state) {return;}
    const sortedArr = useSortedData(chatData_state,'timestamp', 'asc');
    if (!sortedArr) {return <>CHAT DATA UNAVAILABLE</>}
    return (
        <div className="chat-historybox-frame">
                <div className="thread-selector-frame">
                    <div className="thread-selector-carpet">
                        <div className="thread-selector-row">
                            <div className="thread-selector-item">
                                Thread UID:
                            </div>    
                            <div className="thread-selector-item">
                                yabbadabba
                            </div>    
                        </div>

                    </div>
                </div>
            <div className='chat-historybox-carpet'>
                

                {sortedArr.map((chat, index) => (

                    <div key={index} ref={index === chatData_state.length - 1 ? lastChat_ref : null}>
                        <Msg_Bubble 
                            user_id={userData_state?.id} 
                            message_obj={chat} 
                            is_outgoing={chat?.user_id === userData_state?.id}
                            user_role={userData_state.role}
                        />

                    </div>
                ))}
            </div>
        </div>
    );

}; export default Chat_HistoryBox;