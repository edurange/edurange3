import React, { useContext } from 'react';
import copyToClipboard from '@modules/utils/util_modules';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';
import '../pages/instructor/notifications/items/TempUsers_table.css';
import './Copy_button.css';

function Copy_button_flex({ thingToCopy, textLabel, checkedLabel }) {

    const { clipboard_state, set_clipboard_state } = useContext(HomeRouter_context);

    function handle_copyClick(thingToCopy) {
        const stringThing = JSON.stringify(thingToCopy);
        set_clipboard_state(stringThing);
        copyToClipboard(stringThing);
    };

    function clipboardOrCheckmark(thingToCopy) {
        if (clipboard_state === JSON.stringify(thingToCopy)) {
            return (
                <div className='dark-green-checkmark-icon'>{edurange_icons.checkmark}</div>
            );
        }
        else {
            return (
                <div className='copyflex-content' >
                    <div className='sshcard-icon'>{edurange_icons.clipboard_copy}</div>
                </div>
            );
        };
    };
    return (
        <div className='copyall-row' onClick={() => handle_copyClick(thingToCopy)}>
            {clipboardOrCheckmark(thingToCopy)}
            {clipboard_state === JSON.stringify(thingToCopy) ? checkedLabel : textLabel}
        </div>
    );
};
export default Copy_button_flex;

