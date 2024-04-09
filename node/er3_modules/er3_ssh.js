
const http = require('http');
const { Client } = require('ssh2');
const WebSocketServer = require('ws').WebSocketServer;
const cookie = require('cookie');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const { Pool } = pg;
const pool = new Pool({
    host: 'localhost',
    port: process.env.NODE_DB_PORT,
    database: process.env.NODE_DB_NAME,
    user: process.env.NODE_DB_USERNAME,
    password: process.env.NODE_DB_PASSWORD,
});

const sshHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for SSH WebSocket upgrade.\n');
});

const sshSocketServer = new WebSocketServer({
    server: sshHttpServer,
    verifyClient: (info, done) => {
        const cookies = cookie.parse(info.req.headers.cookie || '');
        const er3_jwt = cookies.edurange3_jwt;
        const skey = (process.env.JWT_SECRET_KEY);
        const verified_jwt = jwt.verify(er3_jwt, skey);
        const jwt_payload = verified_jwt.sub
        info.req.get_id = () => jwt_payload;
        done(true);
    }
});
sshSocketServer.on('connection', async (ssh_socket, request) => {
    const {username, user_role, user_id} = request.get_id();
    
    if (!username) {return {error: 'username not found in validated jwt'}};
    const saniname = username.replace(/-/g, '');

    // DEV_ONLY
    console.log(
        `#  User connected to ssh pseudo-terminal w/ jwt id: `,
        `\n#    username: ${saniname}`,
        `\n#    user_role: ${user_role}`,
        `\n#    user_id: ${user_id}`);
        
        ssh_socket.send(JSON.stringify({
            type: 'greeting',
            greeting: `\x1b[37m \x1b[32medu\x1b[31mRange\x1b[37;2m pseudo-terminal\x1b[95m by exoriparian\x1b[0m \n\n`
        }));
        
        ssh_socket.on('message', async (message) => {

        const data = JSON.parse(message);

        if (data.hasOwnProperty('ping')){
            ssh_socket.send(JSON.stringify({pong:"pong"}));
            return;
        }

        if (data.type === 'set_credentials') {
            const sshClient = new Client();
            let sendTimer = null;
            const SEND_INTERVAL = 10; // send data every 10ms
            let bufferedData = ""; // Moved to this scope

            function sendDataToFrontend() {
                if (bufferedData) {
                    ssh_socket.send(JSON.stringify({ type: 'edu3_response', result: bufferedData }));
                    bufferedData = "";
                }
            }

            sshClient.on('ready', () => {
                console.log('SSH Client Ready');

                sshClient.shell((err, shell) => {
                    if (err) {
                        console.error("Error starting shell:", err);
                        return;
                    }

                    shell.on('data', (dataOutput) => {
                        bufferedData += dataOutput.toString();

                        if (sendTimer) clearTimeout(sendTimer);

                        if (dataOutput.toString().trim().endsWith("$")) {
                            sendDataToFrontend();
                        } else {
                            sendTimer = setTimeout(sendDataToFrontend, SEND_INTERVAL);
                        }
                    });

                    ssh_socket.on('message', (message) => {
                        const cmdData = JSON.parse(message);
                        if (cmdData.type === 'edu3_command_data') {
                            shell.write(cmdData.data);
                        }
                    });

                    shell.on('close', () => {
                        console.log('Shell session closed');
                    });

                    shell.stderr.on('data', (dataError) => {
                        console.log('Error from shell:', dataError.toString());
                    });
                });
            }).connect({
                host: 'localhost',
                port: data.SSH_port,
                username: saniname,
                password: data.password,
            });

            ssh_socket.on('close', () => {
                console.log('Client disconnected');
                sshClient.end();
            });
        }
    });
});
module.exports = { sshHttpServer, sshSocketServer };