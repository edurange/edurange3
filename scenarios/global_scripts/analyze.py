#!/usr/bin/python

# This code produces a CSV file for user interventions with the following columns
# CMBEGIN - fixed value
# node name
# epoch timestamp
# user home directory
# input command that the user has typed
# output, enclosed in % characters, could be multi-line
# username@node

# pswish changelog, v2.0:
    # Combined all separate files created during refactoring (v1.2) into one script due to complication of build process
    # Added 94 pytests to cover 100% of this script
    # Modifed some functions to be more testable

import csv
import os
import re
import sys
import string
import time
import datetime

import logging.handlers

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Set up logger to a file
file_handler = logging.handlers.RotatingFileHandler('/tmp/acont.log', maxBytes=1048576, backupCount=5)

# Create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

class LogAnalyzerMain:
    def __init__(self) -> None:
        # Get the unique id dictionary. This dictionary will be used to uniquely identify a row in CSV file
        self.ttylog_sessions = {}
        self.known_prompts = []
        self.root_home_dir = '/root'
        self.exit_flag = False
        self.ttylog_seek_pointer = 0
        self.skip_reading_in_first_iteration = True
        self.ttylog_lines_read_next = []
        self.ttylog_lines = []
        self.output_txt = ''
        self.helper = Analyzer_helper()
        self.unique_id_dict = self.helper.get_unique_id_dict()
        self.ttylog_lines_from_file = []

    def get_ttylog_init(self):
        # This function is used to get the initial ttylog file path and output CSV file path from command line arguments

        try:
            # The input ttylog file path is stored in 'ttylog'
            ttylog = sys.argv[1]
            # The output CSV file path is stored in 'csv_output_file'
            self.csv_output_file = sys.argv[2]

            # Check if the provided paths exist and are valid files. If not, log an error and exit.
            if not os.path.isfile(ttylog):
                logger.critical("file path invalid, aborting. Please adjust and try again.")
                exit(1)
            
            if not ttylog:
                logger.critical("ttylog path is required.")
                exit(1)

            if not self.csv_output_file:
                logger.critical("csv_output_file path is required.")
                exit(1)
        
        except IndexError:
            logger.critical("Please provide the input ttylog file path and output CSV file path as command line arguments.")
            exit(1)

        except FileNotFoundError:
            logger.critical("ttylog file '{}' not found.".format(ttylog))
    
        # Store ttylog into self to use later in the class
        self.ttylog = ttylog  

    def get_ttylog_lines_and_bytes(self):
        # This function reads the ttylog file and retrieves the lines and pointer.
        self.ttylog_lines_from_file, self.ttylog_bytes_read = self.helper.get_ttylog_lines_from_file(self.ttylog, self.ttylog_seek_pointer)
        self.ttylog_seek_pointer += self.ttylog_bytes_read

    def enumerate_ttylog(self) -> None:
        # This function iterates through the ttylog lines and processes them based on their type.
        for count, line in enumerate(self.ttylog_lines_from_file):
            if self._parse_session_start(count, line):
                continue
            if self._parse_user_prompt(line):
                continue
            if self._parse_home_directory(count, line):
                break

    def _parse_session_start(self, count: int, line: str) -> bool:
        # This function processes the start of a new session in the TTY log.
        SESSION_START_PATTERN = r'starting session w tty_sid:\d+$'
        if 'starting session w tty_sid' in line:
            index_start = line.find('starting session w tty_sid')
            if index_start == 0:
                if re.match(SESSION_START_PATTERN, line):
                    session_id = line.split()[-1]
                    if session_id not in self.ttylog_sessions:
                        self.ttylog_sessions[session_id] = {'lines': []}
                        self.current_session_id = session_id
                    return True
            elif index_start > 0:
                next_line = line[index_start:]
                line = line[:index_start]
                self.ttylog_lines_from_file.insert(count + 1, next_line)
        return False
    
    def _parse_user_prompt(self, line: str) -> bool:
        # This function processes the user prompt in the TTY log.
        USER_PROMPT_PATTERN = r'^User prompt is '
        if re.match(USER_PROMPT_PATTERN, line):
            self.user_initial_prompt = line.split()[-1]
            self.user_prompt = self.user_initial_prompt
            self.ttylog_sessions[self.current_session_id]['initial_prompt'] = self.user_prompt
            self.node_name = line.split('@')[-1]
            self.root_prompt = 'root@{}'.format(self.node_name)
            self.is_current_prompt_root = False
            return True
        return False

    def _parse_home_directory(self, count: int, line: str) -> bool:
        # This function processes the home directory in the TTY log.
        if 'Home directory is' in line:
            self.home_directory = line.split()[-1]
            self.ttylog_sessions[self.current_session_id]['home_dir'] = self.home_directory
            self.first_ttylog_line = True
            break_counter = count + 1
            self.ttylog_lines_from_file = self.ttylog_lines_from_file[break_counter:]
            return True
        return False

    def get_host_names(self):
        # Read the host_names file and construct a regex pattern for possible hosts
        user_initial_prompt = self.user_initial_prompt
        try:
            with open('/usr/local/src/ttylog/host_names', 'r') as file:
                nodes = file.read().splitlines()
            self.host_pattern = '({})'.format('|'.join(n for n in nodes))

            for node in nodes:
                self.known_prompts.append('{}@{}'.format(user_initial_prompt.split('@')[0], node))

        except FileNotFoundError:
            user_prompt = '{}@nat'.format(user_initial_prompt.split('@')[0])
            self.known_prompts.append(user_prompt)
            self.known_prompts.append('{}@FirstStop'.format(user_initial_prompt.split('@')[0]))
            self.host_pattern = "(nat|firststop)"
            logger.error("Failed to read host_names file")
        except Exception as e:
            logger.error("An error occurred: {}".format(e))

    
    def loop_function(self):
        # This function is the main loop that reads the ttylog file, processes the lines, and generates the CSV output.
        ttylog = self.ttylog
        root_prompt = self.root_prompt
        user_prompt = self.user_prompt
        current_session_id = self.current_session_id
        home_directory = self.home_directory
        csv_output_file = self.csv_output_file

        try:
            while not self.exit_flag:
                # Skip reading ttylog in the first iteration
                if not self.skip_reading_in_first_iteration:
                    self.ttylog_lines_from_file, ttylog_bytes_read = self.helper.get_ttylog_lines_from_file(ttylog, self.ttylog_seek_pointer)
                    self.ttylog_seek_pointer += ttylog_bytes_read

                if self.skip_reading_in_first_iteration:
                    self.skip_reading_in_first_iteration = False

                self.ttylog_lines_to_decode, self.ttylog_lines_read_next = self.helper.get_ttylog_lines_to_decode(self.ttylog_lines_read_next, self.ttylog_lines_from_file, self.known_prompts, root_prompt)
                if len(self.ttylog_lines_to_decode) == 0:
                    time.sleep(0.1)
                    continue

                # This does the heavy lifting
                # ttylog_lines = decode.decode(self.ttylog_lines_to_decode, user_prompt, root_prompt)
                ttylog_lines = Analyzer_helper.decode(self.ttylog_lines_to_decode, user_prompt, root_prompt)

                for line in ttylog_lines:
                    line = self._process_line(line)

                    if self._is_prompt(line):
                        isinput, line, user_prompt, node_name, current_working_directory, current_line_prompt = self._handle_prompt(line, user_prompt, root_prompt, home_directory, current_session_id)
                    else:
                        isinput = False

                    line_timestamp, line = self._extract_timestamp(line)

                    my_timestamp = int(time.time())

                    if isinput:
                        self._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)
                    elif not self._is_end(line):
                        self.output_txt += '\n' + line
                    else:
                        self._save_output(csv_output_file, current_session_id)
                    self.first_ttylog_line = False
                time.sleep(0.1)

                if self.exit_flag:
                    exit(0)
        except IndexError as i:
            logger.error("Index error: %s", i)
            self.loop_function()
        except Exception as e:
            logger.error("Error in the loop function %s",e) # not specific enough


    def _process_line(self, line):
        # Remove command output, prompts, and user input symbols
        line = re.sub(r'.*\^C', '', line)
        return line

    def _is_prompt(self, line):
        # Check if the line is a prompt
        command_pattern_user_prompt = re.compile("{}@{}:.*?".format(self.user_initial_prompt.split('@')[0].casefold(), self.host_pattern))
        command_pattern_root_prompt = re.compile("{}:.*?".format(self.root_prompt.casefold()))
        user_match = command_pattern_user_prompt.search(line.casefold()) or command_pattern_root_prompt.search(line.casefold())
        if user_match:
            matched_string = user_match.group()
            self.current_user = matched_string.strip(':')
        return command_pattern_user_prompt.search(line.casefold()) or command_pattern_root_prompt.search(line.casefold())

    def _handle_prompt(self, line, user_prompt, root_prompt, home_directory, current_session_id):
        isinput = True

        if re.search(r"{}@.*?:.*?#".format(root_prompt.casefold()), line.casefold()):
            try:
                left_hash_part, right_hash_part = line.split('#', 1)
                current_line_prompt = left_hash_part
                node_name = left_hash_part.split('@')[-1].split(':')[0]
                current_working_directory = left_hash_part.split(':', 1)[-1].replace('~', self.root_home_dir, 1)
                line = right_hash_part
            except ValueError:
                raise ValueError("Invalid root prompt format")
        elif '$' in line:
            try:
                left_dollar_part, right_dollar_part = line.split('$', 1)
                current_line_prompt = left_dollar_part
                node_name = left_dollar_part.split('@')[-1].split(':')[0]
                current_working_directory = left_dollar_part.split(':', 1)[-1].replace('~',
                    self.ttylog_sessions.get(current_session_id, {}).get('home_dir', home_directory), 1)
                line = right_dollar_part
            except ValueError:
                raise ValueError("Invalid user prompt format")
        else:
            raise ValueError("Invalid prompt format")

        return isinput, line.strip(), user_prompt, node_name, current_working_directory, current_line_prompt.strip()

    def _extract_timestamp(self, line):
        # Extract timestamp from the line
        tstampre = re.compile(r";\d{9}")
        tmatch = tstampre.search(line)
        if tmatch:
            indexts = tstampre.search(line)
            line_timestamp = line[indexts.span()[0] + 1:indexts.span()[1] + 1]
            line = line[:indexts.span()[0]]
        else:
            line_timestamp = 0
        return line_timestamp, line

    def _handle_input(self, line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt):
        # Handle user input and update the CSV output
        input_cmd = line
        user_prompt =  self.current_user  # this changes user_prompt to the matched results
        self.unique_id_dict['counter'] += 1
        unique_row_id = "{}:{}:{}".format(self.unique_id_dict['exp_name'], self.unique_id_dict['start_time'], self.unique_id_dict['counter'])

        if not self.first_ttylog_line:
            self._save_output(self.csv_output_file, self.current_session_id)

        # new_line sets each csv line
        new_line = {
            'id': unique_row_id,
            'timestamp': my_timestamp,
            'output': "",
            'node_name': node_name,
            'node_name1': node_name, # for example testing
            'cwd': current_working_directory,
            'cmd': input_cmd,
            'prompt': current_line_prompt,
            'username': user_prompt,
            
            # Add any additional fields you want to capture here, then add to write_to_csv function
        }
        self.ttylog_sessions[self.current_session_id]['lines'].append(new_line)

        logger.info("Found input {}\n".format(input_cmd))

        self.output_txt = '' # Without this, the csv output changes big time.

    def _is_end(self, line):
        # Check if the line is the end of a session
        return 'END tty_sid' in line

    def _save_output(self, csv_output_file, current_session_id):
        # Write the current session's output to the CSV file

        if len(self.output_txt) > 500:
            self.output_txt = self.output_txt[:500]

        cline = len(self.ttylog_sessions[current_session_id]['lines']) - 1
        if cline >= 0:
            self.ttylog_sessions[current_session_id]['lines'][cline]['output'] = self.output_txt
            self.helper.write_to_csv(self.ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)

            logger.info("Logged input {}\n".format(self.ttylog_sessions[current_session_id]['lines'][cline]['cmd']))
            logger.info("Logged output {}\n".format(self.ttylog_sessions[current_session_id]['lines'][cline]['output']))

