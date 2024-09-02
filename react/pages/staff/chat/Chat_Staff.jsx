import React, { useContext, useEffect, useState } from 'react';
import '@staff/chat/Chat_Staff.css';
import { InstructorRouter_context } from '../Staff_router';
import { HomeRouter_context } from '../../pub/Home_router';
import { useSortedData } from '../../../modules/utils/sorting_modules';
import ListController from '../../../components/ListController';
import Msg_Bubble from '../../student/chat/Msg_Bubble';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';


function Chat_Staff({is_allSeeing, selectedUser_obj}) {

    const { userData_state } = useContext(HomeRouter_context);
    const {
        socket_ref, 
        lastChat_ref, 
        users_state, set_users_state,
        selectedMessage_state, set_selectedMessage_state,
        taDict_state,
        chatObjs_UL_state
    } = useContext(InstructorRouter_context);

    const [messagesToDisplay_state, set_messagesToDisplay_state] = useState([]);
    const [sortDirection_state, set_sortDirection_state] = useState('asc');
    const [primarySortProperty_state, set_primarySortProperty_state] = useState('timestamp');
    const [messageContent_state, set_messageContent_state] = useState('');

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
    };

    function handleSubmit (event) {
        event.preventDefault();
        sendMessage();
    };

    function handleKeyPress (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    function sendMessage () {
        if (!selectedMessage_state) {
            return
        }

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
    };

    const is_staff = userData_state?.role === "admin" || userData_state?.role === "staff";

    useEffect(() => {

        if (selectedUser_obj?.channel_data?.available_channels) {
            const user_channel_ints = selectedUser_obj?.channel_data?.available_channels.map(chan => chan.id) ?? [0];
            const chats_filteredByAvailChannels = chatObjs_UL_state.filter((chatObj) => user_channel_ints.includes(chatObj.channel_id))
            set_messagesToDisplay_state(chats_filteredByAvailChannels);
        } else {

            if (is_allSeeing) {
                set_messagesToDisplay_state(chatObjs_UL_state);
                return;
            }
            const taFiltered = []

            if (!users_state) return
            if (users_state.length < 1) return

            chatObjs_UL_state.forEach((chatObj) => {
                const thisSender_id = chatObj.user_id;
                if (taDict_state[thisSender_id]?.includes(userData_state?.id) || Number(chatObj.user_id) === Number(userData_state.id)) {
                    taFiltered.push(chatObj);
                }
            });
            set_messagesToDisplay_state(taFiltered);
        }
    }, [selectedUser_obj, chatObjs_UL_state, taDict_state, users_state, userData_state, is_allSeeing]);

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesToDisplay_state]);

    if (!chatObjs_UL_state) {
        return <>MISSING CHAT LIBRARY.</>;
    }

    const sortedArr = useSortedData(messagesToDisplay_state, primarySortProperty_state, sortDirection_state);

    if (!Array.isArray(sortedArr)) {
        return <></>;
    }
    const handle_messageSelection = (message, isChecked) => {
        if (isChecked) {
            set_selectedMessage_state(message);
        } else {
            if (selectedMessage_state === message) {
                set_selectedMessage_state(null);
            }
        }
    };

    if (!sortedArr) return <>sortedArr missing</>;

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


            <div className="chatStaff-messageBox-frame">
                <div className='chatStaff-messageBox-carpet'>
                    {sortedArr.map((chat, index) => (
                        <div key={index} ref={index === messagesToDisplay_state.length - 1 ? lastChat_ref : null}>
                            <Msg_Bubble
                                is_staff={is_staff}
                                user_id={userData_state?.id}
                                message_obj={chat}
                                is_outgoing={chat?.user_id === userData_state?.id}
                            />
                        </div>
                    ))}
                </div>
            </div>
            

            <form className='chatStaff-input-frame' onSubmit={handleSubmit}>
                <div className='chatStaff-input-item sender-frame'>
                    <textarea className='chatStaff-sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                    <button className='chatStaff-sender-button' type="submit">Send</button>
                </div>
            </form>


        </div>
    );
}

export default Chat_Staff;