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
                    <div>

                    First, ensure you have a student group <span className='highlighter'>with students</span>.
                    </div>
                    
                    <div>

                    If you don't
                    have a group, or the group doesn't have students, create a group with
                    a <span className='highlighter'>unique</span> name and/or populate your group with students, then proceed.
                    </div>
                </div>

                <div className='instructions-bubble'>
                    <div>

                    Note: It is important that both this name and the scenario name you choose later <span className='highlighter'>are not</span> the same as another in your database.
                    </div>
                </div>

                <div className='instructions-bubble'>
                    Next, select one of the currently existing student groups from the dropdown menu.
                </div>

                <div className='instructions-bubble'>
                    Next, choose a scenario 'type' from the dropdown menu.
                </div>

                <div className='instructions-bubble'>
                    <div>
                        Then, type in a <span className='highlighter'>unique</span> name for your scenario.
                        
                    </div>
                </div>

                <div className='instructions-bubble'>
                    Finally, click CREATE and cross your fingers.  If all goes well, the scenario should be added to the list as 'stopped'.
                </div>
                <div className='instructions-bubble'>
                    From here, you can START, STOP, or DESTROY scenarios.
                </div>



                <div className='instructions-bubble'>
                    <div>

                    <span className='highlighter'>IMPORTANT</span>:  Currently, students cannot be added after a scenario is created, so it is important
                    to create your group and its students <span className='highlighter'>before</span> you create the scenario, if you want those students to have access.
                    </div>
                </div>
                
            </div>
        </>
    );
}
export default Creation_Instructions;