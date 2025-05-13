import React, { useContext } from 'react';
import '../Hints_Main.css';
import { HintConfig_Context } from '../Hints_Controller';

function Hint_LogsContainer() {

    const {
        student_bash_logs_state,
        student_chat_logs_state,
        student_responses_logs_state, 
    } = useContext(HintConfig_Context);

    return (
        <div className="expandable-logs-content">
            <label htmlFor="student-bash-logs" className="logs-textarea-label">Bash Logs:</label>
            <textarea
                id="student-bash-logs"
                value={student_bash_logs_state}
                rows={1}
                readOnly
                aria-live="polite"
                className="logs-textarea"
                placeholder="Student bash logs used for hint generation will appear here"
            />
            <label htmlFor="student-chat-logs" className="logs-textarea-label">Chat Logs:</label>
            <textarea
                id="student-chat-logs"
                value={student_chat_logs_state}
                rows={1}
                readOnly
                aria-live="polite"
                className="logs-textarea"
                placeholder="Student chat logs used for hint generation will appear here"
            />
            <label htmlFor="student-responses-logs" className="logs-textarea-label">Answer Logs:</label>
            <textarea
                id="student-responses-logs"
                value={student_responses_logs_state}
                rows={1}
                readOnly
                aria-live="polite"
                className="logs-textarea"
                placeholder="Student answer logs used for hint generation will appear here"
            />
        </div>
    );
}

export default Hint_LogsContainer;
