import React, { useContext } from 'react';
import { HomeRouter_context } from '@pub/Home_router';
import './Q_and_A.css';

function ResponseStatus({ points_possible, question_num, lastResponse }) {
    const { responseData_state } = useContext(HomeRouter_context);
    const storedResponse = responseData_state[question_num];
    
    // Use the stored response for points (best score)
    const points_awarded = storedResponse?.points_awarded ?? 0;
    
    // Use the last response for displayig correct/incorrect status
    // If no last response is provided, fall back to the stored response
    const displayResponse = lastResponse || storedResponse;
    
    // Determine if the answer is correct, partially correct, or incorrect
    const getStatusIcon = () => {
        if (!displayResponse) return null;
        
        const responsePoints = displayResponse.points_awarded;
        const percentage = responsePoints / points_possible;
        
        if (percentage >= 1) {
            return (
                <div className="status-icon correct" title="Correct">
                    <span role="img" aria-label="Correct">✓</span>
                </div>
            );
        } else if (percentage > 0) {
            return (
                <div className="status-icon partial" title="Partially Correct">
                    <span role="img" aria-label="Partially Correct">◑</span>
                </div>
            );
        } else {
            return (
                <div className="status-icon incorrect" title="Incorrect">
                    <span role="img" aria-label="Incorrect">✗</span>
                </div>
            );
        }
    };
    
    return (
        <div className="response-status">
            {getStatusIcon()}
            <div className="points-display">
                Points: <span className="points-value">{points_awarded}</span> / <span className="points-value">{points_possible}</span>
            </div>
            {lastResponse && lastResponse !== storedResponse && (
                <div className="response-feedback">
                    {lastResponse.points_awarded === 0 ? 
                        "Incorrect. Try again!" : 
                        lastResponse.points_awarded < points_possible ? 
                            "Partially correct!" : 
                            "Correct!"}
                </div>
            )}
        </div>
    );
}

export default ResponseStatus;
