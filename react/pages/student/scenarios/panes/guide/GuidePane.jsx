import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import './GuidePane.css';
import {nanoid} from 'nanoid';
import buildGuide from '@modules/utils/guide_modules';
import HomeChapter from './Q_and_A/HomeChapter';
import { HomeRouter_context } from '@pub/Home_router';
import GuideReading from './Q_and_A/GuideReading';
import GuideQuestion from './Q_and_A/GuideQuestion';

function GuidePane({ guideBook, guideContent }) {

    const { scenarioID, pageID } = useParams(); // from URL parameters
    const { userData_state } = useContext(HomeRouter_context);

    const meta = guideContent.scenario_meta;

    
    if ((guideBook?.length < 1) || (!meta)) { return (<>Scenario not found</>); }
    

    const tabActiveClass = 'guidepane-controlbar-tab guidepane-tab-active';
    const tabInactiveClass = 'guidepane-controlbar-tab guidepane-tab-inactive';

    function selectChapter () {
        if (Number(pageID) === 0) { return <HomeChapter />; }
        else if (Number(pageID) === 1337) { return <HomeChapter />; }
        else {
            const this_guideItem_arr = guideBook [Number(pageID) - 1];

            const react_arr = []

            this_guideItem_arr.map((item) => {

                if (item?.itemContentType){
                    let tempItem
                    if (item?.itemContentType === 'reading') {
                        tempItem = (
                            <div key={nanoid(5)}>
                                <GuideReading readingObj={item} />
                            </div>
                    )
                        
                    }
                    else {
                        tempItem = (
                            <div key={nanoid(5)}>
                                <GuideQuestion scenario_id={scenarioID} questionObj={item} scenario_type={meta?.scenario_type}/>
                            </div>
                        )
                    }
                    react_arr.push(tempItem)
                }
            }   
            )
            return react_arr;
        }
    };
    const current_chapter = selectChapter()
    return (
        <div className='guidepane-guide-frame'>

            

            <div className='guidepane-guide-main'>

                <div className='guidepane-controlbar-frame'>
                    <div className='guidepane-controlbar-tabs-frame'>

                        <Link
                            to={`${(userData_state?.role === "instructor" || userData_state?.role === "admin") ? `/instructor/scenarios/${scenarioID}/0` : `/scenarios/${scenarioID}/0`}`}
                            className={`guidepane-tab-left ${pageID === "0" ? tabActiveClass : tabInactiveClass}`}>
                            <div >
                                Brief
                            </div>
                        </Link>

                        {guideBook.map((val, index) => {
                            return (
                                <Link
                                    to={
                                        `${(userData_state?.role === "instructor" 
                                        || userData_state?.role === "admin") 
                                        ? `/instructor/scenarios/${scenarioID}/${index + 1}` 
                                        : `/scenarios/${scenarioID}/${index + 1}`}`
                                    } key={index + 3000}
                                    className={`guidepane-tab-middles ${pageID === (index + 1).toString() ? tabActiveClass : tabInactiveClass}`}>
                                    <div key={index} >
                                        Chpt.{index + 1}
                                    </div>
                                </Link>
                            );
                        })}

                        <Link
                            to={`/scenarios/${scenarioID}/1337`}
                            className={`guidepane-tab-right ${pageID === "1337" ? tabActiveClass : tabInactiveClass}`}>
                            <div >
                                Debrief
                            </div>
                        </Link>

                    </div>
                </div>

                <article className='guidepane-guide-text'>
                    {current_chapter}
                </article>

            </div>
        </div>
    );
};

export default GuidePane;