#!/usr/bin/python

# This code produces a CSV file for user interventions with the following columns
# CMBEGIN - fixed value
# node name
# epoch timestamp
# user home directory
# input command that the user has typed
# output, enclosed in % characters, could be multi-line
# username@node

# pswish changelog, v1.2:
    # Added logging.
    # Added a class to manage the functions.
    # Split serial methods into functions.
    # Loop function was way to long, split it into smaller functions.
    # BUG fixed: 'NAT' was what I manually added to my known_hosts file but 'nat' was required in get_ttylog_lines_to_decode.
    # Moved decode() to a module, added comments explaining it does.

import analyze_config as config
import decode as decode
import logging
import os
import re
import sys
import time

from analyzer_methods import write_to_csv, get_unique_id_dict, get_ttylog_lines_from_file, get_ttylog_lines_to_decode

logger = logging.getLogger()

# Set up logger to a file
file_handler = logging.FileHandler('logfile.log') # /tmp/acont.log
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

    
class LogAnalyzerMain:
    def __init__(self) -> None:
        # Get the unique id dictionary. This dictionary will be used to uniquely identify a row in CSV file
        self.unique_id_dict = get_unique_id_dict()
        self.ttylog_sessions = config.ttylog_sessions
        self.known_prompts = config.known_prompts
        self.root_home_dir = config.root_home_dir
        self.exit_flag = config.exit_flag
        self.ttylog_seek_pointer = config.ttylog_seek_pointer
        self.skip_reading_in_first_iteration = config.skip_reading_in_first_iteration
        self.ttylog_lines_read_next = config.ttylog_lines_read_next
        self.ttylog_lines = config.ttylog_lines
        self.output_txt = config.output_txt

    def get_ttylog_init(self):
        # This function is used to get the initial ttylog file path and output CSV file path from command line arguments

        try:
            # The input ttylog file path is stored in 'ttylog'
            ttylog = sys.argv[1]
            #The output CSV file path is stored in 'csv_output_file'
            self.csv_output_file = sys.argv[2]

            # Check if the provided paths exist and are valid files. If not, log an error and exit.
            if not os.path.isfile(ttylog):
                logger.critical("there's a problem with ttylog! aborting.")
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
            logger.critical(f"ttylog file '{ttylog}' not found.")
    
        # store ttylog into self to use later in the class
        self.ttylog = ttylog  

    def get_ttylog_lines_and_bytes(self):
        # This function reads the ttylog file and retrieves the lines and pointer.
        self.ttylog_lines_from_file, self.ttylog_bytes_read = get_ttylog_lines_from_file(self.ttylog, self.ttylog_seek_pointer)
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
            self.root_prompt = f'root@{self.node_name}'
            config.is_current_prompt_root = False
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
        # Version 1.2. this might crash the program if the file is malformed
        user_initial_prompt = self.user_initial_prompt
        try:
            with open('/usr/local/src/ttylog/host_names', 'r') as file:
                nodes = file.read().splitlines()
            self.host_pattern = '(' + '|'.join(n for n in nodes) + ')'

            for node in nodes:
                self.known_prompts.append(user_initial_prompt.split('@')[0] + '@' + node)

        except FileNotFoundError:
            user_prompt = user_initial_prompt.split('@')[0] + '@nat'
            self.known_prompts.append(user_prompt)
            self.known_prompts.append(user_initial_prompt.split('@')[0] + '@FirstStop')
            self.host_pattern = "(nat|firststop)"
            logger.error("Failed to read host_names file")
        except Exception as e:
            logger.error(f"An error occurred: {e}")

    
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
                    self.ttylog_lines_from_file, ttylog_bytes_read = get_ttylog_lines_from_file(ttylog, self.ttylog_seek_pointer)
                    self.ttylog_seek_pointer += ttylog_bytes_read

                if self.skip_reading_in_first_iteration:
                    self.skip_reading_in_first_iteration = False

                self.ttylog_lines_to_decode, self.ttylog_lines_read_next = get_ttylog_lines_to_decode(self.ttylog_lines_read_next, self.ttylog_lines_from_file, self.known_prompts, root_prompt)
                if len(self.ttylog_lines_to_decode) == 0:
                    time.sleep(0.1)
                    continue

                # This does the heavy lifting
                ttylog_lines = decode.decode(self.ttylog_lines_to_decode, user_prompt, root_prompt)

                for line in ttylog_lines:
                    line = self.process_line(line)

                    if self.is_prompt(line):
                        isinput, line, user_prompt, node_name, current_working_directory, current_line_prompt = self.handle_prompt(line, user_prompt, root_prompt, home_directory, current_session_id)
                    else:
                        isinput = False

                    line_timestamp, line = self.extract_timestamp(line)

                    my_timestamp = int(time.time())

                    if isinput:
                        self.handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt)
                    elif not self.is_end(line):
                        self.output_txt += '\n' + line
                    else:
                        self.save_output(csv_output_file, current_session_id)
                    self.first_ttylog_line = False
                time.sleep(0.1)

                if self.exit_flag:
                    exit(0)
        except Exception as e:
            logger.error(e)

    def process_line(self, line):
        # Remove command output, prompts, and user input symbols
        line = re.sub('.*\^C', '', line)
        return line

    def is_prompt(self, line):
            # Check if the line is a prompt
            command_pattern_user_prompt = re.compile(f"{self.user_initial_prompt.split('@')[0].casefold()}@{self.host_pattern}:.*?")
            command_pattern_root_prompt = re.compile(f"{self.root_prompt.casefold()}:.*?")
            return command_pattern_user_prompt.search(line.casefold()) or command_pattern_root_prompt.search(line.casefold())

    def handle_prompt(self, line, user_prompt, root_prompt, home_directory, current_session_id):
        # Handle different prompts and extract relevant information
        isinput = True

        if re.search(f"{root_prompt.casefold()}:.*?", line.casefold()):
            left_hash_part, right_hash_part = line.split('#', 1)
            current_line_prompt = left_hash_part
            node_name = left_hash_part.split('@')[-1].split(':')[0]
            current_working_directory = left_hash_part.split(':', 1)[-1].replace('~', self.root_home_dir, 1)
            line = right_hash_part[1:]
        else:
            left_dollar_part, right_dollar_part = line.split('$', 1)
            current_line_prompt = left_dollar_part
            node_name = left_dollar_part.split('@')[-1].split(':')[0]
            current_working_directory = left_dollar_part.split(':', 1)[-1].replace('~', self.ttylog_sessions[current_session_id]['home_dir'], 1)
            line = right_dollar_part[1:]

        return isinput, line, user_prompt, node_name, current_working_directory, current_line_prompt

    def extract_timestamp(self, line):
        # Extract timestamp from the line
        tstampre = re.compile(";\d{9}")
        tmatch = tstampre.search(line)
        if tmatch:
            indexts = tstampre.search(line)
            line_timestamp = line[indexts.span()[0] + 1:indexts.span()[1] + 1]
            line = line[:indexts.span()[0]]
        else:
            line_timestamp = 0
        return line_timestamp, line

    def handle_input(self, line, my_timestamp, node_name, current_working_directory, current_line_prompt):
        # Handle user input and update the CSV output
        input_cmd = line
        self.unique_id_dict['counter'] += 1
        unique_row_id = "{}:{}:{}".format(self.unique_id_dict['exp_name'], self.unique_id_dict['start_time'], self.unique_id_dict['counter'])

        if not self.first_ttylog_line:
            self.save_output(self.csv_output_file, self.current_session_id)

        new_line = {
            'id': unique_row_id,
            'timestamp': my_timestamp,
            'output': "",
            'node_name': node_name,
            'cwd': current_working_directory,
            'cmd': input_cmd,
            'prompt': current_line_prompt
        }
        self.ttylog_sessions[self.current_session_id]['lines'].append(new_line)

        logger.info("Found input " + input_cmd + "\n")

        self.output_txt = ''

    def is_end(self, line):
        # Check if the line is the end of a session
        return 'END tty_sid' in line

    def save_output(self, csv_output_file, current_session_id):
        # Write the current session's output to the CSV file

        if len(self.output_txt) > 500:
            self.output_txt = self.output_txt[:500]

        cline = len(self.ttylog_sessions[current_session_id]['lines']) - 1
        if cline >= 0:
            self.ttylog_sessions[current_session_id]['lines'][cline]['output'] = self.output_txt
            write_to_csv(self.ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)
            logger.info("Logged input " + self.ttylog_sessions[current_session_id]['lines'][cline]['cmd'] + "\n")
            logger.info("Logged output " + self.ttylog_sessions[current_session_id]['lines'][cline]['output'] + "\n")


def main():
    # Initialize the LogAnalyzerMain class and run the main loop
    analyze = LogAnalyzerMain()

    analyze.get_ttylog_init()
    analyze.get_ttylog_lines_and_bytes()
    analyze.enumerate_ttylog()
    analyze.get_host_names()
    analyze.loop_function()

if __name__ == '__main__':
    # Run the main function
    main()