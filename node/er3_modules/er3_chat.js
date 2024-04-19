

// types of chat socket messages (arrow indicates origin -> destination; <-> means type used two-way):
//   
// - handshake: initialize socket connection and send history and other init info (frontend -> backend -> frontend)
// - keepalive: ping/pong and other messages only for keeping socket open (frontend <-> backend)

// - student_message: message 'Q' sent FROM STUDENT 'X' FOR CHANNEL 'Y' (frontend -> backend)
// - student_message_receipt: message 'A' sent TO ALL STUDENTS IN CHANNEL 'Y' (backend -> frontend)

// - instructor_message: message 'A' sent FROM INSTRUCTOR 'Z' FOR CHANNEL 'Y' as a response to student_message 'Q' (frontend -> backend)
// - instructor_message_receipt: instructor response message 'A' sent TO ALL USERS IN CHANNEL 'Y' (backend -> frontend)

// TODO:
// - let instr change the chat channel of any user

// thoughts:
//  - could be useful to eventually have 'threads' within the channels which are effectively a sub-channel
//    which would be a log of messages between users in response to a specific message

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
const {generateInt} = require('../utils/chat_utils');

const { Pool } = pg;
// root project env
dotenv.config({ path: path.join(__dirname, '..','..', '.env') });

const chatSession = {
    sessionID : generateInt(),
    userDict : {},
}

const chatHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server for WebSocket upgrade.\n');
});

// register a user and add them to groups
function regUser(user_id, username, user_role, socketConnection) {
    console.log ('reguser called for: ', user_id, username, user_role)
    if (!chatSession.userDict.hasOwnProperty(user_id)) {
        chatSession.userDict[user_id] = {
            userID: user_id,
            username: username,
            is_instructor: (user_role === 'admin' || user_role === 'instructor') ? true : false,
            muted: false,  // silences notifications from user
            slowed: false, // set automatic timeout until next notif will show
            timeout: 0,
            connection: socketConnection,
            chatChannel_id : user_id
        };
        console.log(`Registered new user: ${username}`);
    }
    else {
        chatSession.userDict[user_id].connection = socketConnection;
        console.log(`User ${username} already exists in dict. Refreshing connection info and continuing...`);};
}

const StuMessage_schema = Joi.object({

    type: Joi.string(),

    timestamp: Joi.number().integer(),
    
    channel: Joi.number().integer().required(),
    scenario_id: Joi.number().integer(),
    message: Joi.string().trim().required(),
    user_alias: Joi.string().trim().required(),
});

const InstrMessage_schema = Joi.object({

    type: Joi.string(),

    timestamp: Joi.number().integer(),

    channel: Joi.number().integer().required(),
    message: Joi.string().trim().required(),
    instructor_id: Joi.number().integer().required(),

});


