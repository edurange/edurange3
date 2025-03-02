
import axios from 'axios';
import React, { useContext, useState, useMemo } from 'react';
import './Q_and_A.css';
import ResponseStatus from './ResponseStatus';
import ReactMarkdown from 'react-markdown';
import { HomeRouter_context } from '@pub/Home_router';

function GuideQuestion({ scenario_id, questionObj, scenario_type }) {
    if (!questionObj?.content) { return null; }

    const { 
        responseData_state, 
        set_responseData_state, 
        guideContent_state,
        set_scorebook_state
    } = useContext(HomeRouter_context);
    
    const [inputText_state, set_inputText_state] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResponse, setLastResponse] = useState(null);

    const points_possible = questionObj?.points_possible ?? '?';

    // Check if this question appears in multiple chapters (for internal use only)
    const isRepeatedQuestion = useMemo(() => {
        if (!guideContent_state) return false;
        
        let count = 0;
        const chapters = guideContent_state?.contentYAML?.studentGuide?.chapters ?? [];
        
        chapters.forEach(chapter => {
            chapter.content_array
                .filter(item => item.type === "question")
                .forEach(question => {
                    if (question.question_num === questionObj.question_num) {
                        count++;
                    }
                });
        });
        
        return count > 1;
    }, [guideContent_state, questionObj.question_num]);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    };
    
    // Function to recalculate scorebook
    const recalculateScorebook = () => {
        if (!guideContent_state) return;
        
        const scenarioChapters = guideContent_state?.contentYAML?.studentGuide?.chapters ?? [];
        const scorebook = {};
        
        // Track unique questions to avoid counting duplicates in the total
        const uniqueQuestions = new Map();
        
        // First, calculate points for each chapter
        scenarioChapters.forEach((chapter) => {
            let chapterPointsPossible = 0;
            let chapterPointsAwarded = 0;

            chapter.content_array
                .filter((item) => item.type === "question")
                .forEach((question) => {
                    // Add to chapter total
                    chapterPointsPossible += Number(question.points_possible ?? 0);

                    const response = responseData_state[question.question_num];
                    if (response) {
                        chapterPointsAwarded += Number(response.points_awarded ?? 0);
                    }
                    
                    // Track unique questions for global total
                    if (!uniqueQuestions.has(question.question_num)) {
                        uniqueQuestions.set(question.question_num, {
                            points_possible: Number(question.points_possible ?? 0),
                            response: response
                        });
                    }
                });

            scorebook[chapter.chapter_num] = {
                points_possible: chapterPointsPossible,
                points_awarded: chapterPointsAwarded
            };
        });
        
        // Calculate the total using only unique questions
        let totalPointsPossible = 0;
        let totalPointsAwarded = 0;
        
        uniqueQuestions.forEach(question => {
            totalPointsPossible += question.points_possible;
            totalPointsAwarded += question.response ? Number(question.response.points_awarded ?? 0) : 0;
        });
        
        // Add the total to the scorebook
        scorebook.total = {
            points_possible: totalPointsPossible,
            points_awarded: totalPointsAwarded
        };

        set_scorebook_state(scorebook);
    };
    
    async function handleSubmit() {
        if (isSubmitting || !inputText_state.trim()) return;
        
        setIsSubmitting(true);
        try {
            const evaluated = await axios.post('/check_response', {
                scenario_id: scenario_id,
                scenario_type: scenario_type,
                student_response: inputText_state,
                question_num: questionObj.question_num
            });
            
            if (evaluated && evaluated.data?.[0]) {
                const this_item = evaluated.data[0];
                const new_score = this_item?.points_awarded ?? 0;
                const current_score = responseData_state[questionObj?.question_num]?.points_awarded ?? 0;

                // Always store the last response for display purposes
                setLastResponse(this_item);
                
                // Only update the stored response if it has a higher score
                if (new_score > current_score) {
                    // Update response data with the new score
                    set_responseData_state(prevState => {
                        const newState = {
                            ...prevState,
                            [questionObj?.question_num]: this_item
                        };
                        
                        // Recalculate scorebook after state update
                        setTimeout(() => recalculateScorebook(), 0);
                        
                        return newState;
                    });
                }
            }

            set_inputText_state('');
        } catch (err) {
            console.log(`Submission error: ${err}`);
        } finally {
            setIsSubmitting(false);
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
                                    disabled={isSubmitting}
                                />
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !inputText_state.trim()}
                                >
                                    {isSubmitting ? 'CHECKING...' : 'CHECK'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='edu3-response-row-bottom'>
                        <ResponseStatus 
                            points_possible={points_possible} 
                            question_num={questionObj?.question_num}
                            lastResponse={lastResponse}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideQuestion;
