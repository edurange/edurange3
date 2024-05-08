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


// root project env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const userDict = {}

// register a user and add them to groups
function updateUserDict(user_id, username, user_role, socketConnection) {

    if (!userDict.hasOwnProperty(Number(user_id))) {
        userDict[Number(user_id)] = {
            userID: Number(user_id),
            username: username,
            is_instructor: (user_role === 'admin' || user_role === 'instructor') ? true : false,
            connection: socketConnection,
            chatChannel_id: Number(user_id)
        };
        console.log(`Added user ${username} with role of ${(user_role === 'admin' || user_role === 'instructor') ? "instructor" : "student"} to chat userDict.`);
    }
    else {
        userDict[Number(user_id)].connection = socketConnection;
        console.log(`User ${username} already exists in dict. Refreshing connection info and continuing...`);
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

    type: Joi.string(),

    channel: Joi.number().integer().required(),
    scenario_type: Joi.string().trim().required(),
    content: Joi.string().trim().required(),
    user_alias: Joi.string().trim().required(),
});

// OUTGOING (to front)
class Chat_Receipt {
    constructor(sender_user_id, original_message, timestamp) {
        this.type = 'chat_message_receipt';
        this.data = {
            timestamp: timestamp,
            sender: sender_user_id,
            scenario_type: original_message?.data?.scenario_type,
            content: original_message?.data?.content || "missing",
            user_alias: original_message?.data?.user_alias,
            channel: original_message?.data?.channel
        }
    }
}

// create channel if it doesn't exist in db
async function checkForChannel(channelId, ownerId, ownerName) {
    const { rows } = await pool.query('SELECT id FROM channels WHERE id = $1', [channelId]);
    if (rows.length === 0) {
        await pool.query('INSERT INTO channels (id, owner_id, name) VALUES ($1, $2, $3)', [channelId, ownerId, ownerName]);
    }
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

    const instructors = Object.values(userDict).filter(user => user.is_instructor);

    instructors.forEach(instructor => {
        if (instructor.connection.readyState === 1) {
            instructor.connection.send(JSON.stringify(messageReceipt));
            console.log(`Message sent to instructor ${instructor.username}.`);
        } else if (instructor.connection.readyState === 0) {
            // listen for channel to open if not open
            instructor.connection.addEventListener('open', () => {
                instructor.connection.send(JSON.stringify(messageReceipt));
                console.log(`Message sent to instructor ${instructor.username} after connection opened.`);
            }, { once: true });
        } else {
            console.log(`Could not send message to instructor ${instructor.username}: Connection not ready (state: ${instructor.connection.readyState}).`);
        }
    });
}

async function echoMessage_all(messageReceipt) {

    const all_users = Object.values(userDict);
    all_users.forEach(user => {
        if (user.connection.readyState === 1) {
            user.connection.send(JSON.stringify(messageReceipt));
            console.log(`Message sent to user ${user.username}.`);
        } else if (user.connection.readyState === 0) {
            // listen for channel to open if not open
            user.connection.addEventListener('open', () => {
                user.connection.send(JSON.stringify(messageReceipt));
                console.log(`Message sent to user ${user.username} after connection opened.`);
            }, { once: true });
        } else {
            console.log(`Could not send message to user ${user.username}: Connection not ready (state: ${user.connection.readyState}).`);
        }
    });
}

async function insertMessageIntoDB(senderId, messageData, timestamp) {
    await pool.query('INSERT INTO chat_messages (sender, channel, content, scenario_type, timestamp) VALUES ($1, $2, $3, $4, $5)', [
        senderId,
        messageData.channel,
        messageData.content,
        messageData.scenario_type,
        timestamp
    ]);
}

async function handleChatMessage(message, socketConnection, user_id, timestamp) {
    const { error, value } = ChatMessage_schema.validate(message.data);
    if (error) {
        socketConnection.send(JSON.stringify({ error: error.details[0].message }));
        return;
    }

    message.data = value;
    const chat_message_receipt = new Chat_Receipt(user_id, message, timestamp);

    try {
        await checkForChannel(value.channel, user_id, value.username);
        await echoMessage_toChannelUsers(chat_message_receipt, value.channel);
        await echoMessage_toInstructors(chat_message_receipt);
        await insertMessageIntoDB(user_id, value, timestamp);
    } catch (err) {
        console.error('Error processing chat message:', err);
        socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
    }
}
async function handleAnnouncement(message, socketConnection, user_id, timestamp) {

    console.log('Handling announcement from instructor with ID: ', user_id)
    const { error, value } = ChatMessage_schema.validate(message.data);
    if (error) {
        socketConnection.send(JSON.stringify({ error: error.details[0].message }));
        return;
    }

    message.data = value;
    const chat_message_receipt = new Chat_Receipt(user_id, message, timestamp);

    try {
        await checkForChannel(value.channel, user_id, value.username);
        await echoMessage_all(chat_message_receipt);
        await insertMessageIntoDB(user_id, value, timestamp);
    } catch (err) {
        console.error('Error processing chat message:', err);
        socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
    }
}


///////
// main 

const pool = new Pool({
    user: process.env.CHATDB_USERNAME,
    host: process.env.CHATDB_LOCALHOST,
    database: process.env.CHATDB_DATABASENAME,
    password: process.env.CHATDB_PASSWORD,
    port: process.env.CHATDB_PORT
});

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



chatSocketServer.on('connection', async (socketConnection, request) => {
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

    console.log(
        `User connected to chat server w/ jwt id: ${user_id}`,
        `username: ${username}`,
        `user_role: ${user_role}`
    );

    updateUserDict(user_id, username, user_role, socketConnection);

    socketConnection.on('message', async (message) => {
        const this_message = JSON.parse(message);
        const this_type = this_message.type;
        const this_timestamp = new Date().toISOString();

        console.log(`got msg with type ${this_type}: `, this_message);

        // handle messages by type
        const handlers = {
            'handshake': () => socketConnection.send(JSON.stringify({ type: 'handshake', ok: true })),
            'keepalive': () => socketConnection.send(JSON.stringify({ type: 'keepalive', message: 'pong', ok: true })),
            'chat_message': async () => await handleChatMessage(this_message, socketConnection, user_id, this_timestamp),
            'announcement': async () => await handleAnnouncement(this_message, socketConnection, user_id, this_timestamp)
        };

        if (handlers[this_type]) {
            try {
                await handlers[this_type]();
            } catch (error) {
                console.error(`Error handling message type ${this_type}:`, error);
                socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
            }
        }
    });
    socketConnection.on('close', () => {
        console.log(`User ${user_id} disconnected`);
    });
});

module.exports = { chatHttpServer, chatSocketServer };