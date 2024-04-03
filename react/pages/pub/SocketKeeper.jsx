
import React, { useContext, useRef, useEffect } from 'react';
import Login from './login/Login';
import { HomeRouter_context } from "./Home_router";
import { InstructorRouter_context } from '../instructor/Instructor_router';
import { ChatMessage } from '../student/chat/Chat_Student';

function SocketKeeper() {

    const { socketConnection_state, set_socketConnection_state } = useContext(InstructorRouter_context)

    const proto = (window.location.protocol == "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;
    const testMessage = new ChatMessage(1, "hello students!");

    const socket = useRef(null);
    const pingInterval = 12000;

    async function trySocket() {
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
                    socket.current.send(JSON.stringify({ ping: 'ping' }));
                }
            }, pingInterval);
        };
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'newChatMessage') {
                console.log('new chat message received')
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

    useEffect(() => { trySocket(); }, []);
    set_socketConnection_state(false);
};


export default SocketKeeper;
