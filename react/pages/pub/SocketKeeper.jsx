
import React, { useContext, useEffect, useRef } from 'react';
import { HomeRouter_context } from "./Home_router";

function SocketKeeper() {
    const { userData_state, socket_ref } = useContext(HomeRouter_context);
    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;
    const pingInterval = 12000;
    const reconnectInterval = 5000;
    const reconnectRef = useRef(null);

    useEffect(() => {
        if (!userData_state) return;

        const connectWebSocket = () => {
            socket_ref.current = new WebSocket(socketURL);

            socket_ref.current.onopen = () => {
                if (socket_ref.current && socket_ref.current.readyState === 1) {
                    console.log('sending socket handshake...');
                    socket_ref.current.send(JSON.stringify({
                        type: 'handshake',
                        message: `${userData_state?.username}'s websocket has connected` 
                    }));
                }
                setInterval(() => {
                    if (socket_ref.current.readyState === 1) {
                        socket_ref.current.send(JSON.stringify({
                            type: 'keepalive',
                            message: 'ping'
                        }));
                    }
                }, pingInterval);
            };

            socket_ref.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('socket message received: ', message);
            };

            socket_ref.current.onerror = (event) => {
                console.error('WebSocket error:', event);
            };

            socket_ref.current.onclose = () => {
                socket_ref.current = null;
            };
        };

        connectWebSocket();

        reconnectRef.current = setInterval(() => {
            if (!socket_ref.current || socket_ref.current.readyState === WebSocket.CLOSED) {
                console.log('Attempting to reconnect WebSocket...');
                connectWebSocket();
            }
        }, reconnectInterval);

        return () => {
            if (socket_ref.current) {
                socket_ref.current.close();
            }
            clearInterval(reconnectRef.current);
        };
    }, [userData_state, socket_ref]);

    if (!socket_ref?.current) {
        return <div className='socketBox-frame logged-out'>Socket ❌</div>;
    }

    return <div className='socketBox-frame logged-in'>Socket ✅</div>;
}

export default SocketKeeper;