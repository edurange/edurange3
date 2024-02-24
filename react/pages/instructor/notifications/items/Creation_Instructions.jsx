import React from 'react';

import '../../dashboard/Instr_Dash.css';
function Creation_Instructions() {

    return (
        <>
            <div className='instructor-dash-column-alt'>

                <div className='instructions-bubble instructions-header'>
                    Creation instructions
                </div>

                <div className='instructions-bubble'>
                    <div>

                    First, ensure you have a student group <span className='highlighter-green'>with students</span>.
                    </div>
                    
                    <div>

                    If you don't
                    have a group, or the group doesn't have students, create a group with
                    a <span className='highlighter-green'>unique</span> name and/or populate your group with students, then proceed.
                    </div>
                </div>

                <div className='instructions-bubble'>
                    <div>

                    <span className='highlighter-orange'>Note</span>: It is important that both this name and the scenario name you choose later <span className='highlighter-green'>are not</span> the same as another in your database.
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
                        Then, type in a <span className='highlighter-green'>unique</span> name for your scenario.
                        
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

                    <span className='highlighter-orange'>IMPORTANT</span>:  Currently, students <span className='highlighter-green'>who have not been added at the time of scenario creation </span> 
                    may not be able to access the scenario, so it is important to add users to the group associated w/ the scenario <span className='highlighter-green'>before</span> you create the scenario.
                    </div>
                    <div>If you want to add students to a group, <span className='highlighter-green'> and the scenario is already created</span>, it is a good idea to stop, then destroy the old scenario, and create a new scenario for your updated group.</div>
                </div>
                
            </div>
        </>
    );
}
export default Creation_Instructions;