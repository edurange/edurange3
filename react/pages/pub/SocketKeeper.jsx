
import React, { useContext, useEffect, useRef } from 'react';
import { HomeRouter_context } from "./Home_router";

const TestMessage = {
    
        type : 'chat_message',
        scenario_id : 123,
        message : "I love edurange",
        timestamp : Date.now(),
        user_alias : 'something',
}



function SocketKeeper() {
    const { userData_state, chatHistory_state, set_chatHistory_state } = useContext(HomeRouter_context);
    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;
    const pingInterval = 12000;
    const reconnectInterval = 5000;
    const socket_ref = useRef(null);
    const reconnectRef = useRef(null);

    const sendTest = () => {
        const chatMsg = TestMessage;
        console.log('sending a test...')
        console.log('chatMsg.message: ',chatMsg.message)
        if (chatMsg.message) {
            const newChat = {
                type: 'chatMessage',
                message: chatMsg
            };
            console.log("socket_ref.current: ",socket_ref.current)
            console.log("socket_ref.current.readyState: ",socket_ref.current.readyState)
            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
                set_messageContent_state('');
            }
        }
    };

    const updateChatHistory = (userId, message) => {
        set_chatHistory_state(prevHistory => ({
            ...prevHistory,
            [userId]: [...(prevHistory[userId] || []), message],
        }));
    };

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('received message: ', message);
            if (message.type === 'chat_receipt' || message.type === 'chat_cc') {
                updateChatHistory(message?.message?.user_id, message);
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
    }, [socket_ref, set_chatHistory_state]);

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

            socket_ref.current.onerror = (event) => {
                console.error('WebSocket error:', event);
            };

            socket_ref.current.onclose = () => {
                socket_ref.current = null;
            };
            // sendTest();
        };

        connectWebSocket();
        // sendTest();


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



// import React, { useContext, useEffect, useRef } from 'react';
// import { HomeRouter_context } from "./Home_router";

// function SocketKeeper() {
//     const { userData_state, socket_ref, chatHistory_state, set_chatHistory_state } = useContext(HomeRouter_context);
//     const proto = (window.location.protocol === "https:") ? "wss" : "ws";
//     const socketURL = `${proto}://${window.location.host}/chat`;
//     const pingInterval = 12000;
//     const reconnectInterval = 5000;
//     const reconnectRef = useRef(null);

//     const updateChatHistory = (userId, message) => {
//         set_chatHistory_state(prevHistory => ({
//             ...prevHistory,
//             [userId]: [...(prevHistory[userId] || []), message],
//         }));
//     };

//     useEffect(() => {
//         const handleMessage = (event) => {
//             const message = JSON.parse(event.data);
//             console.log('received message: ', message);
//             if (message.type === 'chat_receipt') {
//                 updateChatHistory(message?.message?.user_id, message);
//             } else if (message.type === 'chatError') {
//                 console.error('Chat error:', message.data);
//             }
//         };

//         if (socket_ref.current) {
//             socket_ref.current.addEventListener('message', handleMessage);
//         }

//         return () => {
//             if (socket_ref.current) {
//                 socket_ref.current.removeEventListener('message', handleMessage);
//             }
//         };
//     }, [socket_ref, set_chatHistory_state]);

//     useEffect(() => {
//         if (!userData_state) return;

//         const connectWebSocket = () => {
//             socket_ref.current = new WebSocket(socketURL);

//             socket_ref.current.onopen = () => {
//                 if (socket_ref.current && socket_ref.current.readyState === 1) {
//                     console.log('sending socket handshake...');
//                     socket_ref.current.send(JSON.stringify({
//                         type: 'handshake',
//                         message: `${userData_state?.username}'s websocket has connected`
//                     }));
//                 }
//                 setInterval(() => {
//                     if (socket_ref.current.readyState === 1) {
//                         socket_ref.current.send(JSON.stringify({
//                             type: 'keepalive',
//                             message: 'ping'
//                         }));
//                     }
//                 }, pingInterval);
//             };

//             socket_ref.current.onerror = (event) => {
//                 console.error('WebSocket error:', event);
//             };

