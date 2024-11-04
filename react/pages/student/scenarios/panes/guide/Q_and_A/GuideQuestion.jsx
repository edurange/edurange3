import axios from 'axios';
import React, { useContext, useState } from 'react';
import './Q_and_A.css';
import ResponseStatus from './ResponseStatus';
import ReactMarkdown from 'react-markdown';
import { HomeRouter_context } from '@pub/Home_router';

function GuideQuestion({ scenario_id, questionObj, scenario_type }) {
    if (!questionObj?.content) { return null; }

    const { responseData_state, set_responseData_state, scorebook_state, set_scorebook_state } = useContext(HomeRouter_context);
    const [inputText_state, set_inputText_state] = useState('');

    const points_possible = questionObj?.points_possible ?? '?';

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
                scenario_type: scenario_type,
                student_response: inputText_state,
                question_num: questionObj.question_num
            });
            if (evaluated && evaluated.data?.[0]) {

                const thisQnum = questionObj.question_num;
                const this_item = evaluated.data[0];
                const new_score = this_item?.points_awarded ?? 0;
                const current_score = responseData_state[questionObj?.question_num]?.points_awarded ?? 0;

                if (new_score > current_score){
                    
                    set_responseData_state(prevState => ({
                        ...prevState,
                        [scenario_id]: {
                            ...prevState, 
                            [thisQnum]: this_item
                        }
                    }));

                    set_scorebook_state(prevState => (
                        {
                            ...prevState,
                            [thisQnum]: {
                                ...prevState[thisQnum],
                                points_awarded: new_score
                            }
                        }
                    ));
                }
            }

        } catch (err) {
            console.log(`Submission error: ${err}`);
        }
    }

    return (
        <div className='edu3-question-frame' key={scenario_id}>
            <div className='edu-question-carpet'>
                <div className='edu3-question-text-row'>
                    <ReactMarkdown className='edu-reading-text'>
                        {questionObj?.content}
                    </ReactMarkdown>
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
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter text"
                                    id="question"
                                />
                                <button onClick={handleSubmit}>CHECK</button>
                            </div>
                        </div>
                    </div>
                    <div className='edu3-response-row-bottom'>
                        <ResponseStatus points_possible={points_possible} points_awarded={responseData_state?.[scenario_id]?.[questionObj?.question_num]?.points_awarded ?? 0} question_num={questionObj?.question_num} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideQuestion;
