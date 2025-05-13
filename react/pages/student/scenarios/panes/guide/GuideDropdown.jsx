import React, { useState, useContext, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GuidePane.css';
import { HomeRouter_context } from '../../../../pub/Home_router';
import edurange_icons from '../../../../../modules/ui/edurangeIcons';
import { nanoid } from 'nanoid';

function GuideDropdown({ fullBook }) {
    const navigate = useNavigate();
    const { scenarioID, pageID } = useParams();
    const { scorebook_state } = useContext(HomeRouter_context);
    const [dropdownOpen_state, set_dropdownOpen_state] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(pageID === '0' ? 'Brief' : pageID === '1337' ? 'Debrief' : `Chapter ${pageID}`);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => set_dropdownOpen_state((prev) => !prev);

    const handleSelect = (chapter_num, label) => {
        setSelectedLabel(label);
        navigate(`/scenarios/${scenarioID}/${chapter_num}`);
        set_dropdownOpen_state(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                set_dropdownOpen_state(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="guidepane-controlbar-frame">
            <div onClick={toggleDropdown} className="guidepane-dropdown-selected">
                <div className='guidepane-dropdown-pair'>
                    <div className='dropdown-selected-label'>
                        <div className='guidepane-dropdown-arrow'>
                            <div className='arrow-icon'>
                                {edurange_icons.menuOpen_down}
                            </div>
                        </div>
                        {`${selectedLabel}: ${fullBook.find(chap => Number(chap.chapter_num) === Number(pageID)).title ?? ''}`}
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

            {dropdownOpen_state && (
                <div className="guidepane-dropdown-options">
                    {fullBook.map((val) => (
                        <div key={nanoid(val.chapter_num)} className='guidepane-dropdown-pair'>
                            <div
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