class StuMsg_Receipt {
    constructor(user_id, original_message) {
        this.type = 'student_message_receipt';
        this.timestamp = original_message.timestamp;
        this.data =  {
            user_id : user_id,
            scenario_id : original_message?.data?.scenario_id,
            message : original_message?.data?.message || "missing",
            user_alias : original_message?.data?.user_alias,
            channel: original_message?.data?.channel
        }
    }
}
class InstrMsg_Receipt {
    constructor(instructor_user_id, timestamp, data) {     
        this.type = 'instructor_message_receipt';
        this.timestamp = timestamp;
        this.data = {
            message : data.message || null,
            timestamp : data.timestamp,
            instructor_id : instructor_user_id,
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

// DEV_FIX comment this
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


chatSocketServer.on('connection', async (socketConnection, request) => {


    const {username, user_role, user_id} = request.get_id();

    if (!username) {return {error: 'username not found in validated jwt'}}
    
    // DEV_FIX check here that user exists in db
    const existing_user = await pool.query(`SELECT FROM users WHERE id = ${user_id}`);

    if (!existing_user) {return {error: 'user_id not found in db'}}


    // DEV_ONLY
    console.log(
        `#  User connected to chat server w/ jwt id: `,
        `\n#    username: ${username}`,
        `\n#    user_role: ${user_role}`,
        `\n#    user_id: ${user_id}`);

    regUser(user_id, username, user_role, socketConnection);
    

    socketConnection.on('message', async (message) => {

        const this_message = JSON.parse(message)
        const this_data = this_message.data;
        const this_timestamp = this_message.timestamp;
        const this_type = this_message.type;

        console.log ('RECEIVED MESSAGE: ', this_message)
        
        if (this_type === 'handshake'){
            socketConnection.send(JSON.stringify({
                type:'handshake',
                ok: true,
            }));
            return;
        }
        if (this_type === 'keepalive'){
            socketConnection.send(JSON.stringify({
                type:'keepalive',
                message: 'pong',
                ok: true
            }));
            return;
        }

        if (this_type === 'get_student_history'){
            
            const thisStudentHistory = await pool.query('SELECT FROM messages WHERE channel = $1', [this_data.channel]);
            // DEV_FIX this whole area


            // DEV_FIX user parameterized query with pool

            // DEV_FIX look into how input is processed (e.g. content, 'OR 1=1) and make sure it takes care of 'raw' content input


            
            chatSession.userDict.chat_history = chatHistoryArray
            
            socketConnection.send(JSON.stringify({
                type:'chat_history',
                message: chatHistoryArray,
                ok: true
            }));
            return;
        }
        
        if (this_type === 'student_message'){

            const { error, value } = StuMessage_schema.validate(this_message.data);

            this_message.data = value;
            
            if (error) {
                console.log(error.details[0].message);
                socketConnection.send(JSON.stringify({ error: error.details[0].message }));
                return;
            }

            const thisDictUser =  chatSession?.userDict[user_id];
            
            try {

                const instrArr = Object.values(chatSession.userDict).filter((entry) => entry.is_instructor === true);
                
                const student_message_receipt = new StuMsg_Receipt(user_id, this_message)
                
                console.log(student_message_receipt);
                    
                instrArr.forEach(instructor => {
                    console.log("READYSTATE: ",instructor.connection.readyState)
                    if (instructor.connection.readyState === 1) {

                        console.log(`trying to send message from ${thisDictUser.username} to instructor ${instructor.username}`)
                        instructor.connection.send(JSON.stringify(student_message_receipt));
                    }

                    // DEV_FIX handle bad ready state

                })

                // DB insert

                const res = await pool.query('SELECT id FROM channels WHERE id = $1', [user_id]);

                if (res.rows.length === 0) {
                  // channel does not exist, so create it
                  await pool.query('INSERT INTO channels (id, owner_id) VALUES ($1, $2)', [user_id, user_id]);
                }

                const query2 = `INSERT INTO messages (sender, channel, content, scenario_id, timestamp)
                VALUES (
                    ${user_id},
                    ${user_id},
                    '${value.message}', 
                    '${value.scenario_id}', 
                    '${this_timestamp}')`;
                await pool.query(query2); // run insert query

                thisDictUser.connection.send(JSON.stringify(student_message_receipt));
                    
                    
                } catch (err) {
                    console.error('some stu error:', err);
                    socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
                }
            }
        

        if (this_type === 'instructor_message'){

            const this_instructor_id = user_id

            this_message.instructor_id = this_instructor_id;

            const tempObj = {
                type: 'instructor_message_receipt',
                channel: 1,
                message: 'test message string',
                instructor_id: 1,
            }

            const { error, value } = InstrMessage_schema.validate(tempObj);
            
            if (error) {
                console.log(error.details[0].message);
                socketConnection.send(JSON.stringify({ error: error.details[0].message }));
                return;
            }

            const thisDictUser =  chatSession?.userDict[user_id];
            
            try {

                const instrArr = Object.values(chatSession.userDict).filter((entry) => entry.is_instructor === true);
                
                
                const instrMsg_receipt = new InstrMsg_Receipt(user_id, this_timestamp, value)
                console.log('instrMsg_receipt: ',instrMsg_receipt);
                
                instrArr.forEach(instructor => {
                    console.log("READYSTATE: ",instructor.connection.readyState)
                    if (instructor.connection.readyState === 1) {

                        
                        console.log(`trying to send instructor msg from ${thisDictUser.username} to instructor ${instructor.username}`)
                        instructor.connection.send(JSON.stringify(instrMsg_receipt));
                    }

                    // DEV_FIX handle bad ready state

                })

                // DB insert
                const res = await pool.query('SELECT id FROM channels WHERE id = $1', [user_id]); // DEV_FIX change to user's current channel, not user_id

                if (res.rows.length === 0) {
                  // Channel does not exist, so create it
                  await pool.query('INSERT INTO channels (id, owner_id) VALUES ($1, $2)', [user_id, user_id]);
                }

                console.log ('sender: ', user_id);
                console.log ('value.message ', value.message )
                console.log ('value.scenario_id ', value.scenario_id ?? 112 )
                console.log ('this_timestamp ', this_timestamp )

                const query2 = `INSERT INTO messages (sender, channel, content, scenario_id, timestamp)
                VALUES (
                    ${user_id},
                    ${user_id},
                    '${value.message}', 
                    '${value.scenario_id ?? 112}',
                    '${this_timestamp}'
                )`;

                await pool.query(query2); // run insert query

                } catch (err) {
                    console.error('some instr error:', err);
                    socketConnection.send(JSON.stringify({ error: 'Internal Server Error' }));
                }
            }
    });

    socketConnection.on('close', () => {
        console.log('User disconnected');
    });

});
module.exports = { chatHttpServer, chatSocketServer };