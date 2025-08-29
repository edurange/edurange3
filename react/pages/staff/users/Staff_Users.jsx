import React, { useContext } from 'react';
import Placard from '@components/Placard';
import { StaffRouter_context } from '../Staff_router';
import '@assets/css/tables.css';
import Staff_UsersGrid from './Staff_UsersGrid';

function Staff_Users() {

    const { groups_state } = useContext(StaffRouter_context);
    if (!groups_state) { return <></> }

    return (
        <div className='staff-dash-frame'>

            <div className='staff-dash-column-main'>
                <div className='staff-dash-section'>
                    <Placard placard_text={"Students"} />
                    <div className="table-frame">
                        <Staff_UsersGrid />
                    </div>
                </div>
            </div>

            <div className='staff-dash-column-alt'>
                <p>View and manage student accounts.</p>
                <p>Click student names to see progress details and manage group assignments.</p>
            </div>
            
        </div>
    );
};

export default Staff_Users;