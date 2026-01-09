
const  {chatHttpServer} = require('./er3_modules/er3_chat');
const  {sshHttpServer} = require('./er3_modules/er3_ssh');

const chatPort = 31338;
const sshPort = 31337;

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.error('Stack:', err.stack);
    // Don't exit the process - let nodemon handle restarts
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process - let nodemon handle restarts
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Gracefully shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Gracefully shutting down...');
    process.exit(0);
});

chatHttpServer.listen(chatPort, () => {
    console.log(`Chat WebSocket Server running on port ${chatPort}`);
}).on('error', (err) => {
    console.error(`Failed to start Chat WebSocket Server on port ${chatPort}:`, err);
});

sshHttpServer.listen(sshPort, () => {
    console.log(`SSH WebSocket Server running on port ${sshPort}`);
}).on('error', (err) => {
    console.error(`Failed to start SSH WebSocket Server on port ${sshPort}:`, err);
});
