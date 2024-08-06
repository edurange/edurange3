#!/usr/bin/python

# This code produces a CSV file for user interventions with the following columns
# CMBEGIN - fixed value
# node name
# epoch timestamp
# user home directory
# input command that the user has typed
# output, enclosed in % characters, could be multi-line
# username@node

# pswish changelog:
    #1 The functions in this script were helper funtions in the original script. (above the "if __name__" code block)
    #2 Not all the functions in the orig script were being used bloating the memory usage. Moved here to call them when they are implemented but not before.
    #3 These funcitons are called by the new_analyzer module. 
    #4 Refacoring to improve readbility not yet done.
    #5 Moved decode to it's own module due to size of function for reability


import csv
import os
import re
import datetime
import time
import shutil
import queue
import subprocess
import logging

def starting_index_timestamp(line):
    """Return the index where the timestamp starts, in a line. If timestamp does not exist, return None"""
    reg_expr_end_timestamp = re.compile(';[0-9]+$')
    res = reg_expr_end_timestamp.search(line)
    if res is not None:
        return res.span()[0]
    else:
        return None

def get_ttylog_lines_from_file(ttylog, ttylog_seek_pointer):
    """Read from ttylog. If lines have '\r' at end, remove that '\r'. Return the read lines"""
    ttylog_file = open(ttylog,'r',errors='ignore', newline='\n')
    ttylog_file.seek(ttylog_seek_pointer)
    ttylog_read_data = ttylog_file.read()
    ttylog_file.close()
    ttylog_bytes_read = len(ttylog_read_data)
    ttylog_lines_file = []
    # If nothing new is there to read, return
    if ttylog_bytes_read == 0:
        return ttylog_lines_file, ttylog_bytes_read
    #Replace escaped double qoutes with qoutes
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

def get_ttylog_lines_to_decode(ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt):
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

