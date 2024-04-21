
import axios from 'axios';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import Scenario_controller from './scenarios/Scenario_controller';
import Scenarios_home from './scenarios/Scenarios_home';
import Chat_Student from '@student/chat/Chat_Student';
import Frame_side from '@frame/sidenav/Frame_side';
export const StudentRouter_context = React.createContext();
import '@assets/css/dashboard.css';
import { HomeRouter_context } from '../pub/Home_router';

function Student_router() {

    const fakeNotifs = [{
        id: 123,
        timeStamp: Date.now(),
        message: "something"
    }]
    const { login_state, userData_state } = useContext(HomeRouter_context);
    const [chatHistory_state, set_chatHistory_state] = useState({});
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

    if (!scenarioList_state) { return <></> }
    if (!login_state) { return <></> }

    async function fetchScenarioList() {
        try {
            const response = await axios.get("/get_group_scenarios");
            if (response.data.scenarioTable) {
                set_scenarioList_state(response.data.scenarioTable);
            };
        }
        catch (error) { console.log('get_scenarios_list error:', error); };
    };
    useEffect(() => { fetchScenarioList(); }, []);

    useEffect(() => {
        // only place websocket inits for student connection ; passed via context after
        socket_ref.current = new WebSocket(socketURL);

        const pingInterval = 11000;

        const pingInterval_id = setInterval(() => {
            if (socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify({
                    type: 'keepalive',
                    message: 'ping'
                }));
            }
        }, pingInterval);

        // clean up
        return () => {
            if (socket_ref.current) {
                socket_ref.current.close();
            }
        };
    }, []);

    const updateChatHistory = (userId, message) => {
        console.log('setting chatlog')
        set_chatHistory_state(prevHistory => ({
            ...prevHistory,
            [userId]: [...(prevHistory[userId] || []), message],
        }));
        console.log("new chat log state: ", chatHistory_state)
    };


    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'chat_receipt') {
                updateChatHistory(message?.data?.user_id, message)

            } else if (message.type === 'chatError') {
                console.error('Chat error:', message.data);
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
        console.log('chatHistory_state updated')
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory_state]);

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