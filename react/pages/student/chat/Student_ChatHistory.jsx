import React, {useContext, useState, useEffect} from "react";
import './Chat_Student.css';
import './Msg_Bubble.css';
import Msg_Bubble from './Msg_Bubble';
import { HomeRouter_context } from "../../pub/Home_router";
import { useSortedData } from "../../../modules/utils/sorting_modules";

function Student_ChatHistory({lastChat_ref, chatData_state}) {

    const { userData_state } = useContext(HomeRouter_context);

    if (!chatData_state) {return;}
    const sortedArr = useSortedData(chatData_state,'timestamp', 'asc');
    if (!sortedArr) {return <>CHAT DATA UNAVAILABLE</>}
    return (
        <div className="student-chathistory-frame">
            <div className='student-chathistory-carpet'>
                
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

}; export default Student_ChatHistory;