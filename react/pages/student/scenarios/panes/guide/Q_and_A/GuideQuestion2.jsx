
import axios from 'axios';
import React, { useContext, useState } from 'react';
import './Q_and_A.css';
import ResponseStatus from './ResponseStatus';
import { StudentRouter_context } from '../../../../Student_router';

function GuideQuestion2({ scenario_id, questionObj, scenario_type }) {
    console.log('quob: ', questionObj)
    if (!questionObj?.content) { return null; }

    const { responseData_state, set_responseData_state } = useContext(StudentRouter_context);
    const [inputText_state, set_inputText_state] = useState('');

    const points_possible = questionObj?.itemContent?.Points ?? '?';

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    };
    

    async function handleSubmit() {
        try {
            const evaluated = await axios.post('/check_response', {
                scenario_id: scenario_id,
                question_num: questionObj?.itemContentPointer,
                scenario_type: scenario_type,
                student_response: inputText_state
            });
            if (evaluated && evaluated.data?.[0]) {
                const this_item = evaluated.data[0];
                const new_score = this_item?.points_awarded ?? 0;
                const current_score = responseData_state[questionObj?.itemContentPointer]?.points_awarded ?? 0;

                if (new_score > current_score) {
                    set_responseData_state(prevState => ({
                        ...prevState,
                        [questionObj?.itemContentPointer]: this_item
                    }));
                }

                console.log(`Submission for scenario ${scenario_id} question ${questionObj?.itemContentPointer}: "${inputText_state}". Correct answer was [ REDACTED ]. You were awarded ${this_item.points_awarded} points!`);
                // console.log(`Submission for scenario ${scenario_id} question ${questionObj?.itemContentPointer}: "${inputText_state}". Correct answer was ${this_item.correct_response}. You were awarded ${this_item.points_awarded} points!`);
            }

            set_inputText_state('');

        } catch (err) {
            console.log(`Submission error: ${err}`);
        }
    }

    return (
        <div className='edu3-question-frame' key={scenario_id}>
            <div className='edu-question-carpet'>
                <div className='edu3-question-text-row'>
                    {questionObj?.itemContent?.Text}
                </div>
                <div className='edu3-response-row'>
                    <div className='edu3-response-row-top'>
                        <div className='edu3-response-row-top-content'>
                            <label className='edu3-response-row-top-content-text' htmlFor='question'>Response:</label>
                            <div className='edu3-qSubmit-element'>
                                <input
                                    className='edu3-qSubmit-text'
                                    type="text"
                                    value={inputText_state}
                                    onChange={(e) => set_inputText_state(e.target.value)}
                                    onKeyPress={handleKeyPress} // Added onKeyPress event
                                    placeholder="Enter text"
                                    id="question"
                                />
                                <button onClick={handleSubmit}>CHECK</button>
                            </div>
                        </div>
                    </div>
                    <div className='edu3-response-row-bottom'>
                        <ResponseStatus points_possible={points_possible} question_num={questionObj?.itemContentPointer} />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GuideQuestion2;