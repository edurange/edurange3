import React, { useContext, useEffect, useState, useRef } from 'react';
import '@staff/chat/Chat_Staff.css';
import { StaffRouter_context } from '../Staff_router';
import { HomeRouter_context } from '../../pub/Home_router';
import { useSortedData } from '../../../modules/utils/sorting_modules';
import ListController from '../../../components/ListController';
import Msg_Bubble from '../../student/chat/Msg_Bubble';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';

function Chat_Staff({ is_allSeeing, selectedUser_obj }) {

    const { userData_state, aliasDict_state } = useContext(HomeRouter_context);
    const {
        socket_ref,
        lastChat_ref,
        users_state, set_users_state,
        selectedMessage_state, set_selectedMessage_state,
        taDict_state,
        chatObjs_UL_state
    } = useContext(StaffRouter_context);

    const [messagesToDisplay_state, set_messagesToDisplay_state] = useState([]);
    const [sortDirection_state, set_sortDirection_state] = useState('asc');
    const [primarySortProperty_state, set_primarySortProperty_state] = useState('timestamp');
    const [messageContent_state, set_messageContent_state] = useState('');
    const [socketOpen, set_socketOpen] = useState(false);
    const textareaRef = useRef(null);
    const scrollRef = useRef(null);
    const [atBottom, set_atBottom] = useState(true);

    useEffect(() => {
        const checkSocket = () => {
            set_socketOpen(socket_ref.current && socket_ref.current.readyState === 1);
        };
        checkSocket();
        const interval = setInterval(checkSocket, 1000);
        return () => clearInterval(interval);
    }, [socket_ref]);

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
        const el = event.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    function handleSubmit(event) {
        event.preventDefault();
        sendMessage();
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function sendMessage() {
        if (!selectedMessage_state) return;

        const chatMsg = new ChatMessage(
            selectedMessage_state?.channel_id,
            userData_state?.user_alias,
            selectedMessage_state?.scenario_type,
            messageContent_state.trim(),
            selectedMessage_state?.scenario_id,
            selectedMessage_state?.scenario_name
        );

        if (chatMsg.content) {
            const newChat = {
                message_type: 'chat_message',
                timestamp: Date.now(),
                data: chatMsg
            };
            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
                set_messageContent_state('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }
        }
        const response_target_user_id = selectedMessage_state?.user_id;
        const new_timestamp = Date.now();
        const updated_users_state = users_state.map(user => {
            if (user.id === response_target_user_id) {
                return { ...user, recent_reply: new_timestamp };
            }
            return user;
        });
        set_users_state(updated_users_state);
    }

    const is_staff = userData_state?.role === 'admin' || userData_state?.role === 'staff';

    useEffect(() => {
        if (selectedUser_obj?.channel_data?.available_channels) {
            const user_channel_ints = selectedUser_obj?.channel_data?.available_channels.map(chan => chan.id) ?? [0];
            const chats_filteredByAvailChannels = (chatObjs_UL_state ?? []).filter(chatObj => user_channel_ints.includes(chatObj.channel_id));
            set_messagesToDisplay_state(chats_filteredByAvailChannels);
        } else {
            if (is_allSeeing) {
                set_messagesToDisplay_state(chatObjs_UL_state ?? []);
                return;
            }
            const taFiltered = [];
            if (!users_state || users_state.length < 1) return;
            (chatObjs_UL_state ?? []).forEach(chatObj => {
                const thisSender_id = chatObj.user_id;
                if (taDict_state?.[thisSender_id]?.includes(userData_state?.id) || Number(chatObj.user_id) === Number(userData_state.id)) {
                    taFiltered.push(chatObj);
                }
            });
            set_messagesToDisplay_state(taFiltered);
        }
    }, [selectedUser_obj, chatObjs_UL_state, taDict_state, users_state, userData_state, is_allSeeing]);

    useEffect(() => {
        if (atBottom && lastChat_ref?.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesToDisplay_state, atBottom, lastChat_ref]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        set_atBottom(distFromBottom < 50);
    };

    const jumpToBottom = () => {
        if (lastChat_ref?.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!chatObjs_UL_state) {
        return <div className='chat-empty'>MISSING CHAT LIBRARY.</div>;
    }

    const sortedArr = useSortedData(messagesToDisplay_state, primarySortProperty_state, sortDirection_state);
    if (!Array.isArray(sortedArr)) return null;

    const replyTargetName = selectedMessage_state
        ? (aliasDict_state?.[selectedMessage_state?.user_id] ?? `User ${selectedMessage_state?.user_id}`)
        : null;

    // For outgoing messages, determine which student they were replying to by
    // matching their channel_id to an incoming message's channel_id (whose
    // user_id is the student). This lets us color the outgoing border with the
    // target student's hue.
    const channelToUserId = {};
    (messagesToDisplay_state ?? []).forEach(msg => {
        if (msg.user_id !== userData_state?.id && msg.channel_id != null) {
            channelToUserId[msg.channel_id] = msg.user_id;
        }
    });

    const inputDisabled = !socketOpen || !selectedMessage_state;
    const inputPlaceholder = !selectedMessage_state
        ? 'Select a message to reply…'
        : !socketOpen
            ? 'Disconnected…'
            : 'Type your reply… (Enter to send, Shift+Enter for newline)';

    return (
        <div className="chatStaff-frame">
            <div className="chat-listController-bar">
                <ListController
                    sortDirection_state={sortDirection_state}
                    set_sortDirection_state={set_sortDirection_state}
                    primarySortProperty_state={primarySortProperty_state}
                    set_primarySortProperty_state={set_primarySortProperty_state}
                />
            </div>

            <div className="chatStaff-messageBox-frame" ref={scrollRef} onScroll={handleScroll}>
                <div className='chatStaff-messageBox-carpet'>
                    {sortedArr.length === 0 ? (
                        <div className='chat-empty'>No messages match the current filters.</div>
                    ) : (
                        sortedArr.map((chat, index) => (
                            <div
                                key={index}
                                ref={index === sortedArr.length - 1 ? lastChat_ref : null}
                            >
                                <Msg_Bubble
                                    is_staff={is_staff}
                                    user_id={userData_state?.id}
                                    message_obj={chat}
                                    is_outgoing={chat?.user_id === userData_state?.id}
                                    user_role={userData_state?.role}
                                    replyTargetUserId={chat?.user_id === userData_state?.id ? channelToUserId[chat?.channel_id] : null}
                                />
                            </div>
                        ))
                    )}
                </div>
                {!atBottom && sortedArr.length > 0 && (
                    <button className='chat-jump-btn' onClick={jumpToBottom}>↓ Latest</button>
                )}
            </div>

            <div className='chatStaff-input-frame'>
                {replyTargetName && (
                    <div className='chat-reply-indicator'>
                        <span className='chat-reply-dot' style={{ background: selectedMessage_state?.user_id ? `hsl(${(Number(selectedMessage_state.user_id) * 47) % 360}, 65%, 55%)` : 'var(--green-normal)' }} />
                        Replying to: <strong style={{ color: selectedMessage_state?.user_id ? `hsl(${(Number(selectedMessage_state.user_id) * 47) % 360}, 65%, 55%)` : 'var(--green-normal)' }}>{replyTargetName}</strong>
                        <button
                            className='chat-reply-clear'
                            onClick={() => set_selectedMessage_state(null)}
                            title='Clear selection'
                        >&times;</button>
                    </div>
                )}
                <form className='chatStaff-input-form' onSubmit={handleSubmit}>
                    <textarea
                        ref={textareaRef}
                        className='chatStaff-sender-text'
                        value={messageContent_state}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={inputPlaceholder}
                        disabled={inputDisabled}
                        rows={2}
                    />
                    <button
                        className='chatStaff-sender-button'
                        type="submit"
                        disabled={inputDisabled || !messageContent_state.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat_Staff;