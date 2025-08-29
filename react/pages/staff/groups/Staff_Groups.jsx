
import React from 'react';
import CreateGroup from './CreateGroup';
import Placard from '@components/Placard';
import '@assets/css/tables.css';
import Staff_GroupsGrid from './Staff_GroupsGrid';

function Staff_Groups() {

    return (
        <div className='staff-dash-frame'>
            
            <div className='staff-dash-column-main'>
                <div className='staff-dash-section'>
                    <Placard placard_text={"Student Groups"} />
                        <CreateGroup />
                    <div className="table-frame">
                        <Staff_GroupsGrid />
                    </div>
                </div>
            </div>

            <div className='staff-dash-column-alt'>
                <p>Create and manage student groups for collaborative scenarios.</p>
                <p>Click group names to view details and manage members.</p>
            </div>

        </div>
    );
};
export default Staff_Groups;