//             socket_ref.current.onclose = () => {
//                 socket_ref.current = null;
//             };
//         };

//         connectWebSocket();

//         reconnectRef.current = setInterval(() => {
//             if (!socket_ref.current || socket_ref.current.readyState === WebSocket.CLOSED) {
//                 console.log('Attempting to reconnect WebSocket...');
//                 connectWebSocket();
//             }
//         }, reconnectInterval);

//         return () => {
//             if (socket_ref.current) {
//                 socket_ref.current.close();
//             }
//             clearInterval(reconnectRef.current);
//         };
//     }, [userData_state, socket_ref]);

//     if (!socket_ref?.current) {
//         return <div className='socketBox-frame logged-out'>Socket ❌</div>;
//     }

//     return <div className='socketBox-frame logged-in'>Socket ✅</div>;
// }

// export default SocketKeeper;


// import React, { useContext, useEffect, useRef } from 'react';
// import { HomeRouter_context } from "./Home_router";

// function SocketKeeper() {
//     const { userData_state, socket_ref, chatHistory_state, set_chatHistory_state } = useContext(HomeRouter_context);
//     const proto = (window.location.protocol === "https:") ? "wss" : "ws";
//     const socketURL = `${proto}://${window.location.host}/chat`;
//     const pingInterval = 12000;
//     const reconnectInterval = 5000;
//     const reconnectRef = useRef(null);

//     useEffect(() => {
//         if (!userData_state) return;

//         const connectWebSocket = () => {
//             socket_ref.current = new WebSocket(socketURL);

//             socket_ref.current.onopen = () => {
//                 if (socket_ref.current && socket_ref.current.readyState === 1) {
//                     console.log('sending socket handshake...');
//                     socket_ref.current.send(JSON.stringify({
//                         type: 'handshake',
//                         message: `${userData_state?.username}'s websocket has connected` 
//                     }));
//                 }
//                 setInterval(() => {
//                     if (socket_ref.current.readyState === 1) {
//                         socket_ref.current.send(JSON.stringify({
//                             type: 'keepalive',
//                             message: 'ping'
//                         }));
//                     }
//                 }, pingInterval);
//             };

//             socket_ref.current.onmessage = (event) => {
//                 const message = JSON.parse(event.data);
//                 console.log('socket message received: ', message);
//             };

//             socket_ref.current.onerror = (event) => {
//                 console.error('WebSocket error:', event);
//             };

//             socket_ref.current.onclose = () => {
//                 socket_ref.current = null;
//             };
//         };

//         connectWebSocket();

//         reconnectRef.current = setInterval(() => {
//             if (!socket_ref.current || socket_ref.current.readyState === WebSocket.CLOSED) {
//                 console.log('Attempting to reconnect WebSocket...');
//                 connectWebSocket();
//             }
//         }, reconnectInterval);

//         return () => {
//             if (socket_ref.current) {
//                 socket_ref.current.close();
//             }
//             clearInterval(reconnectRef.current);
//         };
//     }, [userData_state, socket_ref]);

//     if (!socket_ref?.current) {
//         return <div className='socketBox-frame logged-out'>Socket ❌</div>;
//     }

//     return <div className='socketBox-frame logged-in'>Socket ✅</div>;
// }

// export default SocketKeeper;

// const updateChatHistory = (userId, message) => {
//     set_chatHistory_state(prevHistory => ({
//       ...prevHistory,
//       [userId]: [...(prevHistory[userId] || []), message],
//     }));
//   };
  

// useEffect(() => {
//     const handleMessage = (event) => {
//         const message = JSON.parse(event.data);
//         console.log('received message: ', message)
//         if (message.type === 'chat_cc') {


//             updateChatHistory(message?.message?.user_id, message)


//         } else if (message.type === 'chatError') {
//             console.error('Chat error:', message.data);
//         }
//     };

//     if (socket_ref.current) {
//         socket_ref.current.addEventListener('message', handleMessage);
//     }

//     return () => {
//         if (socket_ref.current) {
//             socket_ref.current.removeEventListener('message', handleMessage);
//         }
//     };
// }, [socket_ref]);