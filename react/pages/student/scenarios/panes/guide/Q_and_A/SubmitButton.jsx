

import React, { useState } from 'react';
import axios from 'axios';
import './Q_and_A.css'


function SubmitButton({ scenario_id, question_num, scenario_type }) {

    const [inputText_state, set_inputText_state] = useState('');

    async function handleSubmit() {

        try {
            const evaluated = await axios.post('/check_response', {
                scenario_id: scenario_id,
                question_num: question_num,
                scenario_type: scenario_type,
                student_response: inputText_state
            });
            if (evaluated) {
                const scoresArray = evaluated.data.points_gained;
                const testingItem = scoresArray[0];
                const pointsAward = testingItem.points_awarded;
            }
        } catch (err) {
            console.log(`Submission error: ${err}`);
        };

    }
    return (
        <div className='edu3-qSubmit-element'>
            <input className='edu3-qSubmit-text'
                type="text"
                value={inputText_state}
                onChange={(e) => set_inputText_state(e.target.value)}
                placeholder="Enter text"
            />
            <button onClick={handleSubmit}>CHECK</button>
        </div>
    );
};
export default SubmitButton;
