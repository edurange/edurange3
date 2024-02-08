import { WebSocketServer } from 'ws';
import Joi from 'joi';
import pg from 'pg';
import dotenv from 'dotenv';
import http from 'http';
import { generateInt } from '../react/pages/chat/common/chatUtils';

const slowTimeoutMS = 15000; // time between allowed messages if user 'slowed', in ms

const chatSession = {
    sessionID : generateInt(),
    studentDict : {},
    instructorDict : {}
}

const socketPort = 5008;

dotenv.config();
const { Pool } = pg;

const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for WebSocket upgrade.\n');
});

// register a user and add them to groups
function regUser(userToCheck, socketConnection) {
    if (!chatSession.studentDict.hasOwnProperty(userToCheck?.chatUserObj?.userID)) {
        chatSession.studentDict[userToCheck?.userID] = {
            userID: userToCheck?.userID,
            connection: socketConnection,
            isInstructor: userToCheck?.isInstructor,
            muted: false,  // prevent user from sending chat messages
            slowed: false, // set automatic timeout between user's chat messages
            timeout: 0 // UTC when user is next allowed to chat
        };
        console.log(`Registered new user: ${userToCheck}`);
    }
    else {console.log(`User ${userToCheck} already exists in dict. Continuing...`);};
}

function regInstructor(userToCheck, socketConnection) {
    if (!chatSession.instructorDict.hasOwnProperty(userToCheck.userID)) {
        chatSession.instructorDict[userToCheck.userID] = {
            userID: userToCheck.userID,
            connection: socketConnection,
        };
        console.log(`Registered new instructor: ${userToCheck.userID}`);
    }
    else {console.log(`Instructor ${userToCheck} already exists in dict. Continuing...`);};
}

// postgreSQL connection settings
const pool = new Pool({
    user: process.env.CHATDBUSER,
    host: process.env.CHATLOCALHOST,
    database: process.env.CHATDBNAME,
    password: process.env.CHATDBPASS,
    port: process.env.CHATDBPORT
});

const chatSchema = Joi.object({
    chatSessionObj: Joi.object().required(),
    scenarioID: Joi.number().integer().required(),
    chatUserObj: Joi.object().required(),
    timeStamp: Joi.number().integer().required(),
    messageID: Joi.string().alphanum().required(),
    secret: Joi.string().alphanum().required(),
    content: Joi.string().trim().required(),
});

const socketServer = new WebSocketServer({ server: httpServer });
httpServer.listen(socketPort, () => {
    console.log(`HTTP and WebSocket Server running on port ${socketPort}`);
});
socketServer.on('connection', (socketConnection) => {
    console.log('A user connected');

    socketConnection.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.hasOwnProperty('ping')){
            socketConnection.send(JSON.stringify({pong:"pong"}));
            return;
        }
        const messageData = data.data;
        console.log('Chat message received: ', messageData);
        
        const { error, value } = chatSchema.validate(messageData);

        if (error) {
            console.log(error.details[0].message);
            socketConnection.send(JSON.stringify({ error: error.details[0].message }));
            return;
        }
        if (value.secret !== process.env.CHATSECRET) {
            socketConnection.send(JSON.stringify({ error: 'Unauthorized access' }));
            return;
        }
        
        const thisUser = value.chatUserObj;
        console.log(value.chatSessionObj.sessionID, chatSession.sessionID);
        value.chatSessionObj.sessionID = chatSession.sessionID;
        // add user & connection info to chatSession.studentDict if not present. add user to groupsDict array(s).
        regUser(thisUser, socketConnection);

        // check 'messageData' for user role and add user to instructorArray if appropriate 
        
        if (thisUser?.isInstructor === true) {
            regInstructor(thisUser, socketConnection);
        }

        const thisDictUser = chatSession.studentDict[value?.chatUserObj?.userID];

        if (thisDictUser.muted) {
            console.log('user message ignored because muted');
            return;
        };
        
        if (thisDictUser.timeout > (new Date().getTime())) {
            console.log('user message ignored because on timeout');
            return;
        };

        const query = `INSERT INTO chats (messageID, userID, userAlias, content, scenarioID, timeStamp)
                       VALUES (
                        ${value.messageID}, 
                        ${value.userID},
                        ${value.scenarioID}, 
                        '${value.userAlias}', 
                        '${value.content}', 
                        '${value.timeStamp}')`;

        try {
            // await pool.query(query); // (UNCOMMENT TO USE DB)
            // console.log('Chat message saved to database');

            // console.log(`The user entry in dict: `, thisDictUser)
            console.log("session id is: ", chatSession.sessionID)
            console.log(`The user ${thisDictUser.isInstructor ? "IS" : "is NOT"} an instructor!`)
            console.log(`Trying to send response back to sender: USER ${thisDictUser.userID}...`);
            // console.log("looking at dict user", thisDictUser);
            thisDictUser.connection.send(JSON.stringify({ type: 'newChatMessage', data: value }));

            const instructorConnectionArr = Object.values(chatSession.instructorDict).map(entry => entry.connection);
            instructorConnectionArr.forEach(connection => {
                if (connection.readyState === 1) {
                    connection.send(JSON.stringify({ type: 'newChatMessage', data: value }));
                }

            })

            if (thisDictUser?.slowed) {
                thisDictUser.chatUserObj.timeout = new Date().getTime() + slowTimeoutMS;
            }

            const responseMsg = {
                sessionID: chatSession.sessionID,
                scenarioID: value.scenarioID,
                content: value.content,
                timeStamp: value.timeStamp,
                userAlias: value.chatUserObj.userAlias,
                messageID: value.messageID
            }

        } catch (err) {
            console.error('Database error:', err);
            socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
        }
    });

    // disconnection and cleanup
    socketConnection.on('close', () => {    
        console.log('User disconnected');
    });

});

// strategy:  
// - create dict for clients keyed by their uniqueID (which they offer when they connect),
//   this will ensure we maintain a client set, with no duplicates.
//   (the uniqueIDs will ideally be supplied by way of JWT, which has an identity and role value included)
// - when a client connects, check their uniqueID against dict; if it doesn't exist, make it
// - when chat message is received, it is added to a log that instructors can optionally see
// - instructors can send messages 'back' to the appropriate clients, via socket.