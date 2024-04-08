const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const Joi = require('joi');
const {generateInt} = require('../utils/chat_utils');

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
            connection: socketConnection,
            chatChannel_id : user_id
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

// DEV_FIX replace w/ new schema
const chatSchema = Joi.object({
    scenarioID: Joi.number().integer(),
    content: Joi.string().trim().required(),
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

// const interval = setInterval(function ping() {
    
//     chatSocketServer.clients.forEach(function each(ws) {

//       if (ws.isAlive === false) return ws.terminate();
  
//       ws.isAlive = false;
//       ws.ping();

//     });
//   }, 5_000);



chatSocketServer.on('connection', (socketConnection, request) => {


    const {username, user_role, user_id} = request.get_id();

    if (!username) {return {error: 'username not found in validated jwt'}}
    
    // DEV_FIX check here that user exists in db


    // DEV_ONLY
    console.log(
        `#  User connected to chat server w/ jwt id: `,
        `\n#    username: ${username}`,
        `\n#    user_role: ${user_role}`,
        `\n#    user_id: ${user_id}`);

    socketConnection.on('message', async (message) => {
        const data = JSON.parse(message);
        // console.log ('Rcvd socket connection of type: ', data?.type);

        if (data?.type === 'handshake'){
            socketConnection.send(JSON.stringify({
                type:'handshake',
                ok: true,
            }));
            return;
        }
        if (data?.type === 'keepalive'){
            socketConnection.send(JSON.stringify({
                type:'keepalive',
                message: 'pong',
                ok: true
            }));
            return;
        }
        if (data?.type === 'get_chat_history'){

            // get user's chat history for past 24 hrs

            const arrayOfChatObjs = 'getChatHistoryFromDb' // filter by date

            const chatHistoryArray = [arrayOfChatObjs] ?? [];

            chatSession.studentDict.chat_history = chatHistoryArray

            socketConnection.send(JSON.stringify({
                type:'chat_history',
                message: chatHistoryArray,
                ok: true
            }));
            return;
        }

        
    // DEV_FIX get chat message log for last 24 hrs from db

    // 

        if (data?.type === 'chatMessage'){

            console.log ('printing data.type: ', data?.type);
            console.log ('printing data.message: ', data?.message);
            console.log('')
            
                    // DEV_ONLY
            const { error, value } = chatSchema.validate(data?.message);
            
            if (error) {
                console.log(error.details[0].message);
                socketConnection.send(JSON.stringify({ error: error.details[0].message }));
                return;
            }

            console.log (value);
            
            // add user & connection info to chatSession.studentDict if not present. add user to groupsDict array(s).
            regUser(user_id, username, user_role, socketConnection);
            
            // check 'messageData' for user role and add user to instructorArray if appropriate 
            if (user_role === "instructor" || user_role === "admin") {
                regInstructor(user_id, username, user_role, socketConnection);
            }
            const thisDictUser =  chatSession?.studentDict[user_id];
 
                
                try {
                    
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
                            scenarioID: value.scenarioID ?? 'none',
                            type: 'chatReceipt',
                            content: value.content,
                            sender_id: user_id,
                            ok: true
                        };
                        console.log ('thisDictUser connection readyState: ', thisDictUser.connection.readyState)
                        console.log ('socketConnection info: ', socketConnection.readyState)
                        thisDictUser.connection.send(JSON.stringify(responseMsg));
                    }
                    
                    
                    
                } catch (err) {
                    console.error('Database error:', err);
                    socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
                }
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

// postgreSQL connection settings
// const pool = new Pool({
//     host: 'localhost',
//     port: process.env.NODE_DB_PORT,
//     database: process.env.NODE_DB_NAME,
//     user: process.env.NODE_DB_USERNAME,
//     password: process.env.NODE_DB_PASSWORD,
// });

                    // await pool.query(query); // (UNCOMMENT TO USE DB)
                    // console.log('Chat message saved to database');
           
            // DEV_FIX (db is disabled)
            // const query = `INSERT INTO chats (messageID, userID, userAlias, content, scenarioID, timeStamp)
            //                VALUES (
                //                 ${value.messageID}, 
                //                 ${value.userID},
                //                 ${value.scenarioID}, 
                //                 '${value.userAlias}', (remove from db)
                //                 '${value.content}', 
                //                 '${value.timeStamp}')`;