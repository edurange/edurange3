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
import { HomeRouter_context } from '../pub/Home_router';

export const InstructorRouter_context = React.createContext();

function Instructor_router() {

    const { login_state, userData_state } = useContext(HomeRouter_context);
    const [chatLibrary_state, set_chatLibrary_state] = useState({});
    const [channelAccess_state, set_channelAccess_state] = useState({});
    const [users_state, set_users_state] = useState([])
    const [groups_state, set_groups_state] = useState([])
    const [scenarios_state, set_scenarios_state] = useState([])
    const [scenarioDetail_state, set_scenarioDetail_state] = useState({})
    const [userDetail_state, set_userDetail_state] = useState({})
    const [tempUsers_state, set_tempUsers_state] = useState([]);
    const [selectedMessage_state, set_selectedMessage_state] = useState([]);
    const lastChat_ref = useRef(null);

    const socket_ref = useRef(null);

    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;



    async function get_instructorData() {
        try {
            const response = await axios.get("/get_instructor_data");
            const responseData = response.data;
            // console.log('Loading Instructor Data:', responseData);
            set_users_state(responseData?.users);
            set_groups_state(responseData?.groups);
            set_scenarios_state(responseData?.scenarios);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

    if (!scenarios_state) { return <></> }
    if (!login_state) { return <></> }

    function updateChatLibrary (channel_id, message) {
        set_chatLibrary_state(prevHistory => ({
            ...prevHistory,
            [channel_id]: [...(prevHistory?.[channel_id] ?? []), message],
        }));
    };

    // INITIALIZE ONLY SOCKET REF
    useEffect(() => {
        socket_ref.current = new WebSocket(socketURL);
        const pingInterval = 11_000; // unit: ms
        const interval_id = setInterval(() => {
            if (socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify({
                    type: 'keepalive',
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
        async function get_lib(){
            const chatlib_resp = await axios.get('/get_chat_library');
            const chatlib_data = chatlib_resp?.data?.chatLibrary_dict;
            const userChannels_data = chatlib_resp?.data?.user_channels_dict;
            set_chatLibrary_state(chatlib_data);
            set_channelAccess_state(userChannels_data);
        }
        get_lib()
    }, []);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === 'chat_message_receipt') {
                const msg_data = message?.data;
                const msg_channel = msg_data?.channel;
                updateChatLibrary (msg_channel, message?.data)

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
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatLibrary_state]);

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
                    chatLibrary_state, set_chatLibrary_state,
                    channelAccess_state, set_channelAccess_state,
                    selectedMessage_state, set_selectedMessage_state,
                    socket_ref, lastChat_ref,

                }}>
                    <Routes>
                        <Route path="/*" element={<Instr_Dash />} />
                        <Route path="/scenarios/*" element={<Instr_Scenarios />} />
                        <Route path="/scenarios/:scenarioID" element={<Instr_ScenDetail />} />
                        <Route path="/scenarios/:scenarioID/chat" element={<Chat_Instructor />} />
                        <Route path="/groups/*" element={<Instr_Groups />} />
                        <Route path="/groups/:groupID/*" element={<Instr_GroupDetail />} />
                        <Route path="/students/*" element={<Instr_Users />} />
                        <Route path="/students/:userID/*" element={<Instr_UserDetail />} />
                    </Routes>

                </InstructorRouter_context.Provider>

            </div>
        </div>
    );
};
export default Instructor_router;