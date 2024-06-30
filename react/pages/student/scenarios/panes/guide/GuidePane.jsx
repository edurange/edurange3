import React, { useState, useEffect, useContext } from 'react';
import './GuidePane.css';
import {nanoid} from 'nanoid';
import HomeChapter from './Q_and_A/HomeChapter';
import GuideReading2 from './Q_and_A/GuideReading2';
import GuideQuestion2 from './Q_and_A/GuideQuestion2';
import GuideTabs from './GuideTabs';

function generate_thisChapter_reactArray(scenarioID, meta, thisChapter_contentArray) {

    const react_arr = [];

    thisChapter_contentArray.map((content_item, index) => {
        if (content_item?.type) {
            let tempItem;
            if (content_item?.type === 'reading') {
                tempItem = (
                    <div key={index + 1000}>
                        <GuideReading2 scenario_id={scenarioID} readingObj={content_item} scenario_type={meta?.scenario_type} />
                    </div>
                );
            } else if (content_item?.type === 'question') {
                tempItem = (
                    <div key={index + 2000}>
                        <GuideQuestion2 scenario_id={scenarioID} questionObj={content_item} scenario_type={meta?.scenario_type} />
                    </div>
                );
            } else {
                return;
            }

            if (tempItem) {
                react_arr.push(tempItem);
            }
        }
    });
    return react_arr;
}

function GuidePane({chapter_num, meta, guideContent, scenarioID, pageID}) {

    const allChapterDatas_array = guideContent?.studentGuide?.chapters
    const thisChapter_data = allChapterDatas_array[chapter_num]
    const thisChapter_contentArray = thisChapter_data?.content_array;

    const pageID_int = Number(pageID)
    
    if ((thisChapter_contentArray?.length < 1)) { return (<>Scenario content length less than 1</>); }

    let final_array = [
        (<div key='abc123'>
            <HomeChapter/>
        </div>),
]
    if (Number(chapter_num) === 0 || Number(chapter_num) === 1337) { final_array = [(<div key={'abc123'}><HomeChapter /></div>)]; }

    if ((pageID_int > 0) && (pageID_int !== 1337)) {
        final_array = generate_thisChapter_reactArray(scenarioID, meta, allChapterDatas_array[pageID-1]?.content_array)
    }

    return (
        <div className='guidepane-guide-frame'>

            <div className='guidepane-guide-main'>
            
                <GuideTabs allChapters_array={allChapterDatas_array}/>

                <article className='guidepane-guide-text'>
                    <div key={nanoid(5)}>
                        {final_array}
                    </div>
                </article>

            </div>
        </div>
    );
};
export default GuidePane;