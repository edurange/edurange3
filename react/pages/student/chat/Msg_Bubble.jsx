import React, { useState, useContext } from "react";
import { StaffRouter_context } from "../../staff/Staff_router";
import { HomeRouter_context } from "../../pub/Home_router";
import { HintConfig_Context } from "../../staff/hints/Hints_Controller";
import Hint_Textbox from "../../staff/hints/sub/Hint_Textbox";
import Hint_LogsContainer from "../../staff/hints/sub/Hint_LogsContainer";
import Hint_Settings from "../../staff/hints/sub/Hint_Settings";
import './Msg_Bubble.css';
import { normalizeTimestamp } from '@modules/utils/timestamp_utils.jsx';

function fmtTime(ts) {
    if (!ts) return '';
    const ms = normalizeTimestamp(ts);
    const d = new Date(ms);
    if (isNaN(d)) return String(ts).slice(0, 19);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return sameDay ? time : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

function Msg_Bubble({ is_staff, message_obj, user_id, is_outgoing, user_role, replyTargetUserId }) {

    const [hintTabEnabled_state, set_hintTabEnabled_state] = useState(false);
    const [isExpandedLogs, setIsExpandedLogs] = useState(false);
    const [isExpandedSettings, setIsExpandedSettings] = useState(false);
    const [isHintGenerating, setIsHintGenerating] = useState(false);

    const {
        selectedMessage_state,
        set_selectedMessage_state,
        users_state, scenarios_state
    } = is_staff
            ? useContext(StaffRouter_context)
            : {
                selectedMessage_state: undefined,
                set_selectedMessage_state: () => { },
                users_state: undefined,
                scenarios_state: undefined,
            };

    const {
        set_selectedHintUser_state,
        set_selectedScenario_state
    } = is_staff
            ? useContext(HintConfig_Context)
            : {
                set_selectedHintUser_state: () => { },
                set_selectedScenario_state: () => { },
            };

    const { aliasDict_state, userData_state } = useContext(HomeRouter_context);

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
                const hintUser = users_state?.find(u => Number(u.id) === Number(msg.user_id));
                if (hintUser) set_selectedHintUser_state(hintUser);
                set_selectedMessage_state?.(msg);
                const selectedScenario = scenarios_state?.find(s => Number(s.id) === Number(msg.scenario_id));
                if (selectedScenario) set_selectedScenario_state?.(selectedScenario);
            } else {
                setIsExpandedLogs(false);
                setIsExpandedSettings(false);
                setIsHintGenerating(false);
            }
            return next;
        });
    }

    function toggleExpandLogs(e) { e.stopPropagation(); setIsExpandedLogs(v => !v); }
    function toggleExpandSettings(e) { e.stopPropagation(); setIsExpandedSettings(v => !v); }

    if (!message_obj || !user_id || typeof is_outgoing !== 'boolean') return null;

    const senderName = is_outgoing
        ? "Me"
        : message_obj.user_id === 1
            ? "eduRange Staff"
            : (aliasDict_state?.[message_obj?.user_id] ?? `user_${message_obj?.user_id}`);

    const isSelected = is_staff && !is_outgoing && message_obj === selectedMessage_state;
    const canHint = message_obj?.user_id !== userData_state?.id &&
        (user_role === "instructor" || user_role === "staff" || is_staff);

    // Per-student color differentiation: deterministic hue from user_id, applied
    // to both the left-border and the sender alias text color so multiple
    // students in the same feed are visually distinguishable at a glance.
    const studentHue = !is_outgoing && message_obj.user_id !== 1
        ? `hsl(${(Number(message_obj.user_id) * 47) % 360}, 65%, 55%)`
        : null;

    // Outgoing replies: color the right border with the target student's hue
    // so staff can see at a glance whom they were replying to.
    const replyHue = is_outgoing && replyTargetUserId && replyTargetUserId !== 1
        ? `hsl(${(Number(replyTargetUserId) * 47) % 360}, 65%, 55%)`
        : null;

    const rowStyle = {};
    if (studentHue) rowStyle.borderLeftColor = studentHue;
    if (replyHue) rowStyle.borderRightColor = replyHue;
    const senderStyle = studentHue ? { color: studentHue } : {};

    return (
        <div
            className={`msg-row${is_outgoing ? ' msg-row-outgoing' : ''}${isSelected ? ' msg-row-selected' : ''}${is_staff && !is_outgoing ? ' msg-row-clickable' : ''}`}
            style={rowStyle}
            onClick={is_staff && !is_outgoing ? (e) => handleSelectionClick(e, message_obj) : undefined}
        >
            <div className='msg-row-header'>
                <span className='msg-row-sender' style={senderStyle}>{senderName}</span>
                {!is_outgoing && message_obj.user_id !== 1 && (
                    <span className='msg-row-sender-id'>#{message_obj.user_id}</span>
                )}
                <span className='msg-row-time'>{fmtTime(message_obj?.timestamp)}</span>
                {canHint && (
                    <button
                        type="button"
                        onClick={(e) => handleHintTabClick(e, message_obj)}
                        className={`msg-hint-btn${hintTabEnabled_state ? ' is-active' : ''}${isHintGenerating ? ' is-generating' : ''}`}
                        aria-pressed={hintTabEnabled_state}
                        aria-label={hintTabEnabled_state ? 'Close hint panel' : 'Open hint panel'}
                        title={isHintGenerating ? 'Generating hint…' : 'Generate EDUHint'}
                    >
                        {isHintGenerating ? '⏳' : '💡'}
                    </button>
                )}
            </div>

            {canHint && (
                <div className='msg-reply-row'>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); set_selectedMessage_state?.(message_obj); }}
                        className={`msg-reply-btn${isSelected ? ' is-selected' : ''}`}
                        title='Reply to this student'
                    >
                        <span className='msg-reply-pulse' />
                        <span className='msg-reply-arrow'>↩ Reply</span>
                    </button>
                </div>
            )}

            <div className='msg-row-content'>{message_obj?.content}</div>

            <div className='msg-row-meta'>
                {message_obj?.scenario_name && message_obj.scenario_name !== 'undefined' && (
                    <span className='msg-row-scenario'>{message_obj.scenario_name}</span>
                )}
                {message_obj?.channel_id && (
                    <span className='msg-row-channel'>chnl: {message_obj.channel_id}</span>
                )}
            </div>

            {is_staff && hintTabEnabled_state && (
                <div className='msg-hint-panel'>
                    <Hint_Textbox
                        set_hintTabEnabled_state={set_hintTabEnabled_state}
                        isHintGenerating={isHintGenerating}
                        setIsHintGenerating={setIsHintGenerating}
                    />
                    <div className='hint-submenu-row'>
                        <button
                            onClick={toggleExpandLogs}
                            className={`hint-submenu-btn${isExpandedLogs ? ' clicked' : ''}`}
                            type="button"
                        >Logs 📟</button>
                        <button
                            onClick={toggleExpandSettings}
                            className={`hint-submenu-btn${isExpandedSettings ? ' clicked' : ''}`}
                            type="button"
                        >Settings ⚙️</button>
                    </div>
                    {isExpandedLogs && (
                        <div className='hint-submenu-panel'><Hint_LogsContainer /></div>
                    )}
                    {isExpandedSettings && (
                        <div className='hint-submenu-panel'><Hint_Settings /></div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Msg_Bubble;