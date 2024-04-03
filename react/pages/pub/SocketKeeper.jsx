
import React, {useContext, useEffect} from 'react';
import Login from './login/Login';
import { HomeRouter_context } from "./Home_router";
import { InstructorRouter_context } from '../instructor/Instructor_router';

function SocketKeeper () {

    const { socketConnection_state, set_socketConnection_state } = (InstructorRouter_context)

    const proto = (window.location.protocol == "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;

    function restoreSocket () {

    const socket = useRef(null);
    const pingInterval = 12000;

    useEffect(() => {
        trySocket();
    }, []); 

    async function trySocket(){
        socket.current = new WebSocket(socketURL);
        socket.current.onopen = () => {
            const handshake_msg = {
                type: 'chatMessage',
                data: testMessage
            };
            if (socket.current && socket.current.readyState === 1) {
                socket.current.send(JSON.stringify(handshake_msg));
            };
            setInterval(() => {
                if (socket.current.readyState === 1) {
                    socket.current.send(JSON.stringify({ping:'ping'}));
                }
            }, pingInterval);
        };
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === 'newChatMessage') {
                set_chatLog_state((prevChatLog) => [...prevChatLog, message.data]);
            } else if (message.type === 'chatError') {
                console.error('Chat error:', message.data);
            };
        };

        socket.current.onerror = (event) => {
            console.error('WebSocket error:', event);
        };

        socket.current.onclose = (event) => {
            socket.current = new WebSocket(socketURL);
        };
        return () => {
            if (socket.current) {
                socket.current.close();
            };
        };
    };
    const handleInputChange = (event, setState) => {
        setState(event.target.value);
    };
    
    const handleSubmit = (event) => {
        event.preventDefault();
        const chatMsg = new ChatMessage(1, messageContent_state);
        const newChat = {
            type: 'chatMessage',
            data: chatMsg
        };
        if (socket.current && socket.current.readyState === 1) {
            socket.current.send(JSON.stringify(newChat));
        };
    };
    const handleConnectSubmit = (event) => {
        event.preventDefault();
        trySocket();
    };
        set_socketConnection_state( something );
      };
      useEffect(() => {restoreSocket();}, []);
  };
  export default SocketKeeper;
