
import React from "react";
import './Msg_Bubble.css';

function Msg_Bubble({ message_obj }) {

    console.log('msg_bubble checking obj: ', message_obj)

    return (
        <div className="bubble-frame">
            <div className="bubble-carpet">
                <div className="bubble-items-container">
                    <div className="bubble-item">
                        <div className='er3chat-message-item'>Channel ID: {message_obj?.channel ?? 'missing'}</div>
                    </div>
                    {/* <div className="bubble-item">
                        <div className='er3chat-message-item'>Scenario Type: {message_obj?.scenario_type}</div>
                    </div> */}
                    {/* <div>
                        <div className='er3chat-message-item'>Sender ID: {message_obj?.sender}</div>
                    </div> */}
                    <div>
                        <div className='er3chat-message-item'>Sender Alias: {message_obj?.user_alias ?? 'n/a'}</div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>
                            Timestamp: {
                                new Date(message_obj?.timestamp).toLocaleDateString()
                            } {` at `} {
                                new Date(message_obj?.timestamp).toLocaleTimeString()
                            }
                        </div>
                    </div>
                    <div>
                        <div className='er3chat-message-item'>Message: <span className="highlighter-aqua background-darken"> {message_obj?.content}</span></div>
                    </div>

                </div>
            </div>

        </div>
    )
} export default Msg_Bubble