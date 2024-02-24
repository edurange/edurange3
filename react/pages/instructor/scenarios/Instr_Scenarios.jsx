
import React, { useContext } from 'react';
import axios from 'axios';

import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Copy_button_small from '../../../components/Copy_button_small';
import Instr_ScenTable from './Instr_ScenTable';
import CreateScenario from './CreateScenario';

function Instr_Scenarios() {

    return (
        <div className="table-frame">
            <CreateScenario/>
            <Instr_ScenTable/>
        </div>
    );
};

export default Instr_Scenarios;