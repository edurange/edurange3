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
import Panopticon from './Panopticon';
import Instr_LogsViewer from './logs_dir/Instr_LogsViewer';
import Instr_Hints from './hints/Instr_Hints';

export const InstructorRouter_context = React.createContext();

function Instructor_router() {

    const { login_state } = useContext(HomeRouter_context);
    const [chatObjs_UL_state, set_chatObjs_UL_state] = useState([]); // unordered array of all chats
    const [channelAccess_state, set_channelAccess_state] = useState({});
    const [users_state, set_users_state] = useState([])
    const [taAssignments_state, set_taAssignments_state] = useState([]);
    const [taDict_state, set_taDict_state] = useState({})
    const [groups_state, set_groups_state] = useState([])
    const [scenarios_state, set_scenarios_state] = useState([])
    const [scenarioDetail_state, set_scenarioDetail_state] = useState({})
    const [userDetail_state, set_userDetail_state] = useState({})
    const [tempUsers_state, set_tempUsers_state] = useState([]);
    const [selectedMessage_state, set_selectedMessage_state] = useState(null);
    const [logs_state, set_logs_state] = useState({
        bash: [],
        chat: [],
        responses: [],
    })
    const lastChat_ref = useRef(null);
    const socket_ref = useRef(null);
    const socket_protocol = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${socket_protocol}://${window.location.host}/chat`;

    function compile_taDict(ta_assignments) {
        const ta_dict = {};
    
        (ta_assignments ?? []).forEach(assignment => {
            const { student_id, ta_id } = assignment;
    
            if (!ta_dict[student_id]) {
                ta_dict[student_id] = [];
            }
    
            ta_dict[student_id].push(ta_id);
        });
    
        return ta_dict;
    }

    async function get_instructorData() {
        try {
            const response = await axios.get("/get_instructor_data");
            const responseData = response.data;
            // DEV_FIX (update for new list strategy (not dict))

            // recent_reply is compared to chat_message timestamp to determine
            // whether message is considered new (Instr_UserTable.jsx).
            // the prop is also updated when an instructor sends reply (ea instr has their own record)
            // this record is only persistent in memory; full refresh effectively sets all to 'old'
            
            responseData?.users?.forEach(user => {
                if (!user.recent_reply) {
                    user.recent_reply = Date.now()
                }
                if (!user.bash_resetTime) {
                    user.bash_resetTime = Date.now()
                }
                if (!user.response_resetTime) {
                    user.response_resetTime = Date.now()
                }
                
            });

            const compiled_taDict = compile_taDict(responseData?.ta_assignments)

            set_users_state(responseData?.users);
            set_groups_state(responseData?.groups);
            set_scenarios_state(responseData?.scenarios);
            set_taDict_state(compiled_taDict);
            set_logs_state(responseData?.logs);
        }
        catch (error) { console.log('get_instructorData error:', error); };
    };
    useEffect(() => { get_instructorData(); }, []);

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
        async function get_lib(){
            const chatlib_resp = await axios.get('/get_chat_library');
            const unordered_chatObjs_array = chatlib_resp?.data?.unordered_messages_list;
            const userChannels_data = chatlib_resp?.data?.user_channels_dict;
            set_chatObjs_UL_state(unordered_chatObjs_array);
            set_channelAccess_state(userChannels_data);
        }
        get_lib()
    }, []);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.message_type === 'chat_message_receipt') {
                set_chatObjs_UL_state(prevHistory => [...prevHistory, message?.data]);
            } else if (message.message_type === 'chatError') {
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
    }, [chatObjs_UL_state]);

    if (
        !scenarios_state
        || !groups_state
        || !scenarios_state
        || !logs_state
        || !login_state
    ) { return <></> }

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
                    chatObjs_UL_state, set_chatObjs_UL_state,
                    channelAccess_state, set_channelAccess_state,
                    selectedMessage_state, set_selectedMessage_state,
                    socket_ref, lastChat_ref,
                    logs_state, set_logs_state,
                    taAssignments_state, set_taAssignments_state,
                    taDict_state, set_taDict_state
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
                        <Route path="/panopticon/" element={<Panopticon />} />
                        <Route path="/logs/" element={<Instr_LogsViewer />} />
                        <Route path="/hints/" element={<Instr_Hints />} />
                    </Routes>

                </InstructorRouter_context.Provider>

            </div>
        </div>
    );
};
export default Instructor_router;