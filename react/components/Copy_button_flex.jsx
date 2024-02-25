import React, { useContext } from 'react';
import copyToClipboard from '@modules/utils/util_modules';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';
import '../pages/instructor/notifications/items/TempUsers_table.css';
import './Copy_button_flex.css';

function Copy_button_flex({ thingToCopy, textLabel, checkedLabel }) {

    const { clipboard_state, set_clipboard_state } = useContext(HomeRouter_context);

    function handle_copyClick(event, thingToCopy) {
        event.stopPropagation()
        const stringThing = JSON.stringify(thingToCopy);
        set_clipboard_state(stringThing);
        copyToClipboard(stringThing);
    };

    function clipboardOrCheckmark(thingToCopy) {
        if (clipboard_state === JSON.stringify(thingToCopy)) {
            return (
                <div className='copyflex-fix highlighter-green'>{edurange_icons.checkmark}Copied!</div>
            );
        }
        else {
            return (
                <div className='copyflex-content' >
                    {edurange_icons.clipboard_copy}
                </div>
            );
        };
    };
    return (
        <div className='copyflex-fix' onClick={(event) => handle_copyClick(event, thingToCopy)}>

        <div className='copyflex-fix' >
            {clipboardOrCheckmark(thingToCopy)}
            {clipboard_state === JSON.stringify(thingToCopy) ? (checkedLabel ?? "") : (
                <div className='basic-row'>
                    {textLabel}
                </div>
            )}
        </div>
        </div>
    );
};
export default Copy_button_flex;

