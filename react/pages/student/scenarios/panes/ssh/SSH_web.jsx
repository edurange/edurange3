
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './SSH_web.css';

function SSH_web(props) {

    const proto = (window.location.protocol === "https:") ? "wss" : "ws";
    const socketURL = `${proto}://${window.location.host}/ssh`;

    const terminalRef = useRef(null);
    const term = useRef(new Terminal());
    const fitAddon = useRef(new FitAddon());
    const socketRef = useRef(null);

    const [SSH_ip, SSH_port_str] = props.SSH_address.split(':');
    const SSH_port = parseInt(SSH_port_str, 10);
    const SSH_password = props.SSH_password;

    useEffect(() => {
        term.current.loadAddon(fitAddon.current);
        term.current.open(terminalRef.current);
        fitAddon.current.fit();

        socketRef.current = new WebSocket(socketURL);

        socketRef.current.onopen = () => {
            console.log('WebSocket is open');
            socketRef.current.send(JSON.stringify({
                type: 'set_credentials',
                scenario_id: props.scenario_id,
                password: SSH_password,
                SSH_ip: SSH_ip,
                SSH_port: SSH_port
            }));

            // Start sending pings every 30 seconds
            const pingInterval = setInterval(() => {
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ ping: 'ping' }));
                }
            }, 30000);

            // Clear the interval on WebSocket close
            socketRef.current.onclose = () => {
                clearInterval(pingInterval);
            };
        };

        socketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.pong) {
                console.log('Received pong');
            } else if (message.type === 'greeting') {
                term.current.write(message.greeting);
            } else if (message.type === 'edu3_response') {
                term.current.write(message.result);
            }
            // Add more message handling as needed...
        };

        term.current.onData(data => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'edu3_command_data', data: data }));
            } else {
                console.error('Socket is not connected.');
            }
        });

        // Resize the terminal on window resize
        const handleResize = () => {
            fitAddon.current.fit();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            term.current.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [props.scenario_id, SSH_password, SSH_ip, SSH_port]);

    return (
        <div className="ssh-terminal-frame">
            <div className='ssh-terminal-header-frame'>
                <div className='ssh-terminal-header-text'>
                    eduRange pseudo-terminal
                </div>
            </div>
            <div className='ssh-terminal-output-frame' ref={terminalRef}></div>
        </div>
    );
}

export default SSH_web;