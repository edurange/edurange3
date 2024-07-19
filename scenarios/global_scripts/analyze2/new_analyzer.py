#!/usr/bin/python

# This code produces a CSV file for user interventions with the following columns
# CMBEGIN - fixed value
# node name
# epoch timestamp
# user home directory
# input command that the user has typed
# output, enclosed in % characters, could be multi-line
# username@node

import sys
import re
import time
import sys
import time
import re
import analyze_config as config
import logging
import os
from analyzer_methods import write_to_csv, get_unique_id_dict, get_ttylog_lines_from_file, get_ttylog_lines_to_decode, decode

logger = logging.getLogger()

# Set up logger to a file
file_handler = logging.FileHandler('logfile.log') # /tmp/acont.log
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

def starting_index_timestamp(line):
    """Return the index where the timestamp starts, in a line. If timestamp does not exist, return None"""
    match = re.search(r';\d+$, line')
    return match.start() if match else None
    
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

    def get_ttylog_init(self):  

        # The input ttylog file path is stored in 'ttylog'
        ttylog = sys.argv[1]
        #The output CSV file path is stored in 'csv_output_file'
        self.csv_output_file = sys.argv[2]
        if not os.path.isfile(ttylog):
            logger.critical("there's a problem with ttylog! aborting.")
            exit(1)

        self.ttylog = ttylog  # storing into self to use later in the class

    def get_ttylog_lines_and_bytes(self):
        self.ttylog_lines_from_file, self.ttylog_bytes_read = get_ttylog_lines_from_file(self.ttylog, self.ttylog_seek_pointer)
        self.ttylog_seek_pointer += self.ttylog_bytes_read

    def enumerate_ttylog(self,):
        for count, line in enumerate(self.ttylog_lines_from_file):

            #Get the tty_sid from first line of the session
            if r'starting session w tty_sid' in line:
                index_start = line.find(r'starting session w tty_sid')
                if index_start == 0:
                    p = re.compile(r'starting session w tty_sid:\d+$')
                    if p.match(line):
                        session_id = line.split()[-1]
                        # Check if already exists
                        if session_id in self.ttylog_sessions.keys():
                            continue
                        self.ttylog_sessions[session_id] = {}
                        self.ttylog_sessions[session_id]['lines'] = []
                        current_session_id = session_id
                        self.current_session_id = current_session_id
                        continue
                #If there is a case, 'test@client:~$ starting session w tty_sid:18', move 'starting session w tty_sid:18' to next line. This is done to get the details of the last executed command. A row in csv is written, when a prompt is encountered.
                elif index_start > 0:
                    next_line = line[index_start:]
                    line = line[:index_start]
                    self.ttylog_lines.insert(count + 1, next_line) \

            #Get the user prompt from the second line of the session
            #Same line is 'User prompt is test@intro')

            p = re.compile(r'^User prompt is ')
            if p.match(line):
                self.user_initial_prompt = (line.split()[-1])
                self.user_prompt = self.user_initial_prompt
                self.ttylog_sessions[current_session_id]['initial_prompt'] = self.user_prompt
                node_name = line.split('@')[-1]
                self.node_name = node_name
                root_prompt = 'root@' + node_name
                self.root_prompt = root_prompt
                config.is_current_prompt_root = False
                continue

            #Get the user home directory from third line of the session
            if r'Home directory is' in line:
                self.home_directory = line.split()[-1]
                self.ttylog_sessions[current_session_id]['home_dir'] = self.home_directory
                self.first_ttylog_line = True
                break_counter = count + 1
                self.ttylog_lines_from_file = self.ttylog_lines_from_file[break_counter:]
                break

        # populate the list of known_prompts, and construct a regex pattern for possible hosts
    def get_host_names(self):
        user_initial_prompt = self.user_initial_prompt
        nodes = []
        try:
            file = open('/usr/local/src/ttylog/host_names', 'r')
            nodes = file.read().splitlines()
            file.close()
            self.host_pattern = '(' + '|'.join(n for n in nodes) + ')'
            for node in nodes:
                self.known_prompts.append(user_initial_prompt.split('@')[0] + '@' + node)
        except FileNotFoundError:
            user_prompt = user_initial_prompt.split('@')[0] + '@nat'
            self.known_prompts.append(user_prompt)
            self.known_prompts.append(user_initial_prompt.split('@')[0] + '@FirstStop')
            self.host_pattern = "(nat|firststop)"
            logger.error(self.host_pattern, "Failed to read host_names file")
        
    def loop_function(self):
        ttylog = self.ttylog
        root_prompt = self.root_prompt
        user_initial_prompt = self.user_initial_prompt
        host_pattern = self.host_pattern
        user_prompt = self.user_prompt
        current_session_id = self.current_session_id
        home_directory = self.home_directory
        csv_output_file = self.csv_output_file

        try:
            while self.exit_flag == False: # was while True ... Yikes!

                # Skip reading of ttylog in first iteration of loop. The program already read ttylog file outside of loop
                if not self.skip_reading_in_first_iteration:
                    self.ttylog_lines_from_file, ttylog_bytes_read = get_ttylog_lines_from_file(ttylog, self.ttylog_seek_pointer)
                    self.ttylog_seek_pointer += ttylog_bytes_read # repeated code, necessary? without, stops at line 231 in csv

                if self.skip_reading_in_first_iteration == True:
                    self.skip_reading_in_first_iteration = False

                self.ttylog_lines_to_decode, self.ttylog_lines_read_next = get_ttylog_lines_to_decode(self.ttylog_lines_read_next, self.ttylog_lines_from_file, self.known_prompts, root_prompt)
                if len(self.ttylog_lines_to_decode) == 0:
                    time.sleep(0.1)
                    continue

                ttylog_lines = decode(self.ttylog_lines_to_decode, user_prompt, root_prompt)

                for count,line in enumerate(ttylog_lines):
                    
                    # Check for ctrl c and remove
                    rexp = re.compile('.*\^C')
                    m = rexp.search(line)
                    if m is not None:
                        tline = rexp.sub('', line)
                        line = tline
                    command_pattern_user_prompt = re.compile("{user}@{host}:.*?".format(user=user_initial_prompt.split('@')[0].casefold(), host=host_pattern))
                    command_pattern_root_prompt = re.compile("{}:.*?".format(root_prompt.casefold()))
                    tstampre = re.compile(";\d{9}")
                    
                    # Check if there is a prompt
                    res = command_pattern_user_prompt.search(line.casefold())
                    if (res or command_pattern_root_prompt.search(line.casefold())):
                        if (res):
                            user_prompt = res.group(0).split(':')[0]
                        else:
                            user_prompt = root_prompt
                        prompt = True
                    else:
                        prompt = False

                    # Check if there is a timestamp
                    tmatch = tstampre.search(line)
                    if tmatch:
                        haststamp = True
                    else:
                        haststamp = False

                    # Check if there is end
                    end = False
                    if r'END tty_sid' in line:
                        end = True

                    #print("Line ", line, " prompt ", prompt, " input cmd ", input_cmd), FIXME: remove this
                    if (prompt) or (not prompt and self.first_ttylog_line):
                        isinput = True
                        unique_row_id = "{}:{}:{}".format(self.unique_id_dict['exp_name'],self.unique_id_dict['start_time'],self.unique_id_dict['counter'])
                        if prompt:
                            if command_pattern_root_prompt.search(line.casefold()):
                                left_hash_part, right_hash_part = line.split('#',1)
                                current_line_prompt = left_hash_part
                                node_name = left_hash_part.split('@')[-1].split(':')[0]
                                current_working_directory = left_hash_part.split(':',1)[-1]
                                current_working_directory = current_working_directory.replace('~', self.root_home_dir ,1)
                                line = right_hash_part[1:]
                            else:
                                left_dollar_part, right_dollar_part = line.split('$',1)
                                current_line_prompt = left_dollar_part
                                node_name = left_dollar_part.split('@')[-1].split(':')[0]
                                current_working_directory = left_dollar_part.split(':',1)[-1]
                                current_working_directory = current_working_directory.replace('~', self.ttylog_sessions[current_session_id]['home_dir'] ,1)
                                line = right_dollar_part[1:]
                        else:
                            current_working_directory = home_directory
                            current_line_prompt = user_prompt
                    else:
                        isinput = False

                    line_timestamp = 0 # unused

                    if haststamp:
                        indexts = tstampre.search(line)
                        line_timestamp = line[indexts.span()[0]+1:indexts.span()[1]+1]  # unused
                        line = line[:indexts.span()[0]]


                    my_timestamp = int(time.time())

                    if isinput:
                        input_cmd = line
                        self.unique_id_dict['counter'] +=1
                        unique_row_id = "{}:{}:{}".format(self.unique_id_dict['exp_name'],self.unique_id_dict['start_time'],self.unique_id_dict['counter'])
                        
                        # Save previous output
                        if not self.first_ttylog_line:
                            if len(output_txt) > 500:
                                output_txt = output_txt[:500]

                            # unique_row_pid = "{}:{}:{}".format(self.unique_id_dict['exp_name'],self.unique_id_dict['start_time'],self.unique_id_dict['counter']-1) # unused
                            cline = len(self.ttylog_sessions[current_session_id]['lines']) - 1
                            if cline >=0:
                                logger.info("Cline ", cline, " output ", output_txt, " prompt ", self.ttylog_sessions[current_session_id]['lines'][cline]['prompt'])
                                self.ttylog_sessions[current_session_id]['lines'][cline]['output'] = output_txt
                                write_to_csv(self.ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)
                                #logfile = open(r"/tmp/acont.log", "a")
                                logger.info("Logged input "+self.ttylog_sessions[current_session_id]['lines'][cline]['cmd']+"\n")
                                logger.info("Logged output "+self.ttylog_sessions[current_session_id]['lines'][cline]['output']+"\n")
                        
                        # Save current input and save into github if needed
                        new_line = dict()
                        new_line['id'] = unique_row_id
                        new_line['timestamp'] = my_timestamp
                        new_line['output'] = ""
                        new_line['node_name'] = node_name
                        new_line['cwd'] = current_working_directory
                        new_line['cmd'] = input_cmd
                        new_line['prompt'] = current_line_prompt
                        self.ttylog_sessions[current_session_id]['lines'].append(new_line)
                        
                        logger.info("Found input "+input_cmd+"\n")

                        current_home_dir = self.ttylog_sessions[current_session_id]['home_dir']  # unused
                        output_txt = ''

                    elif not end:
                        output_txt += '\n'+line
                    else:
                        # End, save what we can
                        if len(output_txt) > 500:
                            output_txt = output_txt[:500]
                        # unique_row_pid = "{}:{}:{}".format(unique_id_dict['exp_name'],unique_id_dict['start_time'],unique_id_dict['counter']-1) # unused
                        cline = len(self.ttylog_sessions[current_session_id]['lines']) - 1
                        if cline >=0:
                            self.ttylog_sessions[current_session_id]['lines'][cline]['output'] = output_txt
                            write_to_csv(self.ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)
                            
                            logger.info("Logged input "+self.ttylog_sessions[current_session_id]['lines'][cline]['cmd']+"\n")
                            logger.info("Logged output "+self.ttylog_sessions[current_session_id]['lines'][cline]['output']+"\n")
                    self.first_ttylog_line = False

                time.sleep(0.1)

                if self.exit_flag:
                    exit(0)
        except Exception as e:
            print (e)

