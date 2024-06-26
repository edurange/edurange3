
import { customAlphabet } from 'nanoid';
import './Chat_Instructor.css'
import { useState, useRef, useEffect } from 'react';

// note: this component is currently using dummy values, but in the future it will need
// to have access to those dynamic values, either by way of prop passing or other
// context sharing.

// also: the info displayed here are placeholders. not everything will necessarily
// be implemented.

function Chat_Instructor_old() {

    return (


        <div className='er3chat-instr-frame'>
            <div className='er3chat-instr-carpet'>
                <div className='er3chat-instr-heading'>
                    INSTRUCTOR PANEL
                </div>
                <div className='er3chat-instr-studentInspect'>
                    <div>ANON-ALIAS: blueRooster <button>reveal user info</button> </div>
                    <div>ACTIVE SCENARIO: getstart_test123</div>
                    <div>GUIDE POINTS: 15/175</div>
                    <div>RECENT GUIDE ANSWER: Question 5: "LS -L" (INCORRECT)</div>
                    <div>RECENT BASH COMMAND: cat ./info.txt</div>
                    <div>ACTIVE QUESTION: "how do I add a port to nmap?"</div>
                    <div>QUESTION AGE: 5m35s</div>
                    <div>QUESTION STATUS: UNREAD</div>
                    <div>ADD TO PINNED</div>
                    <div>CHAT HISTORY (click to expand)</div>

                </div>
                <div className='er3chat-instr-queue'>

                    CHAT PRIORITY QUEUE / HISTORY
                </div>
            </div>
        </div>
    );

}; export default Chat_Instructor_old;