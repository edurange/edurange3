
import React, { useState, useContext } from "react";
import { StaffRouter_context } from "../../staff/Staff_router";
import { HomeRouter_context } from "../../pub/Home_router";
import { HintConfig_Context } from "../../staff/hints/Hints_Controller";
import Hint_Textbox from "../../staff/hints/sub/Hint_Textbox";
import './Msg_Bubble.css';

function Msg_Bubble({ is_staff, message_obj, user_id, is_outgoing, user_role }) {

    const [hintTabEnabled_state, set_hintTabEnabled_state] = useState(false)
    const {
        selectedMessage_state,
        set_selectedMessage_state,
        users_state, scenarios_state
    } = is_staff
            ? useContext(StaffRouter_context)
            : {
                selectedHintUser_state: undefined,
                set_selectedMessage_state: () => { },
                users_state: undefined
            };

    const {
        selectedHintUser_state,
        set_selectedHintUser_state,
        set_selectedScenario_state
    } = is_staff
            ? useContext(HintConfig_Context)
            : {
                selectedHintUser_state: undefined,
                set_selectedHintUser_state: () => { }
            };

    const { aliasDict_state } = useContext(HomeRouter_context);

    const {
        userData_state
    } = useContext(HomeRouter_context);

    function handleSelectionClick(event, message) {
        event.stopPropagation();
        if (set_selectedMessage_state) {
            set_selectedMessage_state(message);
        }
    }

    function handleHintTabClick(event, message_obj) {
        event.stopPropagation();

        const hintUser = users_state.find(user => Number(user.id) === Number(message_obj.user_id))
        set_selectedHintUser_state(hintUser)

        set_selectedMessage_state(message_obj);

        const selectedScenario = scenarios_state.find(option => Number(option.id) === message_obj.scenario_id);
        set_selectedScenario_state(selectedScenario);

        set_hintTabEnabled_state(!hintTabEnabled_state)
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

                            <>
                                {message_obj?.content}

                                <div className="hint-btn-set">

                                    {message_obj?.user_id !== userData_state?.id && (user_role === 'instructor' || user_role === 'staff' || is_staff) ?
                                        <div
                                            onClick={(event) => handleHintTabClick(event, message_obj)}
                                            className='hintbtn-frame' >

                                            HINT

                                        </div>
                                        : <></>}
                                </div>

                            </>
                        </div>

                        {is_staff && hintTabEnabled_state && <Hint_Textbox set_hintTabEnabled_state={set_hintTabEnabled_state} />}

                    </div>
                </div>
            </div>
            <div className={is_outgoing ? "bubble-stem bubble-stem-right" : <></>}></div>
        </div>
    );
}

export default Msg_Bubble;
