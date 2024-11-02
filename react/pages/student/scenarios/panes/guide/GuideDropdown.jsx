import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GuidePane.css';
import { HomeRouter_context } from '../../../../pub/Home_router';
import edurange_icons from '../../../../../modules/ui/edurangeIcons';

function GuideDropdown({ allChapters_array }) {
    
    const navigate = useNavigate();
    const { scenarioID, pageID } = useParams();
    const { scorebook_state } = useContext(HomeRouter_context);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(pageID === '0' ? 'Brief' : pageID === '1337' ? 'Debrief' : `Chapter ${pageID}`);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (chapter_num, label) => {
        setSelectedLabel(label);
        setIsOpen(false);
        navigate(`/scenarios/${scenarioID}/${chapter_num}`);
    };

    return (
        <div onClick={toggleDropdown} className="guidepane-controlbar-frame">

            <div className="guidepane-dropdown-selected">
                <div className='guidepane-dropdown-pair'>

                    <div className='dropdown-selected-label'>
                        <div className='guidepane-dropdown-arrow'>
                            <div className='arrow-icon'>
                                {edurange_icons.menuOpen_down}
                            </div>
                        </div>

                        {`${selectedLabel}: ${allChapters_array.find(chap => Number(chap.chapter_num) === Number(pageID)).title ?? ''}`}
                    </div>

                    <div className='guidepane-dropdown-scorebox'>
                        <div className='awarded-box'>
                            {scorebook_state[pageID]?.points_awarded ?? ''}
                        </div>

                        <div className='possible-box'>
                            {scorebook_state[pageID]?.points_possible ?? ''}
                        </div>
                    </div>

                </div>
            </div>

            {isOpen && (

                <div className="guidepane-dropdown-options">

                    {allChapters_array.map((val) => (
                        <div className='guidepane-dropdown-pair'>
                            <div
                                key={val.chapter_num}
                                onClick={() => handleSelect(val.chapter_num, `Chapter ${val.chapter_num}`)}
                                className="guidepane-dropdown-option"
                            >
                                {`Chapter ${val.chapter_num}: ${val.title}`}
                            </div>

                            <div className='guidepane-dropdown-scorebox'>
                                <div className='awarded-box'>
                                    {scorebook_state[val.chapter_num]?.points_awarded ?? ''}
                                </div>

                                <div className='possible-box'>
                                    {scorebook_state[val.chapter_num]?.points_possible ?? ''}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}

export default GuideDropdown;
