
import React, { useContext } from "react";
import './Msg_Bubble.css';
import { InstructorRouter_context } from "../../staff/Staff_router";
import { StudentRouter_context } from "../Student_router";

function Msg_Bubble({ is_staff, message_obj, user_id, is_outgoing }) {
    const {
        aliasDict_state,
        selectedMessage_state, 
        set_selectedMessage_state 
    } = is_staff ? useContext(InstructorRouter_context) : useContext(StudentRouter_context)
    // { 
    //     selectedMessage_state: null, 
    //     set_selectedMessage_state: null,
    //     aliasDict_state
    // }
    ;

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
                    className={`${!is_outgoing && (message_obj === selectedMessage_state && is_staff) ? "selected-chat-item" : !is_outgoing && is_staff ? "selectable-chat-item" : "unselectable-chat-item"}`}
                    onClick={(event) => handleSelectionClick(event, message_obj)}
                >
                    <div className="bubble-items-container">
                        <div className='bubble-header'>

                            <div className="bubble-header-item">
                                {is_outgoing ? "Me" : message_obj.user_id === 1 ? "eduRange Staff" : aliasDict_state[message_obj?.user_id] ?? 'n/a'}
                            </div>

                            <div className="bubble-header-item">
                            {new Date(message_obj?.timestamp).toLocaleDateString()} {` at `} {new Date(message_obj?.timestamp).toLocaleTimeString()}
                            </div>

                            <div className="bubble-header-item">
                                chnl: {message_obj?.channel_id ?? 'missing'}
                            </div>

                        </div>
                            <div className="bubble-msg-footer">
                                <div>
                                    Scen Type: {message_obj?.scenario_type}
                                </div>
                                <div>
                                    Scen Name: {message_obj?.scenario_name ?? "undef"}
                                </div>
                                <div>
                                    Scen ID: {message_obj?.scenario_id}
                                </div>
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
