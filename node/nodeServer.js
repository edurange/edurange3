
const  {chatHttpServer} = require('./er3_modules/er3_chat');
const  {sshHttpServer} = require('./er3_modules/er3_ssh');

const chatPort = 31338;
const sshPort = 31337;

chatHttpServer.listen(chatPort, () => {
    console.log(`Chat WebSocket Server running on port ${chatPort}`);
});

sshHttpServer.listen(sshPort, () => {
    console.log(`SSH WebSocket Server running on port ${sshPort}`);
});
