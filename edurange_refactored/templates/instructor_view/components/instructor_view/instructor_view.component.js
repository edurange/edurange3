/* This is the entry point for the instructor view and 
 * the super container for the other components.
 */ 
//import { io } from 'socket.io-client';
import Student from "../student/student.component";
import "./instructor_view.css";
import ChatWindow from "../chat_window/chat_window.component";
import StudentList from "../student_list/student_list.component";
import usernameList from '../../../../../../edurange-flask/data/tmp/chatnames.json'

import {createRoot} from 'react-dom/client';
import React, { useState, useEffect } from 'react';

import { io } from 'socket.io-client';
const socket = io(`${window.location.hostname}:3001`, {autoConnect:false});
 
// catch-all listener for development phase
socket.onAny((event, ...args) => {
 console.log(event, args);
});
 
var allStudents = [];
var global_msg_list=[];
var newest_msg = "";

function InstructorView() {
    const [input, setInput] = useState("chat");
    const [displayMessages, setDisplayMessages] = useState(null);
    const [currAlert, setCurrAlert] = useState();
    const [inputData, setInputData] = useState("");
    const [selectedStudent, setSelectedStudent] = useState();
    const [newMessage, setNewMessage] = useState(null);
    const [alert, setAlert] = useState();
    const usernames = usernameList;
   
 
 useEffect(() => {
  const uid = "000";
  socket.auth = { uid }
  socket.connect();

  socket.on('connect', () => {
    console.log("instructor has connected.");
  });

  socket.emit("instructor connected");

  socket.on("alert", (_alert) => {
      //console.log(`alert : ${JSON.stringify(_alert)}`);
      _alert["id"] = usernames[_alert["uid"] - 1]; // user1 has a uid of 2.
      _alert["time"] = new Date().toISOString()
        .replace('T', ' ')
        .replace('Z', ''); // user1 has a uid of 2.
      allStudents.push(_alert);
      setAlert(_alert);
      //onRecvAlert(_alert);
  });

  socket.on("new message", ({messageContents, _to, _from, room}) => {
      socket.emit("request msg_list", {messageContents, _to, _from, room});
  });

  socket.on("msg_list update", ({msg_list, room}) => {
    for(let i in allStudents) {
        if (allStudents[i]["uid"] == room) {
          allStudents[i]["messages"] = msg_list;
        }
      }
      global_msg_list = msg_list;
      setNewMessage(msg_list[msg_list.length - 1]);
      newest_msg = global_msg_list[global_msg_list.length - 1];
  });

  const findStudent = (selStud) => {
      for(let i in allStudents) {
          if (allStudents[i][id] == selStud) {
              return allStudents[i];
         }
      }
      return null;
  };

  const listener = event => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
          console.log("enter pressed...");
        event.preventDefault();
       
        if(inputData && selectedStudent) {
          socket.emit("send message", {messageContents: inputData, to: selectedStudent["uid"], from: "000"});
          setInputData("");
      } else if (inputData && !selectedStudent) {
          console.log("input data, no selectedStudent");
      } else if (!inputData && selectedStudent) {
          console.log("selectedStudent, no inputData");
      } else {
          console.log("no input data, no selectedStudent");
      }
      }
  };

 
   document.addEventListener("keydown", listener);
   return () => {
    socket.off('connect');
    socket.off('alert');
    socket.off("new message");
    socket.off("send message");
    socket.off("msg_list update");
    document.removeEventListener("keydown", listener);
  };
}, []);
/*  const onRecvAlert = (_alert) => {
      // Add id key.
      _alert["id"] = usernames[_alert["uid"] - 1]; // user1 has a uid of 2.
      allStudents.push(_alert);
      setAlert(_alert);
      console.log(`all students now contains ${JSON.stringify(allStudents)}}`)
      //handleEvent(_alert);
  }*/


  const onChange = (e) => {
      setInputData(e.target.value);
    }
 
  const onFormSubmit = e => {
      e.preventDefault();
      if(inputData && selectedStudent) {
          socket.emit("send message", {
            messageContents: inputData,
            _to: selectedStudent["uid"],
            _from: "000"
          });
          setInputData("");
      } else if (inputData && !selectedStudent) {
          console.log("input data, no selectedStudent");
      } else if (!inputData && selectedStudent) {
          console.log("selectedStudent, no inputData");
      } else {
          console.log("no input data, no selectedStudent");
      }
  }

  
  
    const handleClick = (event, chatInput) => {
    console.log(event.target);

    setInput(chatInput);
  };

  const returnSelectedUser = (displayName) => {  
    for(let i = 0; i < allStudents.length; i++){
      if (allStudents[i]["id"] == displayName) {
        setSelectedStudent(allStudents[i]);
        if(allStudents[i]["messages"]) {
          setDisplayMessages(allStudents[i]["messages"]);
        } 
      }
    }
  };



  
  return (
    

            <div id="instructor_view">

<div className='instructor-chat-input-area'>
           <form
             onSubmit={ onFormSubmit }
             autoComplete="off"
           >
             <input
               type='text'
               className="instructor-chat-input-box"
               autoComplete='off'
               onChange={ onChange }
               value= {inputData}
             />
             <button
               type="submit"
             >
             Send
             </button>
 
           </form>
       </div>

                <StudentList
                    returnSelectedUser={returnSelectedUser}
                    alert={alert}
                />
                <p>{input || "input"}</p>
                <ChatWindow 
                    handleClick={handleClick} 
                    displayMessages={displayMessages}
                />
            </div>
        );
}

var e = document.getElementById('instructor_view');
const root=createRoot(e);

root.render(<InstructorView />);
