import React, { useState, useContext, useEffect } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '../../pub/Home_router';
import axios from 'axios';

function Student_Hints() {
    const {
        users_state, set_users_state,
        groups_state, set_groups_state,
        scenarios_state, set_scenarios_state,
        scenarioDetail_state, set_scenarioDetail_state,
        userDetail_state, set_userDetail_state,
        tempUsers_state, set_tempUsers_state,
        chatObjs_UL_state, set_chatObjs_UL_state,
        channelAccess_state, set_channelAccess_state,
        selectedMessage_state, set_selectedMessage_state,
        socket_ref, lastChat_ref, logs_state
    } = useContext(InstructorRouter_context);

    const {
        userData_state, set_userData_state,
        login_state, set_login_state,
        loginExpiry,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        clipboard_state, set_clipboard_state,
        navArraysObj_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        chatSocket_state, set_chatSocket_state,
        chatData_state, set_chatData_state
    } = useContext(HomeRouter_context);

    console.log(logs_state)

    const [hint_state, set_hint_state] = useState(null);

    useEffect(() => {
        const requestHint = async () => {
          try {
            const reqRes = await axios.post("/get_hint", {
              scenario_type: "file_wrangler",  // DEV_FIX
            });
            console.log(reqRes);
            set_hint_state(reqRes.data);
          } catch (error) {
            console.error("Error fetching hint:", error);
          }
        };
    
        requestHint();
      }, []);

    console.log("hint request response: ", hint_state)
    

    return (
        <div>

            Student_Hints PAGE PLACEHOLDER LOADED
            
        </div>
    );
}

export default Student_Hints;