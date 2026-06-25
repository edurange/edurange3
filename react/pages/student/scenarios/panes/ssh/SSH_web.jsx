import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './SSH_web.css';

function SSH_web(props) {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const fitAddonRef = useRef(null);
    const socketRef = useRef(null);
    const colsRef = useRef(80);
    const rowsRef = useRef(24);

    const [SSH_ip] = (props.SSH_address || ':').split(':');
    const SSH_port = parseInt(props.SSH_address?.split(':')[1], 10) || 22;

    const sendResize = useCallback(() => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (!termRef.current) return;
        const dims = { cols: termRef.current.cols, rows: termRef.current.rows };
        if (dims.cols === colsRef.current && dims.rows === rowsRef.current) return;
        colsRef.current = dims.cols;
        rowsRef.current = dims.rows;
        socketRef.current.send(JSON.stringify({ type: 'resize', ...dims }));
    }, []);

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Courier New', monospace",
            theme: {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                black: '#484f58',
                red: '#ff7b72',
                green: '#3fb950',
                yellow: '#d29922',
                blue: '#58a6ff',
                magenta: '#bc8cff',
                cyan: '#39c5cf',
                white: '#b1bac4',
                brightBlack: '#6e7681',
                brightRed: '#ffa198',
                brightGreen: '#56d364',
                brightYellow: '#e3b341',
                brightBlue: '#79c0ff',
                brightMagenta: '#d2a8ff',
                brightCyan: '#56d4dd',
                brightWhite: '#f0f6fc',
            },
            scrollback: 5000,
            allowProposedApi: true,
            allowTransparency: false,
        });
        termRef.current = term;

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();
        colsRef.current = term.cols;
        rowsRef.current = term.rows;

        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socketURL = `${proto}://${window.location.host}/ssh`;
        const ws = new WebSocket(socketURL);
        socketRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'set_credentials',
                scenario_id: props.scenario_id,
                password: props.SSH_password,
                SSH_ip: SSH_ip,
                SSH_port: SSH_port,
                cols: term.cols,
                rows: term.rows,
            }));

            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ ping: 'ping' }));
                }
            }, 15000);

            ws.addEventListener('close', () => clearInterval(pingInterval), { once: true });
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'greeting') {
                    term.write(message.greeting.replace(/\n/g, '\r\n'));
                } else if (message.type === 'edu3_response') {
                    term.write(message.result);
                } else if (message.type === 'error') {
                    term.write(`\r\n\x1b[31mError: ${message.message}\x1b[0m\r\n`);
                }
            } catch (e) {
                term.write(event.data);
            }
        };

        ws.onerror = () => {
            term.write('\r\n\x1b[31mWebSocket connection error\x1b[0m\r\n');
        };

        ws.onclose = () => {
            term.write('\r\n\x1b[33m--- Connection closed ---\x1b[0m\r\n');
        };

        term.onData(data => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'edu3_command_data', data }));
            }
        });

        term.onResize(() => {
            fitAddon.fit();
            sendResize();
        });

        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
            sendResize();
        });
        resizeObserver.observe(terminalRef.current);

        window.addEventListener('resize', sendResize);

        return () => {
            window.removeEventListener('resize', sendResize);
            resizeObserver.disconnect();
            if (ws.readyState === WebSocket.OPEN) ws.close();
            term.dispose();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
