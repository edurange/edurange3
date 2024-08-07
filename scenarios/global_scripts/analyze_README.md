Changelog
The original version of analyzer.py was 880 lines long and one long serially linked script

## Version 2 
### What was the problem?

There were serveral problems with analyze.py v1. 
1. It was very difficult to read. 
2. it was difficult to maintain.
3. had multiple bugs
4. had dangerous logic
5. had python loading all the functions even if unused causing namsespace bloat

### What was done to address the problem?
1. Previous functions under if __name__  are now LogAnalyzerMain(). It is the "main" section of the original script. 
2. Analyzer_methods() are all the helper functions from above the old main section of the script. Some of the original functions are not in use like github actions. 

### What has changed?
Current verison (2.0) is using replaced analyze.py (v1) 
   
Removed are the global variables, adding them the __init__ to load them properly
Added some initial logging, enabled some of the commented out logging 
Moved the logic out of the if name == main section
Added a class object to give more control over chaining flow in the future.
Added a main driver script
Refactored loop function and enumerate_ttylog to reduce time complexity.

### What is left to do?
    1. check for more areas for retry logic (done)
    2. Add some testing (done)
    3. Add more logging support (done)
    4. test it live. (done)

### What does each method do?
    New Analyzer:
    > def __init__(self) -> None:
        Sets up the important class-wide variables.
    > def get_ttylog_init(self):
        Gets the ttylog via user argument, sets class-wide ttylog variable
    > def get_ttylog_lines_and_bytes(self):
        Reads the ttylog file and retrieves the lines and pointer.
    > def enumerate_ttylog(self) -> None:
        iterates through the ttylog lines and processes them based on their type.
        > def _parse_session_start(self, count: int, line: str) -> bool:
            Called by the enumerate function, "_" indicates private, processes the start of a new session in the TTY log.
        > def _parse_user_prompt(self, line: str) -> bool:
            Called by the enumerate function, processes the user prompt in the TTY log.
        > def _parse_home_directory(self, count: int, line: str) -> bool:
            Called by the enumerate function, processes the home directory in the TTY log.
    > def get_host_names(self):
        Read the host_names file and construct a regex pattern for possible hosts
    > def loop_function(self):
        The main loop that reads the ttylog file, processes the lines, and generates the CSV output. The decode function is called here.
        > def process_line(self, line):
            Remove command output, prompts, and user input symbols
        > def is_prompt(self, line):
            Checks if the line is a prompt
        > def handle_prompt(self, line, user_prompt, root_prompt, home_directory, current_session_id):
            Handles different prompts and extract relevant information
        > def extract_timestamp(self, line):
            Extracts timestamp from the line
        > def handle_input(self, line, my_timestamp, node_name, current_working_directory, current_line_prompt):
            Handles user input and update the CSV output
        > def is_end(self, line):
            Checks if the line is the end of a session
        > def save_output(self, csv_output_file, current_session_id):
            Writes the current session's output to the CSV file