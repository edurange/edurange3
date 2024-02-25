
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/css/tables.css';
import { Instr_DashContext } from './Instr_Dash';

// work in progress; meant to be polymorphic / generic

function Table({ columnData, rowData, use_crud }) {
    const navigate = useNavigate();
    const { scenarios_state, set_scenarioDetail_state } = useContext(Instr_DashContext);

    function handleDetailClick(scenario_index) {
        const currentMeta = scenarios_state[scenario_index];
        set_scenarioDetail_state(currentMeta);
    }

    if (!scenarios_state) {return <></>;}

    return (
        <div className="table-frame">
            <div className="table-header">
                {columnData.map((column) => (
                    <div key={column.label} className={`table-cell-item ${column.css_class}`}>
                        {column.label}
                    </div>
                ))}
            </div>
            {rowData.map((row, index) => (
                <div className="table-row" key={index} onClick={() => handleDetailClick(index)}>
                        {columnData.map((column) => {
                            // Dynamically access row data based on column label
                            const rowDataKey = column.label.toLowerCase();
                            return (
                                <div key={column.label + row.id} className={`table-cell-item ${column.css_class}`}>
                                    {row[rowDataKey]}
                                    {use_crud ? (<>CRUD STUFF HERE</>) : (<></>)}
                                </div>
                            );
                        })}
                </div>
            ))}
        </div>
    );
}
export default Table;