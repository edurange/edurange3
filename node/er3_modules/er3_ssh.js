
const http = require('http');
const { Client } = require('ssh2');
const WebSocketServer = require('ws').WebSocketServer;
const cookie = require('cookie');

const sshHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for SSH WebSocket upgrade.\n');
});

const sshSocketServer = new WebSocketServer({
    server: sshHttpServer,
    verifyClient: (info, done) => {

        const cookies = cookie.parse(info.req.headers.cookie || '');
        const jwt = cookies.edurange3_jwt;
        const csrf = cookies['X-XSRF-TOKEN'];
        const flask_session = cookies.session;

        info.jwt = jwt;
        info.csrf = csrf;
        info.flask_session = flask_session;

        done(true); // Accept the connection
    }
});
sshSocketServer.on('connection', (socket) => {
    console.log('New client connected to SSH terminal');

    socket.send(JSON.stringify({
        type: 'greeting',
        greeting: `\x1b[37m Welcome to the \x1b[32medu\x1b[31mRange\x1b[30m pseudo123-terminal! \n \x1b[37mWhile we recommend using official OS terminal shells and ssh connections, this \x1b[35m(limited feature)\x1b[37m emulated terminal can also be handy.\x1b[0m \n\n`
    }));

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'set_credentials') {
            const sshClient = new Client();
            let sendTimer = null;
            const SEND_INTERVAL = 10; // send data every 10ms
            let bufferedData = ""; // Moved to this scope

            function sendDataToFrontend() {
                if (bufferedData) {
                    socket.send(JSON.stringify({ type: 'edu3_response', result: bufferedData }));
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

                    socket.on('message', (message) => {
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
                host: data.SSH_host,
                port: data.SSH_port,
                username: data.SSH_username,
                password: data.SSH_password,
            });

            socket.on('close', () => {
                console.log('Client disconnected');
                sshClient.end();
            });
        }
    });
});
module.exports = { sshHttpServer, sshSocketServer };