// this service is expecting the user's request header to contain a jwt cookie
// if all is well, the cookie is assigned when a user logs in to edurange via flask

const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const Joi = require('joi');
const { Pool } = pg;
const fs = require('fs').promises;
const { genAlias } = require('./aliasModules');


// root project env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

let archive_id;

const pool = new Pool({
    user: process.env.CHATDB_USERNAME,
    host: process.env.CHATDB_LOCALHOST,
    database: process.env.CHATDB_DATABASENAME,
    password: process.env.CHATDB_PASSWORD,
    port: process.env.CHATDB_PORT
});

async function updateLogsID() {
    try {
        const data = await fs.readFile('../logs/archive_id.txt', 'utf8');
        archive_id = data;
    } catch (err) {
        console.error(err);
    }
}

const aliasDict = {};
const userDict = {}

async function populate_aliasDict() {
    try {
        const users = await pool.query('SELECT id FROM users');
        users.rows.forEach(user => {
            aliasDict[user.id] = genAlias();
        });
    } catch (err) {
        console.error('Error fetching users from database:', err);
    }

    return aliasDict;
}

(async () => {
    await populate_aliasDict();
    console.log(aliasDict);
})();

function updateUserDict(user_id, username, user_role, socketConnection) {

    if (!userDict.hasOwnProperty(Number(user_id))) {
        userDict[Number(user_id)] = {
            userID: Number(user_id),
            username: username,
            is_staff: (user_role === 'admin' || user_role === 'staff') ? true : false,
            connection: socketConnection,
            channel_id: Number(user_id),
            user_alias: genAlias()
        };
    }
    else {
        userDict[Number(user_id)].connection = socketConnection;
    };
}

async function getUsers_byChannel(channelID) {
    try {
        const result = await pool.query('SELECT * FROM channel_users WHERE channel_id = $1', [channelID]);
        return result.rows;
    } catch (error) {
        console.error('Failed to query channel users:', error);
    }
}

// INCOMING (from front)
const ChatMessage_schema = Joi.object({
    message_type: Joi.string(),
    channel_id: Joi.number().integer().required(),
    scenario_type: Joi.string().trim().required(),
    scenario_name: Joi.string().trim().required(),
    content: Joi.string().trim().required(),
    user_alias: Joi.string().trim().required(),
    scenario_id: Joi.number().integer().required()
});

// OUTGOING (to front)
class Chat_Receipt {
    constructor(sender_user_id, original_message, timestamp) {
        this.message_type = 'chat_message_receipt';
        this.data = {
            timestamp: timestamp,
            user_id: sender_user_id,
            scenario_type: original_message?.data?.scenario_type,
            content: original_message?.data?.content || "missing",
            user_alias: userDict[sender_user_id]?.user_alias,
            channel_id: original_message?.data?.channel_id,
            scenario_id: Number(original_message?.data?.scenario_id),
            scenario_name: original_message?.data?.scenario_name,
            archive_id: String(archive_id)
        }
    }
}

// create channel if it doesn't exist in db
// DEV_FIX: this needs to either return the new id or abort the req
async function checkForChannel(channelId, ownerId, ownerName) {
    const { rows } = await pool.query('SELECT id FROM channels WHERE id = $1', [channelId]);
    if (rows.length === 0) {
        await pool.query('INSERT INTO channels (owner_id, name) VALUES ($1, $2)', [ownerId, ownerName])
    }
}

async function getChatLogs(){
    const chatLogs = (await pool.query('SELECT * FROM chat_messages'))?.rows;
    return chatLogs;
}

async function echoMessage_toChannelUsers(messageReceipt, channelId) {
    const chan_users = await getUsers_byChannel(channelId);
    chan_users.forEach(user => {

        const dictUser = userDict[Number(user.user_id)];

        if (dictUser?.connection) {
            if (dictUser.connection.readyState === 1) {
                dictUser.connection.send(JSON.stringify(messageReceipt));
            } else if (dictUser.connection.readyState === 0) {
                dictUser.connection.addEventListener('open', () => {
                    dictUser.connection.send(JSON.stringify(messageReceipt));
                }, { once: true });
            }
        } else {
            console.log(`No connection available for user ${Number(user.user_id)}`);
        }
    });
}

async function echoMessage_toInstructors(messageReceipt) {

    const staffArray = Object.values(userDict).filter(user => user.is_staff);

    staffArray.forEach(staff_mbr => {
        if (staff_mbr.connection.readyState === 1) {
            staff_mbr.connection.send(JSON.stringify(messageReceipt));
        } else if (staff_mbr.connection.readyState === 0) {
            // listen for channel to open if not open
            staff_mbr.connection.addEventListener('open', () => {
                staff_mbr.connection.send(JSON.stringify(messageReceipt));
            }, { once: true });
        } else {
            console.log(`Could not send message to staff_mbr ${staff_mbr.username}: Connection not ready (state: ${staff_mbr.connection.readyState}).`);
        }
    });
}

