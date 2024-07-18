import React, { useState, useContext, useEffect } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '../../pub/Home_router';
import axios from 'axios';
import { AppContext } from '../../../config/AxiosConfig';
import { StudentRouter_context } from '../../student/Student_router';

function Student_Hints() {

    const {
        userData_state, set_userData_state,
        login_state, set_login_state,
        loginExpiry,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        navArraysObj_state,
        chatSocket_state, set_chatSocket_state,
        chatData_state, set_chatData_state
    } = useContext(HomeRouter_context);

    const { 
      scenarioList_state, set_scenarioList_state,
      scenarioPage_state, set_scenarioPage_state,
      guideBook_state, set_guideBook_state,
      notifsArray_state, set_notifsArray_state,
      socket_ref,
      responseData_state, set_responseData_state
    } = useContext(StudentRouter_context);

    const {
      errorModal_state, set_errorModal_state,
      desiredNavMetas_state, set_desiredNavMetas_state,
      clipboard_state, set_clipboard_state
  } = useContext(AppContext);


    const [hint_state, set_hint_state] = useState(null);

    console.log('scenario detail: ', scenarioPage_state)

    const requestHint = async () => {
      try {
        const response = await axios.post("get_hint", {
          scenario_type: scenarioPage_state?.scen_type,  // DEV_FIX
        });
        console.log('hint response: ', response);
        set_hint_state(response.data);
      } catch (error) {
        console.error("Error fetching hint:", error);
      }
    };
    if (!scenarioPage_state) return  <></>
    useEffect(() => {
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