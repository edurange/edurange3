import React, { useContext } from 'react';
import copyToClipboard from '@modules/utils/util_modules';
import './Copy_button.css';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';

function Copy_button({thingToCopy}) {

    const { clipboard_state, set_clipboard_state } = useContext(HomeRouter_context);

    function handle_copyClick(textToCopy){
        set_clipboard_state(textToCopy);
        copyToClipboard(textToCopy);
    };

    function clipboardOrCheckmark(stringToCopy) {
        if (clipboard_state === stringToCopy) {
            return (
                <div className='green-checkmark-content' >
                    <div className='green-checkmark-icon'>{edurange_icons.checkmark}</div>
                </div>
            );
        }
        else {
            return (
                <div className='ssh-copyButton-content' >
                    <div className='sshcard-icon'>{edurange_icons.clipboard_copy}</div>
                    <div className='sshcard-icon-label'>COPY</div>
                </div>
            );
        };
    };

    return (
        <div className='copyColumn-button-frame' onClick={() => handle_copyClick(thingToCopy)}>
            {clipboardOrCheckmark(thingToCopy)}
        </div>
    );
};
export default Copy_button;

