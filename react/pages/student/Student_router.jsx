
import axios from 'axios';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import Scenarios_home from './scenarios/Scenarios_home';
import Chat_Student from '@student/chat/Chat_Student';
import Frame_side from '@frame/sidenav/Frame_side';
export const StudentRouter_context = React.createContext();
import '@assets/css/dashboard.css';
import { HomeRouter_context } from '../pub/Home_router';
import Scenario_controller from './scenarios/Scenario_controller';

function Student_router() {

    const fakeNotifs = [{
        id: 123,
        timeStamp: Date.now(),
        message: "something"
    }]
    const { login_state, userData_state, set_chatData_state, chatData_state, } = useContext(HomeRouter_context);
    const [responseData_state, set_responseData_state] = useState({});
    const [chatObjs_UL_state, set_chatObjs_UL_state] = useState([]); // unordered array of all chats
    const [aliasDict_state, set_aliasDict_state] = useState({});

    const [notifsArray_state, set_notifsArray_state] = useState(fakeNotifs);
    const [guideBook_state, set_guideBook_state] = useState({});
    const [scenarioList_state, set_scenarioList_state] = useState([]);
    const [scenarioPage_state, set_scenarioPage_state] = useState({
        chapter: 0,
        sectionAnchor: 0,
    });
    const socket_ref = useRef(null);
    const lastChat_ref = useRef(null);

    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;
  
    const updateChatHistory = (message) => {
        set_chatData_state(prevHistory => [...prevHistory, message]);
    };
    
    useEffect(() => { 
        async function fetchScenarioList() {
            try {
                const response = await axios.get("/get_group_scenarios");
                if (response.data.scenarioTable) {
                    set_scenarioList_state(response.data.scenarioTable);
                };
            }
            catch (error) { console.log('get_scenarios_list error:', error); };
        };
        fetchScenarioList(); 
    }, []);

    // INITIALIZE ONLY SOCKET REF
    useEffect(() => {
        socket_ref.current = new WebSocket(socketURL);
        const pingInterval = 11_000; // unit: ms
        const interval_id = setInterval(() => {
            if (socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify({
                    message_type: 'keepalive',
                    message: 'ping'
                }));
            } 
        }, pingInterval);
        // cleanup
        return () => {
            if (socket_ref.current) {
                socket_ref.current.close();
            }
        };
    }, []);

    useEffect(() => {
        async function get_studentChatHistory(){
            const hist_response = await axios.get('/get_chat_history');
            const chat_history = hist_response?.data?.chat_history
            set_chatData_state(chat_history);
        }
        get_studentChatHistory()
    }, []);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.message_type === 'chat_message_receipt') {
                
                updateChatHistory(message?.data)

            } 
            else if (message.message_type === 'chatError') {
                console.error('Chat error:', message.data);
            } 
            else if (message.message_type === 'handshake') {
                if (message.chat_logs)
                set_chatObjs_UL_state(message.chat_logs);
                set_aliasDict_state(message.aliasDict ?? {});
            }
        };

        if (socket_ref.current) {
            socket_ref.current.addEventListener('message', handleMessage);
        }

        return () => {
            if (socket_ref.current) {
                socket_ref.current.removeEventListener('message', handleMessage);
            }
        };
    }, [socket_ref]);

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData_state]);
    if (!scenarioList_state) { return <></> }
    if (!login_state) { return <></> }

    return (

        <div className='newdash-frame'>
            <div className='newdash-frame-carpet'>

                <Frame_side smallMode={true} hiddenMode={false} />

                <div className="newdash-infopane-frame">
                    <div className='newdash-infopane-content'>

                        <StudentRouter_context.Provider value={{
                            scenarioList_state, set_scenarioList_state,
                            scenarioPage_state, set_scenarioPage_state,
                            guideBook_state, set_guideBook_state,
                            notifsArray_state, set_notifsArray_state,
                            socket_ref,
                            responseData_state, set_responseData_state,
                            chatObjs_UL_state, set_chatObjs_UL_state,
                            aliasDict_state
                        }}>
                            <Routes>
                                <Route path="/" element={<Scenarios_home />} />
                                <Route path="/:scenarioID" element={<Scenario_controller />} />
                                <Route path="/:scenarioID/:pageID" element={<Scenario_controller />} />
                                <Route path="/:scenarioID/chat" element={<Chat_Student />} />
                            </Routes>
                        </StudentRouter_context.Provider>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Student_router;