
import re
import string
import re

from analyzer_methods import starting_index_timestamp

'''
The decode function processes a list of strings (lines) to handle and clean up various terminal control characters and escape sequences, 
reconstructs multi-line commands, and deals with timestamps. 

It aims to produce a more readable and coherent list of strings by following these steps:

    Initialization:
        It initializes various regex patterns to detect different types of escape sequences.
        Sets up an empty buffer (buf) to store processed lines.

    Line Processing Loop:
        For each line, it checks for and removes OSC (Operating System Command) escape sequences.
        It detects if the line contains user or root prompts and splits the line accordingly to handle multi-line commands.
        Extracts timestamps from lines if present.

    Handling Multi-Line Commands:
        It combines lines for commands that span multiple lines (commonly seen with command line editors like vim, nano, etc.).

    Character Processing Loop:
        Iterates through each character in the line.
        Handles control characters like bell (\x07), carriage return (\r), backspace (\x08), and various escape sequences starting with \x1b[ (CSI sequences).
        Adjusts the cursor position and updates the buffer based on the control characters and escape sequences encountered.
        Constructs the final string for each line in the buffer.

    Final Assembly:
        Joins the processed characters into a single string for each line.
        Appends any extracted timestamps to the processed line.

    Return Result:
        Returns the buffer containing the cleaned and processed lines.
'''

