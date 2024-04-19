import axios from 'axios';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import Instr_Dash from './dashboard/Instr_Dash';
import Chat_Instructor from './chat/Chat_Instructor';
import Instr_Groups from './groups/Instr_Groups';
import Instr_GroupDetail from './groups/Instr_GroupDetail';
import Frame_side from '../../frame/sidenav/Frame_side';
import Instr_Scenarios from './scenarios/Instr_Scenarios';
import Instr_Users from './users/Instr_Users';
import Instr_ScenDetail from './scenarios/Instr_ScenDetail';
import Instr_UserDetail from './users/Instr_UserDetail';
import SocketKeeper from '../pub/SocketKeeper';
import Panopticon from './Panopticon';
import Sockeep2 from '../pub/Sockeep2';
import { HomeRouter_context } from '../pub/Home_router';

export const InstructorRouter_context = React.createContext();

function Instructor_router() {

    const { login_state, userData_state, userAlias_state } = useContext(HomeRouter_context);
    const [chatHistory_state, set_chatHistory_state] = useState([]);

    const [users_state, set_users_state] = useState([])
    const [groups_state, set_groups_state] = useState([])
    const [scenarios_state, set_scenarios_state] = useState([])
    const [scenarioDetail_state, set_scenarioDetail_state] = useState({})
    const [userDetail_state, set_userDetail_state] = useState({})
    const [tempUsers_state, set_tempUsers_state] = useState([]);
    const lastChat_ref = useRef(null);

    const socket_ref = useRef(null);

    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;


    async function get_instructorData() {
        try {
            const response = await axios.get("/get_instructor_data");
            const responseData = response.data;
            console.log('Loading Instructor Data:', responseData);
            set_users_state(responseData?.users);
            set_groups_state(responseData?.groups);
            set_scenarios_state(responseData?.scenarios);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

    if (!scenarios_state) { return <></> }
    if (!login_state) { return <></> }


    // INITIALIZE ONLY SOCKET REF
    useEffect(() => {
        // Initialize WebSocket only once after the component mounts
        socket_ref.current = new WebSocket(socketURL);
        // WebSocket ping functionality
        const pingInterval = 11000; // Adjust the interval as needed (e.g., 30000 for 30 seconds)
        const intervalId = setInterval(() => {
            if (socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify({
                    type: 'keepalive',
                    message: 'ping'
                }));
            }
        }, pingInterval);
        // Function to clean up the WebSocket when the component unmounts
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
            console.log('instructor_router received message: ', message)

            if (message.type === 'student_message_receipt' || message.type === 'instructor_message_receipt') {

                set_chatHistory_state((prevChatLog) => [...prevChatLog, message]);

                // updateChatHistory(message?.data?.user_id, message)

                // need to track the metadata for every user's chatlog in piece of state
                // add to the record here

                // set_chatHistory_state((prevChatLog) => [...prevChatLog, message]);

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


                <Frame_side />


                <InstructorRouter_context.Provider value={{

                    users_state, set_users_state,
                    groups_state, set_groups_state,
                    scenarios_state, set_scenarios_state,

                    scenarioDetail_state, set_scenarioDetail_state,
                    userDetail_state, set_userDetail_state,
                    tempUsers_state, set_tempUsers_state,
                    socket_ref, set_chatHistory_state, chatHistory_state, lastChat_ref

                }}>
                    {/* <SocketKeeper /> */}
                    {/* <Sockeep2/> */}
                    {/* <SocketKeeper/> */}

                    <Routes>
                        <Route path="/*" element={<Instr_Dash />} />
                        <Route path="/scenarios/*" element={<Instr_Scenarios />} />
                        <Route path="/scenarios/:scenarioID" element={<Instr_ScenDetail />} />
                        <Route path="/scenarios/:scenarioID/chat" element={<Chat_Instructor />} />
                        <Route path="/groups/*" element={<Instr_Groups />} />
                        <Route path="/groups/:groupID/*" element={<Instr_GroupDetail />} />
                        <Route path="/students/*" element={<Instr_Users />} />
                        <Route path="/students/:userID/*" element={<Instr_UserDetail />} />
                        <Route path="/panopticon" element={<Panopticon />} />
                    </Routes>

                </InstructorRouter_context.Provider>

            </div>
        </div>
    );
};

export default Instructor_router;
