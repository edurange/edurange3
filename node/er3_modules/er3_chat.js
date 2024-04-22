

// types of chat socket chat_messages (arrow indicates origin -> destination; <-> means type used two-way):
//   
// - handshake: initialize socket connection and send history and other init info (frontend -> backend -> frontend)
// - keepalive: ping/pong and other chat_messages only for keeping socket open (frontend <-> backend)

// - student_message: message 'Q' sent FROM STUDENT 'X' FOR CHANNEL 'Y' (frontend -> backend)
// - chat_message_receipt: message 'A' sent TO ALL STUDENTS IN CHANNEL 'Y' (backend -> frontend)

// - instructor_message: message 'A' sent FROM INSTRUCTOR 'Z' FOR CHANNEL 'Y' as a response to student_message 'Q' (frontend -> backend)
// - instructor_message_receipt: instructor response message 'A' sent TO ALL USERS IN CHANNEL 'Y' (backend -> frontend)

// TODO:
// - let instr change the chat channel of any user

// thoughts:
//  - could be useful to eventually have 'threads' within the channels which are effectively a sub-channel
//    which would be a log of chat_messages between users in response to a specific message

// STATUS:  WORKING MESSAGES FROM USER TO BACKEND TO  INSTR
//          WORKING MESSAGES FROM INSTR TO BACKEND TO __ (NEED TARGET)


// NEXT TODO: INSTR MESSAGES NEED TO BE IN CONTEXT OF CHANNEL
//            GET CHANNEL FROM CONTEXT OF EITHER SPECIFIC MSG OR USER RECORD


const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const Joi = require('joi');
const { generateInt } = require('../utils/chat_utils');

const { Pool } = pg;
// root project env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const chatSession = {
    sessionID: generateInt(),
    userDict: {},
}

const chatHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for WebSocket upgrade.\n');
});

