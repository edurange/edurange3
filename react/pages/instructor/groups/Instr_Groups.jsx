
import React, { useContext } from 'react';

import '@assets/css/tables.css';
import CreateGroup from './CreateGroup';
import Instr_GroupTable from './Instr_GroupTable';

function Instr_Groups() {

    return (
        <div className="table-frame">
            <CreateGroup/>
            <Instr_GroupTable/>
        </div>
    );
};

export default Instr_Groups;