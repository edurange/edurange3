import React, { useContext } from 'react';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';
import copyToClipboard from '@modules/utils/util_modules';
import './Copy_button_small.css';

function Copy_button_small({ thingToCopy }) {

    const { clipboard_state, set_clipboard_state } = useContext(HomeRouter_context);

    function handle_copyClick(event, thingToCopy) {
        event.stopPropagation();
        set_clipboard_state(thingToCopy);
        copyToClipboard(thingToCopy);
    };

    function clipboardOrCheckmark(thingToCopy) {
        if (clipboard_state === thingToCopy) {
            return (
                <div className='copyCheck-frame' onClick={(event) => handle_copyClick(event, thingToCopy)}>
                    <div className='copyCheck-icon'>{edurange_icons.checkmark}</div>
                </div>
            );
        }
        else {
            return (
                <div className='copyButton-frame' onClick={(event) => handle_copyClick(event, thingToCopy)}>
                    <div className='copyButton-icon'>{edurange_icons.clipboard_copy}</div>
                </div>
            );
        };
    };
    return (
        <>
            {clipboardOrCheckmark(thingToCopy)}
        </>
    );
};
export default Copy_button_small;

