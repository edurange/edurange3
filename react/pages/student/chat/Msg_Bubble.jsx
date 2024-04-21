
import React from "react";
import './Msg_Bubble.css';

function Msg_Bubble({ message_obj }) {

    return (
        <div className="bubble-frame">
            <div className="bubble-carpet">
                <div className="bubble-items-container">
                    <div className="bubble-item">
                        <div className='er3chat-message-item'>Channel ID: {message_obj?.data?.channel ?? 'missing'}</div>
                    </div>
                    <div className="bubble-item">
                        <div className='er3chat-message-item'>Scenario ID: {message_obj?.data?.scenario_id}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Sender ID: {message_obj?.data?.user_id}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Sender Alias: {message_obj?.data?.user_alias}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>
                            Time Stamp: {
                                new Date(message_obj?.timestamp).toLocaleDateString()
                            } {` at `} {
                                new Date(message_obj?.timestamp).toLocaleTimeString()
                            }
                        </div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Message: {message_obj?.data?.message}</div>
                    </div>

                </div>
            </div>

        </div>
    )
} export default Msg_Bubble