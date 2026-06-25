const http = require('http');
const { Client } = require('ssh2');
const WebSocketServer = require('ws').WebSocketServer;
const cookie = require('cookie');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sshHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for SSH WebSocket upgrade.\n');
});

const sshSocketServer = new WebSocketServer({
    server: sshHttpServer,
    verifyClient: (info, done) => {
        try {
            const cookies = cookie.parse(info.req.headers.cookie || '');
            const er3_jwt = cookies.edurange3_jwt;
            const skey = process.env.JWT_SECRET_KEY;
            const verified_jwt = jwt.verify(er3_jwt, skey);
            const jwt_payload = JSON.parse(verified_jwt.sub);
            info.req.get_id = () => jwt_payload;
            done(true);
        } catch (err) {
            done(false, 401, 'Invalid JWT');
        }
    }
});

function closeShell(shell) {
    try { shell.close(); } catch (e) { /* already closed */ }
}

sshSocketServer.on('connection', async (ssh_socket, request) => {
    const { username, user_role, user_id } = request.get_id() || {};
    if (!username) {
        ssh_socket.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
        ssh_socket.close();
        return;
    }
    const saniname = username.replace(/-/g, '');

    let sshClient = null;
    let shell = null;

    ssh_socket.send(JSON.stringify({
        type: 'greeting',
        greeting: `\x1b[37m \x1b[32medu\x1b[31mRange\x1b[37;2m pseudo-terminal\x1b[95m by exoriparian\x1b[0m \r\n`
    }));

    ssh_socket.on('message', async (message) => {
        let data;
        try { data = JSON.parse(message); } catch (e) { return; }

        if (data.type === 'ping') {
            if (ssh_socket.readyState === 1) {
                ssh_socket.send(JSON.stringify({ pong: 'pong' }));
            }
            return;
        }

        if (data.type === 'resize' && shell) {
            shell.setWindow(data.rows, data.cols);
            return;
        }

        if (data.type === 'set_credentials') {
            if (sshClient) {
                try { sshClient.end(); } catch (e) { /* ignore */ }
            }

            sshClient = new Client();

            sshClient.on('ready', () => {
                sshClient.shell({
                    term: 'xterm-256color',
                    cols: data.cols || 80,
                    rows: data.rows || 24,
                }, (err, stream) => {
                    if (err) {
                        ssh_socket.send(JSON.stringify({ type: 'error', message: err.message }));
                        return;
                    }
                    shell = stream;

                    stream.on('data', (dataOutput) => {
                        if (ssh_socket.readyState === 1) {
                            ssh_socket.send(JSON.stringify({
                                type: 'edu3_response',
                                result: dataOutput.toString()
                            }));
                        }
                    });

                    stream.stderr.on('data', (dataError) => {
                        if (ssh_socket.readyState === 1) {
                            ssh_socket.send(JSON.stringify({
                                type: 'edu3_response',
                                result: dataError.toString()
                            }));
                        }
                    });

                    stream.on('close', () => {
                        shell = null;
                        ssh_socket.send(JSON.stringify({
                            type: 'edu3_response',
                            result: '\r\n\x1b[33m--- SSH session closed ---\x1b[0m\r\n'
                        }));
                    });
                });
            });

            sshClient.on('error', (err) => {
                ssh_socket.send(JSON.stringify({
                    type: 'error',
                    message: `SSH connection failed: ${err.message}`,
                    code: err.code,
                    port: data.SSH_port
                }));
            });

            sshClient.connect({
                host: 'localhost',
                port: data.SSH_port || 22,
                username: saniname,
                password: data.password,
                readyTimeout: 10000,
                keepaliveInterval: 30000,
                keepaliveCountMax: 3,
            });
            return;
        }

        if (data.type === 'edu3_command_data' && shell) {
            shell.write(data.data);
        }
    });

    ssh_socket.on('close', () => {
        if (shell) closeShell(shell);
        if (sshClient) {
            try { sshClient.end(); } catch (e) { /* ignore */ }
        }
    });

    ssh_socket.on('error', () => {
        if (shell) closeShell(shell);
        if (sshClient) {
            try { sshClient.end(); } catch (e) { /* ignore */ }
        }
    });
});

module.exports = { sshHttpServer, sshSocketServer };
