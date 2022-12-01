/* Display one chat entry.
 */

import React, { useState, useEffect } from 'react';
import "./student_chat_entry.css"
/*
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBCardFooter,
  MDBIcon,
  MDBBtn,
  MDBScrollbar,
} from "mdb-react-ui-kit";
*/
function StudentChatEntry({message, fromSelf, user}) {
    const [_message, setMessage] = useState(message)
    const [_fromSelf, setFromSelf] = useState(fromSelf)
    const [_user, setUser] = useState(user)

    // determine value of message div className
    const messageType = _fromSelf ? 'fromSelf' : 'fromOther'; 
    const messageTypeClass = _fromSelf ? ' small p-2 me-3 mb-1 text-white rounded-3 bg-primary' : ' small p-2 ms-3 mb-1 rounded-3'; 
    const messageTypeDiv = _fromSelf ? 'd-flex flex-row justify-content-end mb-4 pt-1' : 'd-flex flex-row justify-content-start mb-4'; 
    const messageTypeUserInfo = _fromSelf? 'small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end' : 'small ms-3 mb-3 rounded-3 text-muted'
        
    return (
      <div className={messageTypeDiv}>
        
        <div className={messageType + messageTypeUserInfo} id={messageType}>
          {_user}
        </div>
        
        <div className={messageType + messageTypeClass}>
          {_message}
        </div>
      </div>
    );
}

export default StudentChatEntry;    
   



















/*
// in case passing props in render doesn't work for whatever reason

        this.state = {
            time_sent: null,
            from_self: null,
            messageType: '', 
            message_contents: '',
        };
        
    }
    
        componentDidMount() {
            
            this.setState ({
                time_sent: {timeSent},
                from_self: {fromSelf},
                message_type: {fromSelf} ? 'fromSelf' : 'fromOther', // determine value of message div className
                message_contents: {messageContents},
            });
        }


                        <div className="d-flex flex-row justify-content-end mb-4">
                  <div>
                    <p className="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">
                      Do you have pictures of Matley Marriage?
                    </p>
                    <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">
                      00:11
                    </p>
                  </div>
                </div>

*/





