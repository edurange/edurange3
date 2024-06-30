import { nanoid } from 'nanoid'
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/css/tables.css';


function Table({ columnData, rowData, use_crud, type_value, type_label }) {

    if (!columnData || !rowData) { return (<>Data missing</>) }

    rowData.map((row) => row[type_label] = type_value)
    columnData = [{
        css_class: 'col-large',
        label: type_label
    }, ...columnData]

    return (
        <div className="table-frame">
            <div className="table-header">
                {columnData.map((column) => (
                    <>
                        <div key={column.label} className={`table-cell-item ${column.css_class}`}>
                            {column.label}
                        </div>

                    </>
                ))}
            </div>

            {rowData.map((row, index) => (
                <div className="table-row" key={index} onClick={() => handleDetailClick(index)}>

                    {columnData.map((column) => {
                        // parse row data by key of column label
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