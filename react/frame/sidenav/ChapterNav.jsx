import React, { useContext, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HomeRouter_context } from '@pub/Home_router';

function ChapterNav() {
    const location = useLocation();
    const { guideContent_state, scorebook_state } = useContext(HomeRouter_context);

    const { scenarioID, pageID } = useMemo(() => {
        const parts = location.pathname.replace(/^\/scenarios\//, '').split('/');
        return { scenarioID: parts[0] || '', pageID: parts[1] || '0' };
    }, [location.pathname]);

    const theseChapters = guideContent_state?.contentYAML?.studentGuide?.chapters;
    const thisBriefing = guideContent_state?.briefingYAML?.studentGuide?.chapters;
    const thisDebrief = guideContent_state?.debriefYAML?.studentGuide?.chapters;

    if (!theseChapters && !thisBriefing && !thisDebrief) return null;

    const fullBook = [...(thisBriefing || []), ...(theseChapters || []), ...(thisDebrief || [])];
    const pageID_num = Number(pageID);

    const chapters = fullBook.map(ch => ({
        num: Number(ch.chapter_num),
        label: ch.title || `Chapter ${ch.chapter_num}`,
    }));

    const points_awarded = (num) => scorebook_state?.[num]?.points_awarded;
    const points_possible = (num) => scorebook_state?.[num]?.points_possible;
    const isComplete = (num) => {
        const a = points_awarded(num);
        const p = points_possible(num);
        return a !== undefined && p !== undefined && a > 0 && a === p;
    };
    const totalPoints = (num) => {
        const a = points_awarded(num);
        const p = points_possible(num);
        if (a === undefined && p === undefined) return null;
        return `${a ?? 0}/${p ?? '?'}`;
    };

    return (
        <div className='chapternav-frame'>
            <div className='chapternav-header'>Chapters</div>
            {chapters.map((ch) => {
                const isActive = pageID_num === ch.num;
                const pts = totalPoints(ch.num);
                const complete = isComplete(ch.num);
                const cls = [
                    'chapternav-btn',
                    isActive ? 'chapternav-active' : '',
                    complete ? 'chapternav-complete' : '',
                ].filter(Boolean).join(' ');

                return (
                    <Link
                        key={ch.num}
                        to={`/scenarios/${scenarioID}/${ch.num}`}
                        className={cls}
                        title={ch.label}
                    >
                        <span className='chapternav-num'>{ch.num}</span>
                        <span className='chapternav-title'>{ch.label}</span>
                        {pts && (
                            <span className={`chapternav-points${complete ? ' chapternav-points-done' : ''}`}>
                                {pts}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

export default ChapterNav;