def decode(lines, current_user_prompt, current_root_prompt):
    # Return an empty list if no lines are provided
    if len(lines) == 0:
        return []

    # Dictionary of regex patterns for various escape sequences
    escape_sequence_dict = {
        'osc_reg_expr': re.compile(r'\x1B][0-9]*;[\x20-\x7e]*\x07'),
        'csi_cursor_position': re.compile(r'^[0-9]*;?[0-9]*H'),
        'csi_dec_private_mode_set': re.compile(r'^\?(?:[0-9]*;?)*h'),
        'csi_dec_private_mode_reset': re.compile(r'^\?(?:[0-9]*;?)*l'),
        'csi_character_attributes': re.compile(r'^(?:[0-9]*;?)*m'),
        'csi_window_manipulation': re.compile(r'^[0-9]*(?:;[0-9]*){2}t'),
        'csi_delete_n_chars': re.compile(r'^\d*P'),
        'csi_tab': re.compile(r'23@'),
        'csi_ctrlc': re.compile(r'.*\^C.*'),
        'csi_cursor_up': re.compile(r'^\d*A'),
        'controls_c1_esc_single_char': re.compile(r'^[6789=>Fclmno|}~]')
    }

    buf = [] # buffer to hold processed lines
    i_line = 0 # Line index for the buffer
    decode_line_timestamp = ''  # Variable to hold the timestamp for each decoded line
    current_user_prompt = current_user_prompt.casefold()
    current_root_prompt = current_root_prompt.casefold()

    for count, line in enumerate(lines):
        line = str(line)  # Ensure line is treated as a string
        i_stream_line = 0  # Index for the current character in the line being processed
        cursor_pointer = 0  # Cursor pointer in the buffer line
        length_before_carriage_return = -1  # Lenght before encounterina carriage return
        encountered_carriage_return = False  # Flag to indicate whether a carriage return has been encountered
        buf.append([])  # initialize a new buffer line

        # Remove escape sequences from the line
        if escape_sequence_dict['osc_reg_expr'].findall(line):
            line = escape_sequence_dict['osc_reg_expr'].sub('', line)

        # Split the line if it contains a user or root prompt
        if (line.casefold().find(current_user_prompt) > 0) or (line.casefold().find(current_root_prompt) > 0):
            if (line.casefold().find(current_user_prompt) > 0):
                line_prompt_index = line.casefold().find(current_user_prompt)
            elif (line.casefold().find(current_root_prompt) > 0):
                line_prompt_index = line.casefold().find(current_root_prompt)
            next_line = line[line_prompt_index:]
            line = line[:line_prompt_index]
            lines.insert(count + 1, next_line)

        # Extract and remove timestamp from the line
        timestamp_index = starting_index_timestamp(line)
        if timestamp_index is not None:
            decode_line_timestamp = line[timestamp_index:]
            line = line[:timestamp_index]

        # Handle multi-line commands for command line editors
        if (len(current_user_prompt) > 0 or len(current_root_prompt) > 0) and (
                (line.casefold().find(current_user_prompt) == 0) or (line.casefold().find(current_root_prompt) == 0)) and timestamp_index is None and (count < len(lines) - 1):
            command_line_editors = ['vim', 'vi', 'nano', 'pico', 'emacs']
            Found = False
            for command_line_editor in command_line_editors:
                editor_position = line.find(command_line_editor)
                if editor_position > -1:
                    Found = True
            if not Found:
                start_ind = count + 1
                while start_ind < len(lines):
                    next_timestamp_index = starting_index_timestamp(lines[start_ind])
                    next_line = lines[start_ind]
                    if next_timestamp_index is not None:
                        decode_line_timestamp = next_line[next_timestamp_index:]
                        next_line = next_line[:next_timestamp_index]
                        line += next_line
                        lines.pop(start_ind)
                        break
                    else:
                        line += next_line
                        lines.pop(start_ind)

        len_line = len(line)
        while i_stream_line < len_line:
            if line[i_stream_line] == '\x07':
                i_stream_line += 1  # bell character, skip it
            elif line[i_stream_line] == '\r':
                i_stream_line += 1  # carriage return, skip it
                encountered_carriage_return = True
            elif line[i_stream_line] == '\x08':
                if cursor_pointer > 0:
                    cursor_pointer -= 1  # Backspace, move cursor back
                i_stream_line += 1
            elif line[i_stream_line] == '\x1b' and line[i_stream_line + 1] == '[':
                i_stream_line += 2  # Start of an escape sequence
                if i_stream_line >= len_line:
                    break

                if line[i_stream_line] == 'K' or (line[i_stream_line] in string.digits and line[i_stream_line + 1] == 'K'):
                    n = int(line[i_stream_line]) if line[i_stream_line] in string.digits else 0
                    if n == 0:
                        buf[i_line] = buf[i_line][:cursor_pointer]  # Clear from cursor to end of line
                    elif n == 1:
                        buf[i_line] = buf[i_line][cursor_pointer:]  # Clear from start to cursor
                        cursor_pointer = 0
                    elif n == 2:
                        buf[i_line].clear()  # Clear entire line
                        cursor_pointer = 0
                    i_stream_line += 2 if line[i_stream_line] in string.digits else 1

                elif (line[i_stream_line] == '@') or (line[i_stream_line] in string.digits and line[i_stream_line + 1] == '@'):
                    n = int(line[i_stream_line]) if line[i_stream_line] in string.digits else 1
                    i_stream_line += 2 if line[i_stream_line] in string.digits else 1

                    if encountered_carriage_return is True:
                        remaining_line = line[i_stream_line:]
                        if (remaining_line.find(current_user_prompt) == 0) or (remaining_line.find(current_root_prompt) == 0):
                            cursor_pointer = 0
                        elif cursor_pointer > 0:
                            length_before_carriage_return = cursor_pointer
                        encountered_carriage_return = False

                    i = 0
                    while i < n and i_stream_line < len_line and cursor_pointer < i_stream_line:
                        buf[i_line].insert(cursor_pointer, line[i_stream_line])
                        cursor_pointer += 1
                        i_stream_line += 1
                        i += 1

                elif (line[i_stream_line] == 'C') or (line[i_stream_line] in string.digits and line[i_stream_line + 1] == 'C'):
                    n = int(line[i_stream_line]) if line[i_stream_line] in string.digits else 1
                    cursor_pointer += n  # Move cursor forward
                    i_stream_line += 2 if line[i_stream_line] in string.digits else 1

                elif line[i_stream_line] == 'J' or (line[i_stream_line] in string.digits and (
                        (line[i_stream_line + 1] == ';' and line[i_stream_line + 2] == 'J') or (line[i_stream_line + 1] == 'J'))):
                    cursor_pointer = 0  # Clear from start to cursor
                    buf[i_line].clear()
                    if line[i_stream_line] == 'J':
                        i_stream_line += 1
                    elif line[i_stream_line] in string.digits:
                        if line[i_stream_line + 1] == ';' and line[i_stream_line + 2] == 'J':
                            i_stream_line += 3
                        elif line[i_stream_line + 1] == 'J':
                            i_stream_line += 2

                elif escape_sequence_dict['csi_delete_n_chars'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_delete_n_chars'].match(line[i_stream_line:]).span()[1]
                    n = int(line[i_stream_line:(i_stream_line + move_cursor_control_characters - 1)]) if move_cursor_control_characters > 1 else 1
                    if n >= 1:
                        buf[i_line] = buf[i_line][:cursor_pointer] + buf[i_line][cursor_pointer + n:]  # Delete n characters from cursor position to end of line
                        i_stream_line += move_cursor_control_characters

                elif escape_sequence_dict['csi_tab'].match(line[i_stream_line:]):
                    i_stream_line += 3  # Tabulation, move cursor to the next tab stop
                elif escape_sequence_dict['csi_cursor_up'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_cursor_up'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

                    if length_before_carriage_return > -1:
                        cursor_pointer -= length_before_carriage_return
                        if cursor_pointer < 0:
                            cursor_pointer = 0

                elif escape_sequence_dict['csi_cursor_position'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_cursor_position'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

                elif escape_sequence_dict['csi_character_attributes'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_character_attributes'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

                elif escape_sequence_dict['csi_window_manipulation'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_window_manipulation'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

                elif escape_sequence_dict['csi_dec_private_mode_set'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_dec_private_mode_set'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

                elif escape_sequence_dict['csi_dec_private_mode_reset'].match(line[i_stream_line:]):
                    move_cursor_control_characters = escape_sequence_dict['csi_dec_private_mode_reset'].match(line[i_stream_line:]).span()[1]
                    i_stream_line += move_cursor_control_characters

            elif line[i_stream_line] == '\x1b' and escape_sequence_dict['controls_c1_esc_single_char'].match(line[(i_stream_line + 1):]):
                i_stream_line += 2

            else:
                # Handle normal characters and carriage return effects
                if encountered_carriage_return is True:
                    remaining_line = line[i_stream_line:]
                    if (remaining_line.find(current_user_prompt) == 0) or (remaining_line.find(current_root_prompt) == 0):
                        cursor_pointer = 0
                    elif cursor_pointer > 0:
                        cursor_pointer -= 1
                        length_before_carriage_return = cursor_pointer

                    encountered_carriage_return = False

                if 0 <= cursor_pointer < len(buf[i_line]):
                    buf[i_line][cursor_pointer] = line[i_stream_line]
                    cursor_pointer += 1

                elif cursor_pointer == len(buf[i_line]):
                    buf[i_line].append(line[i_stream_line])
                    cursor_pointer += 1

                i_stream_line += 1

        buf[i_line] = ''.join(buf[i_line])  # Join buffer line into a single string
        buf[i_line] += decode_line_timestamp # Append timestamp to the line
        decode_line_timestamp = ''

        i_line += 1

    return buf  # Return the list of decoded lines
