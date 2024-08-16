
import React, { useState } from 'react';
import './ListController.css';

function ListController({ 
    sortDirection_state, set_sortDirection_state, 
    primarySortProperty_state, set_primarySortProperty_state 
}) {

    function handleDirectionChange (event) {
        set_sortDirection_state(event.target.value);
    };

    function handleSortPropertyChange (event) {
        set_primarySortProperty_state(event.target.value);
    };

    return (
        <>
            <div className='userSelect-frame'>
                <div className='userSelect-label'>
                    USER
                </div>

            <select value={sortDirection_state} onChange={handleDirectionChange}>
                    <option value="asc">ALL</option>
                    <option value="desc">User1example</option>
                    <option value="desc">User2example</option>
                    <option value="desc">User3example</option>
                </select>
            </div>
            <div className='sortBy-frame'>
                <select value={sortDirection_state} onChange={handleDirectionChange}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
                <select value={primarySortProperty_state} onChange={handleSortPropertyChange}>
                    <option value="timestamp">Timestamp</option>
                    <option value="channel_id">Channel ID</option>
                    <option value="scenario_id">Scenario ID</option>
                </select>
            </div>
        </>
    );
}

export default ListController;