import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './GuidePane.css';

function GuideTabs({ allChapters_array }) {

    const { scenarioID, pageID } = useParams();
    if (allChapters_array?.length < 1) { return null; }
    
    const tabActiveClass = 'guidepane-controlbar-tab guidepane-tab-active';
    const tabInactiveClass = 'guidepane-controlbar-tab guidepane-tab-inactive';

    const pageID_int = Number(pageID)

    return (

                <div className='guidepane-controlbar-frame'>
                    <div className='guidepane-controlbar-tabs-frame'>

                        <Link
                            to={`/scenarios/${scenarioID}/0`}
                            className={`guidepane-tab-left ${pageID_int === 0 ? tabActiveClass : tabInactiveClass}`}>
                            <div >
                                Brief
                            </div>
                        </Link>

                        {allChapters_array.map((val, index) => {
                            return (
                                <Link
                                    to={`/scenarios/${scenarioID}/${val.chapter_num}`}
                                    key={index + 3000}
                                    className={`guidepane-tab-middles ${pageID_int === val.chapter_num ? tabActiveClass : tabInactiveClass}`}>
                                    <div key={index} >
                                        {val.chapter_num}
                                    </div>
                                </Link>
                            );
                        })}

                        <Link
                            to={`/scenarios/${scenarioID}/1337`}
                            className={`guidepane-tab-right ${pageID_int === 1337 ? tabActiveClass : tabInactiveClass}`}>
                            <div >
                                Debrief
                            </div>
                        </Link>

                    </div>
                </div>

    );
};

export default GuideTabs;