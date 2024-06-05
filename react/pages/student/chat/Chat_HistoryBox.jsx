import React, { useContext, useState, useEffect } from "react";
import './Chat_HistoryBox.css';
import Msg_Bubble from './Msg_Bubble';
import './Msg_Bubble.css';
import { HomeRouter_context } from "../../pub/Home_router";
import { useSortedData } from "../../../modules/utils/sorting_modules";
import { StudentRouter_context } from "../Student_router";

function Chat_HistoryBox({ 
    lastChat_ref, chatData_state,

}) {
    const { userData_state } = useContext(HomeRouter_context);
    const { 
        socket_ref, 
        currentThreadUID_state, 
        set_currentThreadUID_state,
        selectedChannel_state, set_selectedChannel_state,
        selectedThread_state, set_selectedThread_state
    } = useContext (StudentRouter_context);

    if (!userData_state?.channel_data) {return null}
    console.log('lookie at avail chans')
    console.log(userData_state?.channel_data?.available_channels)
    // const sample_avail_chans = userData_state?.channel_data?.available_channels;
    const sample_avail_chans = userData_state?.channel_data?.available_channels;
    const sample_avail_threads = ['thread123456', 'thread654321'];

    useEffect(() => {
        // Set initial state only if no selection has been made
        if (!selectedChannel_state && userData_state?.channel_data?.available_channels?.length > 0) {
            set_selectedChannel_state(userData_state?.channel_data?.available_channels?.[0]);

        }
        if (!selectedThread_state && sample_avail_threads.length > 0) {
            set_selectedThread_state(sample_avail_threads[0]);
        }
    }, [sample_avail_chans, sample_avail_threads, selectedChannel_state, selectedThread_state]);

    if (!chatData_state) return <div>CHAT DATA UNAVAILABLE</div>;
    const sortedArr = useSortedData(chatData_state, 'timestamp', 'asc');
    if (!sortedArr) return <div>CHAT DATA UNAVAILABLE</div>;

    console.log('origin info: ',selectedChannel_state, selectedThread_state)

    return (
        <div className="chat-historybox-frame">
            <div className="thread-selector-frame">
                <div className="thread-selector-carpet">
                    <div className="thread-selector-row">
                        <div className="thread-selector-item">
                            Channel Name:
                        </div>
                        <select
                            className="channel-select-dropdown"
                            value={selectedChannel_state}
                            onChange={e => set_selectedChannel_state(e.target.value)}>
                            {sample_avail_chans.map((chan, index) => (
                                <option key={index} value={chan.name}>{chan.name}</option>
                            ))}
                        </select>

                        <div className="thread-selector-item">
                            Thread UID:
                        </div>
                        <select
                            className="thread-select-dropdown"
                            value={selectedThread_state}
                            onChange={e => set_selectedThread_state(e.target.value)}>
                            {sample_avail_threads.map(thread => (
                                <option key={thread} value={thread}>{thread}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className='chat-historybox-carpet'>
                {sortedArr.map((chat, index) => (
                    <div key={index} ref={index === chatData_state.length - 1 ? lastChat_ref : null}>
                        <Msg_Bubble
                            user_id={userData_state?.id}
                            message_obj={chat}
                            is_outgoing={chat?.user_id === userData_state?.id}
                            user_role={userData_state.role}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat_HistoryBox;


// function Chat_HistoryBox({lastChat_ref, chatData_state}) {

//     const { userData_state } = useContext(HomeRouter_context);

//     const sample_avail_chans = [5, 55]
//     const sample_avail_threads = [abcdefghijkl, lkjihgfedcba]

//     if (!chatData_state) {return;}
//     const sortedArr = useSortedData(chatData_state,'timestamp', 'asc');
//     if (!sortedArr) {return <>CHAT DATA UNAVAILABLE</>}
//     return (
//         <div className="chat-historybox-frame">
//                 <div className="thread-selector-frame">
//                     <div className="thread-selector-carpet">
//                         <div className="thread-selector-row">
//                             <div className="thread-selector-item">
//                                 Thread UID:
//                             </div>    
//                             <div className="thread-selector-item">
//                                 yabbadabba
//                             </div>   
                             
//                             <div className="channel-select-dropdown">
//                                 yabbadabba
//                             </div>   
//                             <div className="thread-select-dropdown">
//                                 yabbadabba
//                             </div>   

//                         </div>

//                     </div>
//                 </div>
//             <div className='chat-historybox-carpet'>
                

//                 {sortedArr.map((chat, index) => (

//                     <div key={index} ref={index === chatData_state.length - 1 ? lastChat_ref : null}>
//                         <Msg_Bubble 
//                             user_id={userData_state?.id} 
//                             message_obj={chat} 
//                             is_outgoing={chat?.user_id === userData_state?.id}
//                             user_role={userData_state.role}
//                         />

//                     </div>
//                 ))}
//             </div>
//         </div>
//     );

// }; export default Chat_HistoryBox;