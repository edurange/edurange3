
import React, { useContext } from "react";
import './Msg_Bubble.css';
import { InstructorRouter_context } from "../../instructor/Instructor_router";

function Msg_Bubble({ is_instructor, message_obj, user_id, is_outgoing }) {
    const { selectedMessage_state, set_selectedMessage_state } = is_instructor ? useContext(InstructorRouter_context) : { selectedMessage_state: null, set_selectedMessage_state: null };

    function handleSelectionClick(event, message) {
        event.stopPropagation();
        if (set_selectedMessage_state) {
            set_selectedMessage_state(message);
        }
    }

    if (!message_obj || !user_id || typeof is_outgoing !== 'boolean') return null;

    return (
        <div className="msg-row-frame">
            <div className="stembar-container">
                <div className={!is_outgoing ? "bubble-stem" : ""} />
            </div>

            <div className={is_outgoing ? "bubble-frame bframe-outgoing" : "bubble-frame"}>
                <div 
                    className={`${!is_outgoing && (message_obj === selectedMessage_state && is_instructor) ? "selected-chat-item" : !is_outgoing && is_instructor ? "selectable-chat-item" : "unselectable-chat-item"}`}
                    onClick={(event) => handleSelectionClick(event, message_obj)}
                >
                    <div className="bubble-items-container">
                        <div className='bubble-header'>
                            <div className="bubble-header-item">
                                {is_outgoing ? "Me" : message_obj.user_id === 1 ? "Instructor" : message_obj?.user_alias ?? 'n/a'}
                            </div>
                            <div className="bubble-header-item">
                                chnl: {message_obj?.channel ?? 'missing'}
                            </div>
                        </div>

                        <div className='bubble-header bubble-timestamp'>
                            {new Date(message_obj?.timestamp).toLocaleDateString()} {` at `} {new Date(message_obj?.timestamp).toLocaleTimeString()}
                        </div>

                        <div className="bubble-msg-frame">
                            {message_obj?.content}
                        </div>
                    </div>
                </div>
            </div>
            <div className={is_outgoing ? "bubble-stem bubble-stem-right" : <></>}></div>
        </div>
    );
}

export default Msg_Bubble;
