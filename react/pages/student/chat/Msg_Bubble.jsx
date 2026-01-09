
import React, { useState, useContext } from "react";
import { StaffRouter_context } from "../../staff/Staff_router";
import { HomeRouter_context } from "../../pub/Home_router";
import { HintConfig_Context } from "../../staff/hints/Hints_Controller";
import Hint_Textbox from "../../staff/hints/sub/Hint_Textbox";
import Hint_Concepts from "../../staff/hints/sub/Hint_Concepts";
import Hint_LogsContainer from "../../staff/hints/sub/Hint_LogsContainer";
import Hint_Settings from "../../staff/hints/sub/Hint_Settings";
import './Msg_Bubble.css';

function Msg_Bubble({ is_staff, message_obj, user_id, is_outgoing, user_role }) {

    const [hintTabEnabled_state, set_hintTabEnabled_state] = useState(false)

    const [isExpandedLogs, setIsExpandedLogs] = useState(false);
    const [isClickedLogs, setIsClickedLogs] = useState(false);

    const [isExpandedSettings, setIsExpandedSettings] = useState(false);
    const [isClickedSettings, setIsClickedSettings] = useState(false);

    const [isExpandedConcepts, setIsExpandedConcepts] = useState(false);
    const [isClickedConcepts, setIsClickedConcepts] = useState(false);

    const [isHintGenerating, setIsHintGenerating] = useState(false);

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

    
    function handleHintTabClick(e, msg) {
        e.stopPropagation();
        e.preventDefault();

        set_hintTabEnabled_state((prev) => {
            const next = !prev;

            if (next) {
            const hintUser = users_state?.find(
                (u) => Number(u.id) === Number(msg.user_id)
            );
            if (hintUser) set_selectedHintUser_state(hintUser);

            set_selectedMessage_state?.(msg);

            const selectedScenario = scenarios_state?.find(
                (s) => Number(s.id) === Number(msg.scenario_id)
            );
            if (selectedScenario) set_selectedScenario_state?.(selectedScenario);
            } else {
            
            setIsExpandedConcepts(false);
            setIsExpandedLogs(false);
            setIsExpandedSettings(false);
            setIsHintGenerating(false); 
            }

            return next;
        });
    }

    function toggleExpandConcepts(event) {
        event.stopPropagation();
        setIsExpandedConcepts(v => !v);
    }


    function toggleExpandLogs(event) {
        event.stopPropagation();
        setIsExpandedLogs(v => !v);
        }

    function toggleExpandSettings(event) {
        event.stopPropagation();
        setIsExpandedSettings(v => !v);
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

                            {message_obj?.user_id !== userData_state?.id &&
                            (user_role === "instructor" || user_role === "staff" || is_staff) ? (
                                <div className={`hint-btn-set ${hintTabEnabled_state ? "is-active" : ""}`}>
                                <button
                                    type="button"
                                    onClick={(event) => handleHintTabClick(event, message_obj)}
                                    className={`hintbtn-frame ${hintTabEnabled_state ? "is-active" : ""} ${isHintGenerating ? "is-generating" : ""}`}
                                    aria-pressed={hintTabEnabled_state}
                                    aria-label={hintTabEnabled_state ? "Close hint tab" : "Open hint tab"}
                                    >
                                    <span className="hintbtn-label">{isHintGenerating ? "⏳" : "💡"}</span>
                                </button>
                                </div>
                            ) : null}
                        </div>


                        {is_staff && hintTabEnabled_state && (
                        <>
                            <Hint_Textbox
                                set_hintTabEnabled_state={set_hintTabEnabled_state}
                                isHintGenerating={isHintGenerating}
                                setIsHintGenerating={setIsHintGenerating}
                            />

                            {/* <div className="expandable-concepts-container">
                                <button
                                    onClick={toggleExpandConcepts}
                                    className={`settings-expand-button ${isExpandedConcepts ? "clicked" : ""}`}
                                    aria-expanded={isExpandedSettings}
                                    type="button"
                                >
                                    Concepts 📚
                                </button>

                                {isExpandedConcepts && (
                                    <div className="submenu-panel settings-submenu">
                                    <Hint_Concepts/>
                                    </div>
                                )}
                            </div> */}

                            <div className="expandable-logs-container">
                                <button
                                    onClick={toggleExpandLogs}
                                    className={`student-logs-expand-button ${isExpandedLogs ? "clicked" : ""}`}
                                    aria-expanded={isExpandedLogs}
                                    type="button"
                                >
                                    Logs 📟
                                </button>

                                {isExpandedLogs && (
                                    <div className="submenu-panel logs-submenu">
                                    <Hint_LogsContainer />
                                    </div>
                                )}
                            </div>

                            <div className="expandable-settings-container">
                                <button
                                    onClick={toggleExpandSettings}
                                    className={`settings-expand-button ${isExpandedSettings ? "clicked" : ""}`}
                                    aria-expanded={isExpandedSettings}
                                    type="button"
                                >
                                    Settings ⚙️
                                </button>

                                {isExpandedSettings && (
                                    <div className="submenu-panel settings-submenu">
                                    <Hint_Settings />
                                    </div>
                                )}
                            </div>
                        </>
                        )}

                    </div>
                </div>
            </div>
            <div className={is_outgoing ? "bubble-stem bubble-stem-right" : <></>}></div>
        </div>
    );
}

export default Msg_Bubble;
