
import React, { useState } from 'react';
import './ListController.css';

function ListController({ 
    sortDirection_state, set_sortDirection_state, 
    primarySortProperty_state, set_primarySortProperty_state 
}) {

    const handleDirectionChange = (e) => {
        set_sortDirection_state(e.target.value);
    };

    const handleSortPropertyChange = (e) => {
        set_primarySortProperty_state(e.target.value);
    };

    return (
        <div>
            <select value={sortDirection_state} onChange={handleDirectionChange}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
            <select value={primarySortProperty_state} onChange={handleSortPropertyChange}>
                <option value="timestamp">Timestamp</option>
                <option value="channel_id">Channel ID</option>
                <option value="scenario">Scenario ID</option>
            </select>
        </div>
    );
}

export default ListController;


// import React, { useContext } from 'react';
// import './ListController.css';
// import { useSortedData } from "../../../modules/utils/sorting_modules";

// function ListController({ inputList_state, inputList_stateSetter }) {

//     const [ascOrDesc_state, set_ascOrDesc_state] = useState('asc'); // list will ascend or descend
//     const [primarySortProperty_state, set_primarySortProperty_state] = useState(null); // first property by which to sort
//     const [secondarySortProperty_state, set_secondarySortProperty_state] = useState(null); // if set, sort items w/ matching first sorting property by second property

//     // handle click of button to switch from ascend (default) or descend

//     function handle_directionChange_click(){
//         return 0
//     }
    
//     function handle_primarySortProperty_selection(){
//         // a dropdown will select between
//         // - timestamp (becomes int in another function, don't worry about conversion)
//         // - channelID (int)
//         // - scenarioID (int)
//         //...more To Be Added Later
//         return 0
//     }

//     function handle_secondarySortProperty_selection(){
//         // this is similar to primary, except it will sort items that are equal with a second property
//         // a dropdown will select between
//         // - timestamp (becomes int in another function, don't worry about conversion)
//         // - channelID (int)
//         // - scenarioID (int)
//         //...more To Be Added Later
//         return 0
//     }


//     return (
//         <div >

//         </div>
//     );
// };
// export default ListController;

