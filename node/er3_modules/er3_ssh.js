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
            const verified_jwt = jwt.verify(er3_jwt, skey, { algorithms: ['HS256'] });
            const jwt_payload = JSON.parse(verified_jwt.sub);
            info.req.get_id = () => jwt_payload;
            // Expose the JWT `exp` (epoch seconds) so the keepalive handler can
            // detect imminent expiry and ask the browser to refresh the cookie.
            info.req.get_jwt_exp = () => verified_jwt.exp;
            done(true);
        } catch (err) {
            done(false, 401, 'Invalid JWT');
        }
    }
});

// Refresh threshold: ask the browser to refresh the auth cookie when the JWT
// has fewer than this many milliseconds of life remaining. Keeps the SSH-only
// tail alive indefinitely without adding any new polling traffic.
const JWT_REFRESH_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
// Minimum gap between refresh requests on the same connection so we don't
// hammer /api/refresh if the browser is slow to rotate the cookie.
const JWT_REFRESH_THROTTLE_MS = 60 * 1000; // 1 minute

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
    let lastRefreshRequestAt = 0;

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
                _maybeRequestJwtRefresh(ssh_socket, request, lastRefreshRequestAt, (t) => { lastRefreshRequestAt = t; });
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

// Shared helper: emit a `refresh_jwt` control frame when the verified JWT (the
// one the browser presented at WebSocket handshake) is close to expiry. The
// SSH socket is already open and stays open regardless, so this is purely
// about keeping the browser's auth cookie fresh for *future* connections
// (and for any /api/* calls the page might make).
function _maybeRequestJwtRefresh(ws, request, lastAt, updateLastAt) {
    const exp = request.get_jwt_exp ? request.get_jwt_exp() : null;
    if (!exp) return;
    const remainingMs = (exp * 1000) - Date.now();
    if (remainingMs >= JWT_REFRESH_THRESHOLD_MS) return;
    if (Date.now() - lastAt < JWT_REFRESH_THROTTLE_MS) return;
    updateLastAt(Date.now());
    if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'refresh_jwt', remaining_ms: remainingMs }));
    }
}

module.exports = { sshHttpServer, sshSocketServer };
