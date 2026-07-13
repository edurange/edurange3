import React from 'react';
import '@assets/css/logs-improved.css';

function LogCellModal({ title, subtitle, content, onClose }) {
    if (content == null) return null;
    return (
        <div className='logCellModal-backdrop' onClick={onClose}>
            <div className='logCellModal-frame' onClick={e => e.stopPropagation()}>
                <div className='logCellModal-close' onClick={onClose}>&times;</div>
                <div className='logCellModal-header'>
                    <div className='logCellModal-title'>{title}</div>
                    {subtitle && <div className='logCellModal-subtitle'>{subtitle}</div>}
                </div>
                <pre className='logCellModal-body'>{content}</pre>
            </div>
        </div>
    );
}

export default LogCellModal;