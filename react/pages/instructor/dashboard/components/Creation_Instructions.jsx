import React from 'react';

import '../Instr_Dash.css';
function Creation_Instructions() {

    return (
        <>
            <div className='instructor-dash-column-alt'>

                <div className='instructions-bubble instructions-header'>
                    Creation instructions
                </div>

                <div className='instructions-bubble'>
                    First, ensure you have a student group with students.  If you don't
                    have a group, or the group doesn't have students, create a group and/or
                    populate it with students, then proceed.
                </div>

                <div className='instructions-bubble'>
                    Next, select one of the currently existing student groups from the dropdown menu.
                </div>

                <div className='instructions-bubble'>
                    Next, choose a scenario 'type' from the dropdown menu.
                </div>

                <div className='instructions-bubble'>
                    Then, type in a UNIQUE name for your scenario.
                    It is important that this name is not the same as another in your database.
                </div>

                <div className='instructions-bubble'>
                    Finally, click CREATE and cross your fingers.  If all goes well, the scenario should be added to the list as 'stopped'.
                </div>
                <div className='instructions-bubble'>
                    From here, you can START, STOP, or DESTROY scenarios.
                </div>



                <div className='instructions-bubble'>
                    IMPORTANT:  Currently, students cannot be added after a scenario is created, so it is important
                    to create your group and its students BEFORE you create the scenario, if you want those students to have access.
                </div>
                
            </div>
        </>
    );
}
export default Creation_Instructions;