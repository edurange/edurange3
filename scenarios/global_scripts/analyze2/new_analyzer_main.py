#!/usr/bin/python

# This code produces a CSV file for user interventions with the following columns
# CMBEGIN - fixed value
# node name
# epoch timestamp
# user home directory
# input command that the user has typed
# output, enclosed in % characters, could be multi-line
# username@node

import analyze_config as config

from analyzer_methods import get_unique_id_dict
from new_analyzer import LogAnalyzerMain 

object = LogAnalyzerMain()

class LogAnalyzer:
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

    def main_driver(self):
        object.get_ttylog_init()
        object.get_ttylog_lines_and_bytes()
        object.enumerate_ttylog()
        object.get_host_names()
        object.loop_function()

def main():
    analzer = LogAnalyzer()
    analzer.main_driver()

if __name__ == '__main__':
    main()