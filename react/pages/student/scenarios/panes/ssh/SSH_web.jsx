
import React, { useEffect, useRef, useState, useContext } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './SSH_web.css';
import { HomeRouter_context } from '../../../../pub/Home_router';

const proto = (window.location.protocol == "https:") ? "wss" : "ws";
const NODEJS_WEBSSH_URL = `${proto}://${window.location.host}/ssh`;

function SSH_web(props) {

    const terminalRef = useRef(null);
    const term = useRef(new Terminal());
    const fitAddon = useRef(new FitAddon());
    const { userData_state, socket_ref } = useContext(HomeRouter_context);

    const [SSH_ip, SSH_port_str] = props.SSH_address.split(':');
    const SSH_port = parseInt(SSH_port_str, 10);
    const SSH_username = props.SSH_username;
    const SSH_password = props.SSH_password;

    useEffect(() => {
        term.current.loadAddon(fitAddon.current);
        term.current.open(terminalRef.current);
        fitAddon.current.fit();

        const newSocket = new WebSocket(NODEJS_WEBSSH_URL);
        socket_ref.current = newSocket;

        newSocket.onopen = () => {
            newSocket.send(JSON.stringify({
                type: 'set_credentials',
                scenario_id: props.scenario_id,
                // username: socket server gets username from jwt for security
                password: SSH_password,
                SSH_ip: SSH_ip,
                SSH_port: SSH_port
            }));
        };

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'greeting') {term.current.write(data.greeting);} 
            else if (data.type === 'edu3_response') {term.current.write(data.result);}
        };

        term.current.onData(data => {
            if (socket_ref.current && socket_ref.current.readyState === WebSocket.OPEN) {
                socket_ref.current.send(JSON.stringify({ type: 'edu3_command_data', data: data }));
            } else {console.error('Socket is not connected.');}
        });

        // Resize the terminal on window resize
        const handleResize = () => {
            fitAddon.current.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            newSocket.close();
            term.current.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
}; 

export default SSH_web;