# Not currently in use
def _push_files_github_user_dir(input_command, line_timestamp, local_copy_directory, files_path_list, user_home_dir, current_line_prompt, node_name, global_copy_directory, max_allowed_file_size = 5*(2**20)):
    """Push files to github user repo"""
    if (len(files_path_list) == 0) or not (os.path.isdir(local_copy_directory)):
        return

    if (len(local_copy_directory) > 0) and (local_copy_directory[-1] != r'/'):
        local_copy_directory += r'/'

    copy_directory = local_copy_directory

    for file_path in files_path_list:

        # If the file does not exist OR file size > max allowed file size, then continue
        if (not os.path.isfile(file_path)) or (os.path.getsize(file_path) > max_allowed_file_size):
            continue

        # Normalize the pathname
        # os.path.abspath('/var/../done/') will return '/done'
        file_path = os.path.abspath(file_path)

        file_dir, file_name = os.path.split(file_path)
        if file_dir.find(user_home_dir) == 0:
            len_user_home_dir = len(user_home_dir)
            file_dir = file_dir[len_user_home_dir:]
            copy_directory = global_copy_directory

        # Remove the '/' from file_dir, since github_user_directory has a '/' at its end
        if (len(file_dir) > 0) and (file_dir[0] == r'/'):
            file_dir = file_dir[1:]

        # Add a '/' at the ending of file_dir
        if (len(file_dir) > 0) and (file_dir[-1] != '/'):
            file_dir = file_dir + "/"

        file_copy_destination_dir = copy_directory + file_dir

        # Create the directory if it does not exist
        if not os.path.isdir(file_copy_destination_dir):
            os.makedirs(file_copy_destination_dir)

        file_copy_destination = file_copy_destination_dir + file_name
        # Copy the file to destination
        try:
            shutil.copy2(file_path, file_copy_destination)
        except PermissionError as e:
            continue

    # Get github user directory from copy_directory
    # github_user_directory will be the parent of the parent directory
    # If local_copy_directory = '/tmp/upload_modified_files/exp-1/node_a/'
    # os.path.dirname(os.path.dirname(local_copy_directory[:-1])) will return '/tmp/upload_modified_files'
    github_user_directory = os.path.dirname(os.path.dirname(local_copy_directory[:-1])) + r'/'

    # Get username from user prompt
    user_name = current_line_prompt.split('@')[0]

    # Add all files in copy_directory to staging area
    subprocess.run(['git','-C', github_user_directory, 'add', copy_directory])
    # Commit the changes
    subprocess.run(['git', '-C', github_user_directory, 'commit', '-m', "Adding files by {} at {} with command {} on node {}".format(user_name, line_timestamp, input_command, node_name)], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    # Rebasing to get all commits from origin, and to put our commits on top of the comits received by origin
    #subprocess.run(['git', '-C', github_user_directory, 'pull', '--rebase', '-X', 'theirs'], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    subprocess.run(['git', '-C', github_user_directory, 'pull'], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    # Push the changes
    subprocess.run(['git', '-C', github_user_directory, 'push'], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)

    return True

# Not currently in use
def _get_github_user_directory(github_repo_name='upload_modified_files', local_dir_to_clone_github='/tmp/'):
    """Return the github user directory where the files will be copied"""

    # Get the project name and experiment name
    with open(r'/var/emulab/boot/nickname','r') as file_handle:
        file_data = file_handle.read().splitlines()[0]
    node, exp_name, proj_name = file_data.split('.')

    github_base_directory = '/proj/{}/{}/'.format(proj_name, github_repo_name)


    # Return if the github repo does not exist
    if not os.path.isdir(github_base_directory):
        return None

    # Add a '/' at the ending of file_dir
    if local_dir_to_clone_github[-1] != '/':
        local_dir_to_clone_github = local_dir_to_clone_github + "/"

    # Clone the github repo
    subprocess.run(['git','-C', local_dir_to_clone_github, 'clone', github_base_directory], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)

    # Construct directory where users file will be copied
    local_copy_directory = local_dir_to_clone_github + github_repo_name + r'/' + exp_name + r'/' + node + r'/'
    global_copy_directory = local_dir_to_clone_github + github_repo_name + r'/' + exp_name + r'/'

    # Create the github user directory does not exist, if it does not exist
    if not os.path.isdir(local_copy_directory):
        os.makedirs(local_copy_directory)

    return local_copy_directory, global_copy_directory

# Not currently in use
def _get_filenames_from_user_command(current_working_directory, input_command, user_prompt, user_home_dir):
    """If input_command contains file(s), return a list of absolute paths of file(s)"""

    if current_working_directory[-1] != r'/':
        current_working_directory += r'/'

    # Make the input command lower case and remove whitespaces from start and end of string
    input_command = input_command.strip()
    list_of_filenames = []
    absolute_filesnames = []

    # Check for output redirection
    if (r'>' in input_command) or (r'>>' in input_command):
        file_name = ''
        # Assumption: Only one of '>' or '>>' is present in input_command
        if (r'>>' not in input_command) and (r'>' in input_command):
            file_name = input_command.split('>',maxsplit=1)[1].strip()
        elif r'>>' in input_command:
            file_name = input_command.split('>>',maxsplit=1)[1].strip()

        list_of_filenames.append(file_name)

    # Check if a command line editor was used to access file
    else:
        command_line_editors = ['vim ', 'vi ', 'nano ', 'pico ', 'emacs ']
        for command_line_editor in command_line_editors:
            editor_position = input_command.find(command_line_editor)
            # If the input command contains an editor

            if editor_position > -1:
                #logfile = open(r"/tmp/acont.log", "a")
                #logfile.write("Found editor in line "+input_command+"\n")
                #logfile.close()

                input_command = input_command[editor_position:]

                # Get a new command without the editor's name
                new_command = input_command.split(' ',maxsplit=1)[1]

                # If the filename is 'test file', and user enters it as 'vim "test file"'
                temp_names = re.findall(r'"[A-Za-z0-9_/#.~]+\s[A-Za-z0-9_/#.~]+"', new_command)
                list_of_filenames.extend(temp_names)
                new_command = re.sub(r'"[A-Za-z0-9_/#.~]+\s[A-Za-z0-9_/#.~]+"', '', new_command).strip()

                # If the filename contains spaces, and its interpreded as 'vim a\ b'
                temp_names = re.findall(r'[A-Za-z0-9_/#.~]+\\\s[A-Za-z0-9_/#.~]+', new_command)
                list_of_filenames.extend(temp_names)
                new_command = re.sub(r'[A-Za-z0-9_/#.~]+\\\s[A-Za-z0-9_/#.~]+', '', new_command).strip()

                # Get arguments list in command. Skip the first argument, since it would be the editor's name
                arguments_list_in_command = new_command.split()
                for argument_name in arguments_list_in_command:
                    # If the argument is not a command line option
                    if (r'--' != argument_name[:2]) and (r'-' != argument_name[:1]):
                        list_of_filenames.append(argument_name)
                        #logfile = open(r"/tmp/acont.log", "a")
                        #logfile.write("Argument name "+argument_name+"\n")
                        #logfile.close()
                break


    for file_name in list_of_filenames:

        # If the filename contains spaces,such as 'a\ b', make it 'a b'
        file_name = file_name.replace('\ ',' ')
        # Strip for whitespaces, single qoutes, and double quotes
        file_name = file_name.strip(" ")
        file_name = file_name.strip('"')
        file_name = file_name.strip("'")

        final_file_name = ''
        if file_name[0] == r'/':
            final_file_name = file_name
        elif file_name[0] == r'~':
            user_name = user_prompt.split('@')[0]
            if user_name == 'root':
                final_file_name = r'/root' + file_name
            else:
                final_file_name = file_name.replace('~', user_home_dir ,1)
        else:
            final_file_name = current_working_directory + file_name
        absolute_filesnames.append(final_file_name)
        #logfile = open(r"/tmp/acont.log", "a")
        #logfile.write("Appended "+final_file_name+"\n")
        #logfile.close()

    return absolute_filesnames

# Not currently in use
def _process_files_from_queue():
    """Process the elements in queue """
    global files_list_queue
    while True:

        # Get element from queue in a blocking call
        try:
            queue_element = files_list_queue.get(True, 0.1)
        except queue.Empty as e:
            #print("Got nothing")
            time.sleep(1)
            continue

        line_command = queue_element[0]
        line_timestamp = queue_element[1]
        github_local_user_directory = queue_element[2]
        github_files_path_list = queue_element[3]
        current_home_dir = queue_element[4]
        current_line_prompt = queue_element[5]
        node_name = queue_element[6]
        # _push_files_github_user_dir(line_command, line_timestamp, github_local_user_directory, github_files_path_list, current_home_dir, current_line_prompt, node_name, github_global_user_directory)

        files_list_queue.task_done()

def write_to_csv(data, csv_output_file):
    """Write data to a CSV file."""
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

def save_output_remainder(ttylog_sessions, output_txt, csv_output_file, current_session_id, logger):
    
    # End, save what we can
    if len(output_txt) > 500:
        output_txt = output_txt[:500]
    # unique_row_pid = "{}:{}:{}".format(unique_id_dict['exp_name'],unique_id_dict['start_time'],unique_id_dict['counter']-1) # unused
    cline = len(ttylog_sessions[current_session_id]['lines']) - 1
    if cline >=0:
        ttylog_sessions[current_session_id]['lines'][cline]['output'] = output_txt
        write_to_csv(ttylog_sessions[current_session_id]['lines'][cline], csv_output_file)
        
        logger.info("Logged input "+ttylog_sessions[current_session_id]['lines'][cline]['cmd']+"\n")
        logger.info("Logged output "+ttylog_sessions[current_session_id]['lines'][cline]['output']+"\n")

        return save_output_remainder

def get_unique_id_dict():
    """Return a dictonary containing information about the unique ID that will be inserted in every row in output CSV"""
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