class Analyzer_helper:
    # The decode function processes a list of strings (lines) to handle and clean up various terminal control characters and escape sequences, reconstructs multi-line commands, and deals with timestamps. '''

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
            length_before_carriage_return = -1  # Length before encounterina carriage return
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
            timestamp_index = Analyzer_helper.starting_index_timestamp(line)
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
                        next_timestamp_index = Analyzer_helper.starting_index_timestamp(lines[start_ind])
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

    def starting_index_timestamp(line):
        # Return the index where the timestamp starts, in a line. If timestamp does not exist, return None
        reg_expr_end_timestamp = re.compile(';[0-9]+$')
        res = reg_expr_end_timestamp.search(line)
        if res is not None:
            return res.span()[0]
        else:
            return None
        
    def get_ttylog_lines_from_file(self, ttylog, ttylog_seek_pointer):
        # Read from ttylog. If lines have '\r' at end, remove that '\r'. Return the read lines
        ttylog_file = open(ttylog,'r',errors='ignore', newline='\n')
        ttylog_file.seek(ttylog_seek_pointer)
        ttylog_read_data = ttylog_file.read()
        ttylog_file.close()
        ttylog_bytes_read = len(ttylog_read_data)
        ttylog_lines_file = []

        # If nothing new is there to read, return
        if ttylog_bytes_read == 0:
            return ttylog_lines_file, ttylog_bytes_read
        
        # Replace escaped double qoutes with qoutes
        ttylog_read_data = ttylog_read_data.replace(r'\"','"')
        ttylog_lines = ttylog_read_data.split('\n')

        for line in ttylog_lines:
            line = line.replace('\x00','')
            if len(line) > 0:
                if line[-1] == '\r':
                    ttylog_lines_file.append(line[:-1])
                else:
                    ttylog_lines_file.append(line)
            else:
                ttylog_lines_file.append(line)

        return ttylog_lines_file, ttylog_bytes_read
    
    def get_ttylog_lines_to_decode(self, ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt):
        # Return two lists
        # The first list contains the ttylog lines that should be read in next iteration of infinite loop.
        # The second list contain the ttylog lines that should be docded in current iteration of infinite loop.

        if len(ttylog_lines_from_file) == 0:
            return [], ttylog_lines_read_next

        elif len(ttylog_lines_from_file) >= 1:
            if len(ttylog_lines_read_next) > 0:
                ttylog_lines_read_next[-1] += ttylog_lines_from_file[0]
                if len(ttylog_lines_from_file) > 1:
                    ttylog_lines_read_next.extend(ttylog_lines_from_file[1:])
            else:
                ttylog_lines_read_next.extend(ttylog_lines_from_file)

        index_ttylog_lines_file = None
        line_prompt_end_index = -1
        line_to_append = ''
        current_root_prompt = current_root_prompt.casefold()

        # When we get two user prompts in ttylog_lines_read_next, we add all the lines from first user prompt to second user prompt to ttylog_lines_to_decode.
        # Second user prompt line is not inclusive
        no_of_prompts_in_ttylog_read_next = 0

        # Make a Reverse copy of the ttylog_lines_from_file list
        ttylog_next_reverse = ttylog_lines_read_next[::-1]
        for count, line in enumerate(ttylog_next_reverse):
            if r'END tty_sid' in line:
                ttylog_lines_to_decode = ttylog_lines_read_next[::]
                ttylog_lines_read_next = []
                return ttylog_lines_to_decode, ttylog_lines_read_next
            elif any(p.casefold() in line.casefold() for p in known_prompts):
                no_of_prompts_in_ttylog_read_next += 1
                # Break the loop of no_of_prompts >= 2
                if no_of_prompts_in_ttylog_read_next >= 2:
                    break

                # Get index of this line in ttylog_lines_file
                index_ttylog_lines_file = len(ttylog_lines_read_next) - 1 - count

                # Find the last user prompt. Get data starting from 0th index to ending of last user prompt from the line
                for p in known_prompts:
                    if (line.casefold().rfind(p.casefold()) > -1):
                        line_prompt_end_index = line.casefold().rfind(p.casefold())
                        line_prompt_end_index = line_prompt_end_index + len(p.casefold())
                        break
                line_to_append = line[:line_prompt_end_index]

        if index_ttylog_lines_file is not None and no_of_prompts_in_ttylog_read_next >= 2:

            ttylog_lines_to_decode = ttylog_lines_read_next[:index_ttylog_lines_file]

            # Add the line containing user/root prompt to ttylog_lines_to_decode so that the most recently executed command can be parsed.
            # The characters from 0th index till ending of last user prompt is included is contained in line_to_append
            if len(line_to_append) > 0:
                ttylog_lines_to_decode.append(line_to_append)

            ttylog_lines_read_next = ttylog_lines_read_next[index_ttylog_lines_file:]
            return ttylog_lines_to_decode, ttylog_lines_read_next

        else:
            return [], ttylog_lines_read_next

    def write_to_csv(self, data, csv_output_file):
        # Write data to a CSV file.
        try:
            with open(csv_output_file, 'a', newline='') as csvfile:


                #Header logic
                fieldnames = ['id', 'username', 'timestamp', 'scenario', 'data', 'cmd', 'output' ]
                csvreader = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                if csvfile.tell() == 0:
                    csvreader.writeheader()

                # Write rows in specific order to csv, change or add to modify output to csv
                # Specific delimeter and quote character
                csvwriter = csv.writer(csvfile, delimiter=',', quotechar='%', quoting=csv.QUOTE_MINIMAL)
                csvwriter.writerow([data['id'], data['username'], data['timestamp'], data['node_name'], data['cwd'], data['cmd'], data['output'], ])
                logging.info("Data written to CSV: %s", data)
        except Exception as e:
            logging.error("Failed to write to CSV: %s", e)

    def save_output_remainder(self, ttylog_sessions, output_txt, csv_output_file, current_session_id, logger):
        
        # End, save what we can
        if len(output_txt) > 500:
            output_txt = output_txt[:500]

        cline = len(ttylog_sessions[current_session_id]['lines']) - 1
        if cline >=0:
            ttylog_sessions[current_session_id]['lines'][cline]['output'] = output_txt
            self.write_to_csv(ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)
            
            logger.info("Logged input "+ttylog_sessions[current_session_id]['lines'][cline]['cmd']+"\n")
            logger.info("Logged output "+ttylog_sessions[current_session_id]['lines'][cline]['output']+"\n")

    def get_unique_id_dict(self):
        # Return a dictonary containing information about the unique ID that will be inserted in every row in output CSV
        unique_id_dict = {
            'counter':-1,
            'start_time':round(datetime.datetime.now().timestamp())
        }

        # Get the experiment name
        try:
            with open(r'/var/emulab/boot/nickname','r') as file_handle:
                file_data = file_handle.read().splitlines()[0]
                node, exp_name, proj_name = file_data.split('.')
        except (FileNotFoundError, PermissionError) as e:
            exp_name = 'edulog'
        finally:
            unique_id_dict['exp_name'] = exp_name

        return unique_id_dict


def main():
    analyze = LogAnalyzerMain()

    analyze.get_ttylog_init()
    analyze.get_ttylog_lines_and_bytes()
    analyze.enumerate_ttylog()
    analyze.get_host_names()
    analyze.loop_function()

if __name__ == '__main__':
    main()