// register a user and add them to groups
function registerUser(user_id, username, user_role, socketConnection) {

    if (!chatSession.userDict.hasOwnProperty(user_id)) {
        chatSession.userDict[user_id] = {
            userID: user_id,
            username: username,
            is_instructor: (user_role === 'admin' || user_role === 'instructor') ? true : false,
            connection: socketConnection,
            chatChannel_id: user_id
        };
        console.log(`Registered new user: ${username}`);
        console.log(`user is instructor?: ${(user_role === 'admin' || user_role === 'instructor') ? true : false}`);
    }
    else {
        chatSession.userDict[user_id].connection = socketConnection;
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

async function getChatLog_byUser(userID) {

    try {
        const query = `
            SELECT m.* 
            FROM chat_messages m
            JOIN channel_users cu ON m.channel = cu.channel_id
            WHERE cu.user_id = $1
        `;

        const result = await pool.query(query, [userID]);

        if (result.rows.length > 0) {
            console.log("Chat logs:", result.rows);
            return result.rows;
        } else {
            console.log("No chat logs found for user", userID);
            return [];
        }
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        throw error; // Optional: re-throw the error if you want to handle it further up
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
    constructor(user_id, original_message, timestamp) {
        this.type = 'chat_message_receipt';
        this.data = {
            timestamp : timestamp,
            user_id: user_id,
            scenario_type: original_message?.data?.scenario_type,
            content: original_message?.data?.content || "missing",
            user_alias: original_message?.data?.user_alias,
            channel: original_message?.data?.channel
        }
    }
}

const pool = new Pool({
    user: process.env.CHATDB_USERNAME,
    host: process.env.CHATDB_LOCALHOST,
    database: process.env.CHATDB_DATABASENAME,
    password: process.env.CHATDB_PASSWORD,
    port: process.env.CHATDB_PORT
});

// this is expecting the user's request header to contain a jwt cookie
// the cookie should be assigned when they log in via flask
// in this block, the cookie is then unpacked for the jwt, 
// and the jwt is then checked against the secret_key signature
const chatSocketServer = new WebSocketServer({
    server: chatHttpServer,
    verifyClient: (info, done) => {

        // parse and validate jwt
        const cookies = cookie.parse(info.req.headers.cookie || '');
        const provided_jwt = cookies.edurange3_jwt;
        const jwt_secret_key = (process.env.JWT_SECRET_KEY);
        const verified_jwt = jwt.verify(provided_jwt, jwt_secret_key);

        // get payload from expected jwt payload property .sub
        const jwt_payload = verified_jwt.sub;

        // attaching closure method to temporary 'info' object 
        info.req.get_id = () => jwt_payload;
        // this allows retrieval of jwt payload during connection lifecycle
        // e.g. below: const {username, user_role, user_id} = request.get_id();
        // works bc scope of verifyClient is retained

        done(true);
    }
});


chatSocketServer.on('connection', async (socketConnection, request) => {


    const { username, user_role, user_id } = request.get_id();

    if (!user_id) { return { error: 'user_id not found in validated jwt' } }

    const existing_user = await pool.query(`SELECT FROM users WHERE id = $1`, [user_id]);
    if (!existing_user) { return { error: 'user_id not found in db' } }

    // DEV_ONLY
    console.log(
        `#  User connected to chat server w/ jwt id: `,
        `\n#    username: ${username}`,
        `\n#    user_role: ${user_role}`,
        `\n#    user_id: ${user_id}`);

    registerUser(user_id, username, user_role, socketConnection);


    socketConnection.on('message', async (message) => {

        const this_message = JSON.parse(message)
        const this_data = this_message.data;
        const this_type = this_message.type;
        const this_timestamp = new Date().toISOString();

        if (this_type === 'handshake') {
            socketConnection.send(JSON.stringify({
                type: 'handshake',
                ok: true,
            }));
            return;
        }
        if (this_type === 'keepalive') {
            socketConnection.send(JSON.stringify({
                type: 'keepalive',
                message: 'pong',
                ok: true
            }));
            return;
        }

        if (this_type === 'get_student_history') {

            const historyToGet = message?.data?.history_to_get;
            if (!historyToGet) { return; }
            const thisStudentHistory = await getChatLog_byUser(historyToGet)

            socketConnection.send(JSON.stringify({
                type: 'chat_history',
                timestamp: this_timestamp,
                data: thisStudentHistory,
                ok: true
            }));
            return;
        }

        if (this_type === 'announcement') {

            if (user_role === 'admin' || user_role === 'instructor') {
                // send to every user in dict
                console.log(`trying to send announcement from instructor ${thisDictUser.username} to all users`)
                chatSession.userDict.forEach(user => {
                    if (user.connection.readyState === 1) {

                        user.connection.send(JSON.stringify(chat_message_receipt));
                    }
                    // DEV_FIX handle bad ready state
                })
            }
        }

        if (this_type === 'chat_message') {

            const { error, value } = ChatMessage_schema.validate(this_message.data);

            if (error) {
                console.log(error.details[0].message);
                socketConnection.send(JSON.stringify({ error: error.details[0].message }));
                return;
            }

            this_message.data = value;
            const this_channel = value?.channel;
            const thisDictUser = chatSession?.userDict[user_id];

            try {

                const chat_message_receipt = new Chat_Receipt(user_id, this_message, this_timestamp)

                // create channel in db if it doesn't exist
                const matching_channels = await pool.query('SELECT id FROM channels WHERE id = $1', [this_channel]);
                if (matching_channels.rows.length === 0) {
                    await pool.query('INSERT INTO channels (id, owner_id, name) VALUES ($1, $2, $3)', [this_channel, user_id, thisDictUser?.username]);
                }

                // SEND TO INSTRUCTORS

                console.log('sending to instrs')
                const instrArr = Object.values(chatSession.userDict).filter((entry) => entry.is_instructor === true);
                
                console.log('instrArr len: ',instrArr.length)
                
                instrArr.forEach(instructor => {
                    console.log("READYSTATE: ", instructor.connection.readyState)
                    if (instructor.connection.readyState === 1) {

                        console.log(`trying to send message from ${thisDictUser.username} to instructor ${instructor.username}`)
                        instructor.connection.send(JSON.stringify(chat_message_receipt));
                    }
                    // DEV_FIX handle bad ready state
                })

                // send to all channel_users
                console.log('this_channel: ', this_channel);
                const chan_users = await getUsers_byChannel(this_channel);
                console.log('chan_users: ', chan_users);
                chan_users.forEach(user => {

                    const dictUser = chatSession.userDict[user.user_id];
                    console.log("READYSTATE: ", dictUser.connection.readyState)
                    if (dictUser.connection.readyState === 1) {

                        console.log(`trying to send message from ${thisDictUser.username} to user ${dictUser.username}`)
                        dictUser.connection.send(JSON.stringify(chat_message_receipt));
                    }
                    // DEV_FIX handle bad ready state
                })

                // insert message into db
                await pool.query(`INSERT INTO chat_messages (sender, channel, content, scenario_type, timestamp) VALUES ($1, $2, $3, $4, $5)
                `, [
                    user_id,
                    value.channel,
                    value.content,
                    value.scenario_type,
                    this_timestamp // now create timestamp on db insert rather than send w/ frontend request
                ]);

            } catch (err) {
                console.error('some stu error:', err);
                socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
            }
        }
    });

    socketConnection.on('close', () => {
        console.log('User disconnected');
    });

});
module.exports = { chatHttpServer, chatSocketServer };