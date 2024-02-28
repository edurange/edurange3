
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/css/tables.css';

// work in progress; meant to be polymorphic / generic

function Table({ columnData, rowData, use_crud }) {

    function handleDetailClick() {
    }

    if (!columnData || !rowData) {return (<>Data missing</>)}
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