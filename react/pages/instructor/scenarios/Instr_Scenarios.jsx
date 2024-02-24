
import React from 'react';
import Instr_ScenTable from './Instr_ScenTable';
import CreateScenario from './CreateScenario';
import '@assets/css/tables.css';

function Instr_Scenarios() {

    return (
        <div className="table-frame">
            <CreateScenario/>
            <Instr_ScenTable/>
        </div>
    );
};

export default Instr_Scenarios;