async function echoMessage_all(messageReceipt) {

    const all_users = Object.values(userDict);
    all_users.forEach(user => {
        if (user.connection.readyState === 1) {
            user.connection.send(JSON.stringify(messageReceipt));
        } else if (user.connection.readyState === 0) {
            // listen for channel to open if not open
            user.connection.addEventListener('open', () => {
                user.connection.send(JSON.stringify(messageReceipt));
            }, { once: true });
        } else {
            console.log(`Could not send message to user ${user.username}: Connection not ready (state: ${user.connection.readyState}).`);
        }
    });
}

async function insertMessageIntoDB(senderId, messageData, timestamp, archive_id) {
    await pool.query('INSERT INTO chat_messages (user_id, channel_id, content, scenario_type, scenario_name, timestamp, scenario_id, archive_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
        senderId,
        messageData.channel_id,
        messageData.content,
        messageData.scenario_type,
        messageData.scenario_name,
        timestamp,
        messageData.scenario_id,
        archive_id
    ]);
}

async function handleChatMessage(message, socketConnection, user_id, timestamp, archive_id) {

    const { error, value } = ChatMessage_schema.validate(message.data);
    if (error) {
        socketConnection.send(JSON.stringify({ error: error.details[0].message }));
        return;
    }

    message.data = value;
    const chat_message_receipt = new Chat_Receipt(user_id, message, timestamp);

    try {
        await checkForChannel(value.channel_id, user_id, value.username);
        await echoMessage_toChannelUsers(chat_message_receipt, value.channel_id);
        await echoMessage_toInstructors(chat_message_receipt);
        await insertMessageIntoDB(user_id, value, timestamp, archive_id);
    } catch (err) {
        console.error('Error processing chat message:', err);
        socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
    }
}
async function handleAnnouncement(message, socketConnection, user_id, timestamp, archive_id) {

    const { error, value } = ChatMessage_schema.validate(message.data);
    if (error) {
        socketConnection.send(JSON.stringify({ error: error.details[0].message }));
        return;
    }

    message.data = value;
    const chat_message_receipt = new Chat_Receipt(user_id, message, timestamp);

    try {
        await checkForChannel(value.channel_id, user_id, value.username);
        await echoMessage_all(chat_message_receipt);
        await insertMessageIntoDB(user_id, value, timestamp, archive_id);
    } catch (err) {
        console.error('Error processing chat message:', err);
        socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
    }
}

///////
// server 

const chatHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for WebSocket upgrade.\n');
});

const chatSocketServer = new WebSocketServer({
    server: chatHttpServer,
    verifyClient: (info, done) => {

        // in this block, the jwt-containing-cookie is unpacked from header, 
        // and the jwt is then checked against the secret_key signature

        const cookies = cookie.parse(info.req.headers.cookie || '');
        const provided_jwt = cookies.edurange3_jwt;
        const jwt_secret_key = (process.env.JWT_SECRET_KEY);
        const verified_jwt = jwt.verify(provided_jwt, jwt_secret_key);
        const jwt_payload = verified_jwt.sub;

        // attach payload getter to temporary 'info' object
        info.req.get_id = () => jwt_payload;
        done(true);
    }
});

async function handleConnection(socketConnection, request) {
    const { username, user_role, user_id } = request.get_id();
    if (!user_id) {
        socketConnection.close(1008, 'User ID not found in validated JWT'); // Close connection with policy violation status code
        return;
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (rows.length === 0) {
        socketConnection.close(1008, 'User ID not found in database');
        return;
    }

    try {

        await updateLogsID(); // Wait for updateLogsID to complete
        updateUserDict(user_id, username, user_role, socketConnection);

    } catch (err) {
        console.error('Error getting archive_id:', err);
        socketConnection.close(1008, 'Error getting archive_id');
    }
}

///////
// main 
chatSocketServer.on('connection', async (socketConnection, request) => {

    await handleConnection(socketConnection, request);
    const { username, user_role, user_id } = request.get_id();
    const chatLogs = await getChatLogs();

    try {
        socketConnection.send(JSON.stringify(
            { 
                message_type: 'handshake', 
                ok: true, 
                chat_logs: chatLogs,
                aliasDict: aliasDict

            }));
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        socketConnection.send(JSON.stringify({ error: 'Failed to fetch chat logs' }));
    }

    socketConnection.on('message', async (message) => {
        const this_message = JSON.parse(message);
        const this_message_type = this_message.message_type;
        const this_timestamp = new Date().toISOString();
        const this_scenario_id = Number(this_message.scenario_id)

        // handle messages by message_type
        const handlers = {
            'handshake': async () => {
                console.log('handshake req received');
            },
            'keepalive': () => socketConnection.send(JSON.stringify({ message_type: 'keepalive', message: 'pong', ok: true })),
            'chat_message': async () => await handleChatMessage(this_message, socketConnection, user_id, this_timestamp, archive_id),
            'announcement': async () => await handleAnnouncement(this_message, socketConnection, user_id, this_timestamp, archive_id)
        };

        if (handlers[this_message_type]) {
            try {
                await handlers[this_message_type]();
            } catch (error) {
                console.error(`Error handling message_type ${this_message_type}:`, error);
                socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
            }
        }
    });
    socketConnection.on('close', () => {
        console.log(`User ${user_id} disconnected`);
    });
});

module.exports = { chatHttpServer, chatSocketServer };
