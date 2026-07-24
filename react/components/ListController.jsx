import React from 'react';
import './ListController.css';

function ListController({
    sortDirection_state, set_sortDirection_state,
    primarySortProperty_state, set_primarySortProperty_state
}) {

    function handleDirectionChange(event) {
        set_sortDirection_state(event.target.value);
    }

    function handleSortPropertyChange(event) {
        set_primarySortProperty_state(event.target.value);
    }

    return (
        <div className='sortBy-frame'>
            <div className='sortBy-item'>
                <label className='sortBy-label'>Sort by</label>
                <select
                    className='sortBy-select'
                    value={primarySortProperty_state}
                    onChange={handleSortPropertyChange}
                >
                    <option value="timestamp">Timestamp</option>
                    <option value="channel_id">Channel</option>
                    <option value="scenario_id">Scenario</option>
                </select>
            </div>
            <div className='sortBy-item'>
                <label className='sortBy-label'>Direction</label>
                <select
                    className='sortBy-select'
                    value={sortDirection_state}
                    onChange={handleDirectionChange}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </div>
    );
}

export default ListController;