
import React from "react";
import './Msg_Bubble.css';

function Msg_Bubble({message_obj, chatSessionID}){

    return (
        <div className="bubble-frame">
            <div className="bubble-carpet">
                <div className="bubble-items-container">
                    <div className="bubble-item">
                        <div className='er3chat-message-item'>Session ID: {chatSessionID}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Sender ID: {message_obj.userID}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Sender Alias: {message_obj.userAlias}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Sender Groups: {Array.isArray(message_obj.userGroups) ? message_obj.userGroups.join(', ') : ''}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Time Stamp: {new Date(Number(message_obj.timeStamp)).toLocaleDateString()} {new Date(Number(message_obj.timeStamp)).toLocaleTimeString()}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Message: {message_obj.content}</div>
                    </div>

                </div>
            </div>

        </div>
    )
} export default Msg_Bubble