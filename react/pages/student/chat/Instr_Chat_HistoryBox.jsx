import React, { useContext, useEffect, useState } from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';

import { InstructorRouter_context } from "../../instructor/Instructor_router";
import { HomeRouter_context } from "../../pub/Home_router";
import { useSortedData } from "../../../modules/utils/sorting_modules";
import ListController from "../../../components/ListController";
import "../../../components/ListController.css";

function Instr_Chat_HistoryBox({ lastChat_ref, chatObjs_array, selectedUser_obj }) {
    const { selectedMessage_state, set_selectedMessage_state } = useContext(InstructorRouter_context);
    const { userData_state } = useContext(HomeRouter_context);
    
    const [messagesToDisplay_state, set_messagesToDisplay_state] = useState([]);
    const [sortDirection_state, set_sortDirection_state] = useState('asc');
    const [primarySortProperty_state, set_primarySortProperty_state] = useState('timestamp');

    const is_instructor = userData_state?.role === "admin" || userData_state?.role === "instructor";
    
    useEffect(() => {
        if (selectedUser_obj?.channel_data?.available_channels) {
            const user_channel_ints = selectedUser_obj.channel_data.available_channels.map(chan => chan.id) ?? [0];
            const chats_filteredByAvailChannels = chatObjs_array.filter((chatObj) => user_channel_ints.includes(chatObj.channel_id))
            set_messagesToDisplay_state(chats_filteredByAvailChannels);
        } else {
            set_messagesToDisplay_state(chatObjs_array);
        }
    }, [selectedUser_obj, chatObjs_array]);
    
    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesToDisplay_state]);
    
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
        <>
            <div className="chat-listController-bar">

                <ListController 
                    sortDirection_state={sortDirection_state}
                    set_sortDirection_state={set_sortDirection_state}
                    primarySortProperty_state={primarySortProperty_state}
                    set_primarySortProperty_state={set_primarySortProperty_state}
                />
            </div>

            <div className="instr-historybox-frame">
                <div className='chat-historybox-carpet'>
                    {sortedArr.map((chat, index) => (
                        <div key={index} ref={index === messagesToDisplay_state.length - 1 ? lastChat_ref : null}>
                            <Msg_Bubble 
                                is_instructor={is_instructor} 
                                user_id={userData_state?.id} 
                                message_obj={chat} 
                                is_outgoing={chat?.user_id === userData_state?.id} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Instr_Chat_HistoryBox;