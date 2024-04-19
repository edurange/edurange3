
import { useState, useRef, useEffect, useContext } from 'react';
import { HomeRouter_context } from '@pub/Home_router.jsx';

export class ChatMessage {
    constructor(user_alias, scenario_id, message) {
        this.type = 'chat_message'
        this.scenario_id = scenario_id;
        this.message = message || "I love edurange";
        this.timestamp = Date.now();
        this.user_alias = user_alias;
    }
}

function Sockeep2() {
    const { userData_state, userAlias_state } = useContext (HomeRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const [chatHistory_state, set_chatHistory_state] = useState([]);
    const lastChat_ref = useRef(null);
    const socket_ref = useRef(null);

    const proto = (window.location.protocol == "https") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/chat`;



    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'chat_receipt') {
                set_chatHistory_state((prevChatLog) => [...prevChatLog, message]);
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
    }, [chatHistory_state]);

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    
    useEffect(() => {
        if (!userData_state) return;

        const connectWebSocket = () => {

            // socket_ref.current = new WebSocket(socketURL);

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
    }, [socket_ref]);

    const sendMessage = () => {
        const chatMsg = new ChatMessage(userAlias_state, 123, messageContent_state.trim());
        if (chatMsg.message) {
            const newChat = {
                type: 'chatMessage',
                message: chatMsg
            };
            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
                set_messageContent_state('');
            }
        }
    };

    return (
        <div className='chatStu-frame'>

            <div className='chatStu-input-frame'>
                <form className='chatStu-input-frame' onSubmit={handleSubmit}>
                    <div className='chatStu-input-item sender-frame'>
                        <textarea className='sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                        <button className='sender-button connect-button' type="submit">Send</button>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default Sockeep2;