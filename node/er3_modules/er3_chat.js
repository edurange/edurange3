const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const Joi = require('joi');
const {generateAlias, generateInt} = require('../utils/chat_utils');

const { Pool } = pg;
// root project env
dotenv.config({ path: path.join(__dirname, '..','..', 'py_flask', '.env') });

const chatSession = {
    sessionID : generateInt(),
    studentDict : {},
    instructorDict : {}
}

const chatHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for WebSocket upgrade.\n');
});

// register a user and add them to groups
function regUser(user_id, username, user_role, socketConnection) {
    if (!chatSession.studentDict.hasOwnProperty(user_id)) {
        chatSession.studentDict[user_id] = {
            userID: user_id,
            username: username,
            user_role: user_role,
            muted: false,  // silences notifications from user
            slowed: false, // set automatic timeout until next notif will show
            timeout: 0,
            alias: generateAlias(),
            connection: socketConnection,
        };
        console.log(`Registered new user: ${username}`);
    }
    else {
        chatSession.studentDict[user_id].connection = socketConnection;
        console.log(`User ${username} already exists in dict. Refreshing connection info and continuing...`);};
}

function regInstructor(user_id, username, user_role, socketConnection) {
    if (!chatSession.instructorDict.hasOwnProperty(user_id)) {
        chatSession.instructorDict[user_id] = {
            userID: user_id,
            user_role: user_role,
            username: username,
            connection: socketConnection,
        };
        console.log(`Registered new instructor: ${user_id}`);
    }
    else {
        chatSession.instructorDict[user_id].connection = socketConnection;
        console.log(`Instructor ${userToCheck} already exists in dict. Continuing...`);};
}

// postgreSQL connection settings
const pool = new Pool({
    host: 'localhost',
    port: process.env.NODE_DB_PORT,
    database: process.env.NODE_DB_NAME,
    user: process.env.NODE_DB_USERNAME,
    password: process.env.NODE_DB_PASSWORD,
});

// DEV_FIX replace w/ new schema
const chatSchema = Joi.object({
    scenarioID: Joi.number().integer().required(),
    content: Joi.string().trim().required(),
    sender_id: Joi.number().integer()
});


const chatSocketServer = new WebSocketServer({
    server: chatHttpServer,
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

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {

      if (ws.isAlive === false) return ws.terminate();
  
      ws.isAlive = false;
      ws.ping();

    });
  }, 5_000);



chatSocketServer.on('connection', (socketConnection, request) => {


    const {username, user_role, user_id} = request.get_id();

    if (!username) {return {error: 'username not found in validated jwt'}}
    
    // DEV_ONLY
    console.log(
        `#  User connected to chat server w/ jwt id: `,
        `\n#    username: ${username}`,
        `\n#    user_role: ${user_role}`,
        `\n#    user_id: ${user_id}`);

    socketConnection.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.hasOwnProperty('ping')){
            socketConnection.send(JSON.stringify({pong:"pong"}));
            return;
        }
        const messageData = data.data;

        // DEV_ONLY
        console.log(
            `#  Chat message received:`,
            `\n#    scenario_id: ${messageData?.scenarioID}`,
            `\n#    username: ${username}`,
            `\n#    content: ${messageData?.content}`);
        
        const { error, value } = chatSchema.validate(messageData);

        if (error) {
            console.log(error.details[0].message);
            socketConnection.send(JSON.stringify({ error: error.details[0].message }));
            return;
        }

        // add user & connection info to chatSession.studentDict if not present. add user to groupsDict array(s).
        regUser(user_id, username, user_role, socketConnection);

        // check 'messageData' for user role and add user to instructorArray if appropriate 
        if (user_role === "instructor" || user_role === "admin") {
            regInstructor(user_id, username, user_role, socketConnection);
        }
        const thisDictUser =  chatSession?.studentDict[user_id];

        // DEV_FIX (db is disabled)
        // const query = `INSERT INTO chats (messageID, userID, userAlias, content, scenarioID, timeStamp)
        //                VALUES (
        //                 ${value.messageID}, 
        //                 ${value.userID},
        //                 ${value.scenarioID}, 
        //                 '${value.userAlias}', (remove from db)
        //                 '${value.content}', 
        //                 '${value.timeStamp}')`;

        try {
            // await pool.query(query); // (UNCOMMENT TO USE DB)
            // console.log('Chat message saved to database');

            console.log(`The user ${thisDictUser.isInstructor ? "IS" : "is NOT"} an instructor!`)

            const instructorConnectionArr = Object.values(chatSession.instructorDict).map(entry => entry.connection);

            // instr
            instructorConnectionArr.forEach(connection => {
                if (connection.readyState === 1) {
                    connection.send(JSON.stringify({ type: 'newChatMessage', data: value }));
                }

            })

            // student
            if (!chatSession?.instructorDict.hasOwnProperty(user_id)) {
                const responseMsg = {
                    scenarioID: value.scenarioID,
                    content: value.content,
                    sender_id: user_id
                };
                console.log ('thisDictUser connection info: ', thisDictUser.connection.readyState)
                console.log ('socketConnection info: ', socketConnection.readyState)
                thisDictUser.connection.send(JSON.stringify({ type: 'newChatMessage', data: responseMsg }));
            }
            


        } catch (err) {
            console.error('Database error:', err);
            socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
        }
    });

    // disconnection and cleanup
    socketConnection.on('close', () => {
        // const thisDictUser =  chatSession?.studentDict[user_id];
        // thisDictUser.connection = null;
        console.log('User disconnected');
    });

});
module.exports = { chatHttpServer, chatSocketServer };
