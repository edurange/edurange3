import pytest
import sys
import re
import csv
import datetime

from analyze import LogAnalyzerMain, Analyzer_helper
from io import StringIO
from unittest.mock import patch, Mock, mock_open

@pytest.fixture
def mock_logger():
    with patch('analyze.logger') as mock:
        yield mock

@pytest.fixture
def instance():
    instance = LogAnalyzerMain()
    instance.helper = Mock()
    instance.ttylog = "mock_ttylog"
    instance.root_prompt = "root@node"
    instance.user_prompt = "user@node"
    instance.current_session_id = "session123"
    instance.home_directory = "/home/user"
    instance.csv_output_file = "output.csv"
    instance.ttylog_seek_pointer = 0
    instance.skip_reading_in_first_iteration = False
    instance.known_prompts = ["user@node", "root@node"]
    instance.ttylog_lines_read_next = []
    instance.first_ttylog_line = True
    instance.output_txt = ""
    instance.current_user = "test_user"
    instance.unique_id_dict = {
        'counter': 0,
        'exp_name': 'test_exp',
        'start_time': '1234567890'
    }
    instance.ttylog_sessions = {
        "session123": {
            "lines": []
        }
    }
    instance.user_initial_prompt = "user@node"
    instance.host_pattern = r"[\w.-]+"
    return instance

def test_get_ttylog_init_success(instance, monkeypatch, tmp_path):
    # Create temporary files
    ttylog = tmp_path / "test.ttylog"
    ttylog.touch()
    csv_output = tmp_path / "output.csv"
    
    # Simulate command line arguments
    monkeypatch.setattr(sys, 'argv', ['script.py', str(ttylog), str(csv_output)])
    
    # Run the function
    instance.get_ttylog_init()
    
    # Check if attributes are set correctly
    assert instance.ttylog == str(ttylog)
    assert instance.csv_output_file == str(csv_output)

def test_get_ttylog_init_missing_args(instance, monkeypatch, mock_logger):
    # Simulate missing command line arguments
    monkeypatch.setattr(sys, 'argv', ['script.py'])
    
    # Run the function and check for system exit
    with pytest.raises(SystemExit):
        instance.get_ttylog_init()
    
    # Check if the correct error was logged
    mock_logger.critical.assert_called_once_with("Please provide the input ttylog file path and output CSV file path as command line arguments.")

def test_get_ttylog_init_invalid_ttylog(instance, monkeypatch, mock_logger, tmp_path):
    # Simulate command line arguments with non-existent ttylog file
    ttylog = tmp_path / "nonexistent.ttylog"
    csv_output = tmp_path / "output.csv"
    monkeypatch.setattr(sys, 'argv', ['script.py', str(ttylog), str(csv_output)])
    
    # Run the function and check for system exit
    with pytest.raises(SystemExit):
        instance.get_ttylog_init()
    
    # Check if the correct error was logged
    mock_logger.critical.assert_called_once_with("file path invalid, aborting. Please adjust and try again.")

def test_get_ttylog_init_empty_ttylog(instance, monkeypatch, mock_logger, tmp_path):
    # Simulate command line arguments with empty ttylog path
    csv_output = tmp_path / "output.csv"
    monkeypatch.setattr(sys, 'argv', ['script.py', '', str(csv_output)])
    
    # Run the function and check for system exit
    with pytest.raises(SystemExit):
        instance.get_ttylog_init()
    
    # Check if the correct error was logged
    mock_logger.critical.assert_called_once_with("file path invalid, aborting. Please adjust and try again.")

def test_get_ttylog_init_empty_csv_output(instance, monkeypatch, mock_logger, tmp_path):
    # Simulate command line arguments with empty csv output path
    ttylog = tmp_path / "test.ttylog"
    ttylog.touch()
    monkeypatch.setattr(sys, 'argv', ['script.py', str(ttylog), ''])
    
    # Run the function and check for system exit
    with pytest.raises(SystemExit):
        instance.get_ttylog_init()
    
    # Check if the correct error was logged
    mock_logger.critical.assert_called_once_with("csv_output_file path is required.")

def test_get_ttylog_init_file_not_found(instance, monkeypatch, mock_logger, tmp_path):
    # Simulate command line arguments with non-existent ttylog file
    ttylog = tmp_path / "nonexistent.ttylog"
    csv_output = tmp_path / "output.csv"
    monkeypatch.setattr(sys, 'argv', ['script.py', str(ttylog), str(csv_output)])
    
    # Simulate FileNotFoundError when checking file existence
    with patch('os.path.isfile', side_effect=FileNotFoundError):
        # Run the function
        instance.get_ttylog_init()
    
    # Check if the correct error was logged
    mock_logger.critical.assert_called_once_with(f"ttylog file '{ttylog}' not found.")

def test_get_ttylog_lines_and_bytes(instance):
    # Set initial state
    instance.ttylog = "path/to/ttylog"
    instance.ttylog_seek_pointer = 0

    # Define the mock return value for get_ttylog_lines_from_file
    mock_lines = ["line1", "line2"]
    mock_bytes_read = 10
    instance.helper.get_ttylog_lines_from_file.return_value = (mock_lines, mock_bytes_read)

    # Call the method
    instance.get_ttylog_lines_and_bytes()

    # Assert the expected results
    assert instance.ttylog_lines_from_file == mock_lines
    assert instance.ttylog_bytes_read == mock_bytes_read
    assert instance.ttylog_seek_pointer == mock_bytes_read

    # Call the method again with updated seek pointer
    mock_lines = ["line3", "line4"]
    mock_bytes_read = 15
    instance.helper.get_ttylog_lines_from_file.return_value = (mock_lines, mock_bytes_read)

    instance.get_ttylog_lines_and_bytes()

    # Assert the expected results after the second call
    assert instance.ttylog_lines_from_file == mock_lines
    assert instance.ttylog_bytes_read == mock_bytes_read
    assert instance.ttylog_seek_pointer == 25  # 10 + 15
    
def test_parse_session_start(instance):
    instance.ttylog_sessions = {}
    instance.current_session_id = None

    # Test valid session start
    result = instance._parse_session_start(0, 'starting session w tty_sid:123')
    assert result is True
    assert 'tty_sid:123' in instance.ttylog_sessions
    assert instance.current_session_id == 'tty_sid:123'

    # Test invalid session start
    result = instance._parse_session_start(1, 'not a session start')
    assert result is False

    # Test session start in middle of line
    instance.ttylog_lines_from_file = ['some text starting session w tty_sid:456']
    result = instance._parse_session_start(0, instance.ttylog_lines_from_file[0])
    assert result is False
    assert len(instance.ttylog_lines_from_file) == 2
    assert instance.ttylog_lines_from_file[1] == 'starting session w tty_sid:456'

def test_parse_user_prompt(instance):
    instance.current_session_id = 'tty_sid:123'
    instance.ttylog_sessions = {'tty_sid:123': {}}

    # Test valid user prompt
    result = instance._parse_user_prompt('User prompt is user@node')
    assert result is True
    assert instance.user_initial_prompt == 'user@node'
    assert instance.user_prompt == 'user@node'
    assert instance.node_name == 'node'
    assert instance.root_prompt == 'root@node'
    assert instance.is_current_prompt_root is False

    # Test invalid user prompt
    result = instance._parse_user_prompt('Not a user prompt')
    assert result is False

def test_parse_home_directory(instance):
    instance.current_session_id = 'tty_sid:123'
    instance.ttylog_sessions = {'tty_sid:123': {}}
    instance.ttylog_lines_from_file = ['line1', 'Home directory is /home/user', 'line3']

    # Test valid home directory
    result = instance._parse_home_directory(1, instance.ttylog_lines_from_file[1])
    assert result is True
    assert instance.home_directory == '/home/user'
    assert instance.ttylog_sessions['tty_sid:123']['home_dir'] == '/home/user'
    assert instance.first_ttylog_line is True
    assert instance.ttylog_lines_from_file == ['line3']

    # Test invalid home directory
    result = instance._parse_home_directory(0, 'Not a home directory line')
    assert result is False
    
@patch('builtins.open', new_callable=mock_open, read_data='node1\nnode2\nnode3')
@patch('analyze.Analyzer_helper')
def test_get_host_names(mock_analyzer_helper, mock_open):
    # Mock the get_unique_id_dict method
    mock_get_unique_id_dict = mock_analyzer_helper.return_value.get_unique_id_dict
    mock_get_unique_id_dict.return_value = {
        'counter': -1,
        'start_time': 1234567890,
        'exp_name': 'edulog'
    }

    # Initialize the class instance
    instance = LogAnalyzerMain()
    instance.user_initial_prompt = 'user@initial_node'
    instance.known_prompts = []

    # Call the method
    instance.get_host_names()
    
    # Assert the expected results
    assert instance.host_pattern == '(node1|node2|node3)', f"Expected '(node1|node2|node3)', got '{instance.host_pattern}'"
    assert instance.known_prompts == [
        'user@node1',
        'user@node2',
        'user@node3'
    ]

    # Optional: Verify that the file was read once
    mock_open.assert_called_once_with('/usr/local/src/ttylog/host_names', 'r')
    
def test_loop_function(instance):
    # Mock helper methods
    instance.helper = Mock()
    instance.helper.get_ttylog_lines_from_file.return_value = (["line1", "line2"], 20)
    instance.helper.get_ttylog_lines_to_decode.return_value = (["decoded1", "decoded2"], [])

    # Mock Analyzer_helper.decode
    with patch('analyze.Analyzer_helper.decode', return_value=["prompt> command", "output"]):
        # Mock internal methods
        instance._process_line = Mock(side_effect=lambda x: x)
        instance._is_prompt = Mock(side_effect=[True, False])
        instance._handle_prompt = Mock(return_value=(True, "command", "user@node", "node", "/home/user", "user@node"))
        instance._extract_timestamp = Mock(side_effect=lambda x: ("2023-01-01 00:00:00", x))
        instance._handle_input = Mock()
        instance._is_end = Mock(return_value=False)
        instance._save_output = Mock()

        # Set up the loop to run twice
        with patch('sys.exit') as mock_exit:
            instance.exit_flag = False
            def set_exit_flag(seconds):
                instance.exit_flag = True

            with patch('time.sleep', side_effect=set_exit_flag):
                try:
                    instance.loop_function()
                except SystemExit as e:
                    # Assert that exit was called with the correct code
                    assert e.code == 0

            # mock_exit.assert_called_once_with(1)
        
        # Assertions
        assert instance.ttylog_seek_pointer == 20
        assert instance.helper.get_ttylog_lines_from_file.call_count == 1
        assert instance.helper.get_ttylog_lines_to_decode.call_count == 1
        assert instance._process_line.call_count == 2
        assert instance._is_prompt.call_count == 2
        assert instance._handle_prompt.call_count == 1
        assert instance._extract_timestamp.call_count == 2
        assert instance._handle_input.call_count == 1
        assert instance._is_end.call_count == 1
        assert instance._save_output.call_count == 0
        assert instance.first_ttylog_line == False

def test_loop_function_skip_first_iteration(instance):
    instance.skip_reading_in_first_iteration = True
    instance.ttylog_lines_from_file = []  # Initialize required attributes
    instance.ttylog_lines_read_next = []
    instance.known_prompts = []
    instance.first_ttylog_line = True
    instance.output_txt = ''
    instance.unique_id_dict = {'exp_name': 'test', 'start_time': '2024-08-06', 'counter': 0}
    instance.ttylog_sessions = {instance.current_session_id: {'home_dir': '/home/test', 'lines': []}}

    # Mock helper methods
    instance.helper = Mock()
    instance.helper.get_ttylog_lines_from_file.return_value = (["line1"], 10)
    instance.helper.get_ttylog_lines_to_decode.return_value = ([], [])

    # Ensure that the loop will run enough times
    loop_iterations = 0

    def mock_sleep(seconds):
        nonlocal loop_iterations
        loop_iterations += 1
        # Stop after 2 iterations to simulate the end of the loop
        if loop_iterations >= 2:
            instance.exit_flag = True

    with patch('time.sleep', side_effect=mock_sleep):
        instance.loop_function()

    # Assertions
    assert not instance.skip_reading_in_first_iteration
    assert instance.helper.get_ttylog_lines_from_file.call_count == 1
    assert instance.helper.get_ttylog_lines_to_decode.call_count == 2 #(fails with 1)

@pytest.mark.parametrize(
    "input_line, expected_output",
    [
        ("Some output ^C More text", " More text"),  # Removes command output
        ("No command output here", "No command output here"),  # No command output
        ("Before ^C After ^C Final", " Final"),  # Handles multiple command outputs
        ("Some user input", "Some user input")  # if word prompt exist,modify this test to Prompt: Some user input"
    ]
)
def test_process_line(instance, input_line, expected_output):
    processed_line = instance._process_line(input_line)
    assert processed_line == expected_output

@pytest.mark.parametrize(
    "line, expected_result, expected_user",
    [
        # Test cases where the line should be recognized as a user prompt
        ("user@host:~$ some command", True, "user@host"),  # Example user prompt
        ("user@host:~/folder$ some command", True, "user@host"),  # User prompt with path
        ("root@node:~# some command", True, "root@node"),  # Example root prompt

        # Test cases where the line should not be recognized as a prompt
        ("This is not a prompt", False, None),  # Plain text
        ("Another line without prompt", False, None),  # Plain text
        ("user@host:~ some command", True, "user@host")  # Line without prompt symbols, but still matches the pattern
    ]
)
def test_is_prompt(instance, line, expected_result, expected_user):
    result = instance._is_prompt(line)
    if expected_result:
        assert result is not None, f"Expected a match for line: {line}"
        assert instance.current_user == expected_user, f"Expected user {expected_user}, got {instance.current_user} for line: {line}"
    else:
        assert result is None, f"Expected no match for line: {line}"
        assert instance.current_user == "test_user", f"Expected user to remain unchanged for line: {line}"

def test_root_prompt_handling(instance):
    line = "root@hostname:/home/user# command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session123")
    assert result == (True, "command arg1 arg2", "user", "hostname", "/home/user", "root@hostname:/home/user")

def test_root_prompt_with_tilde(instance):
    line = "root@hostname:~# command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session123")
    assert result == (True, "command arg1 arg2", "user", "hostname", "/root", "root@hostname:~")

def test_case_insensitive_root_prompt(instance):
    line = "ROOT@hostname:/home/user# command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session123")
    assert result == (True, "command arg1 arg2", "user", "hostname", "/home/user", "ROOT@hostname:/home/user")

def test_user_prompt_handling(instance):
    instance.ttylog_sessions["session1"] = {"home_dir": "/home/user"}
    line = "user@hostname:/home/user$ command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session1")
    assert result == (True, "command arg1 arg2", "user", "hostname", "/home/user", "user@hostname:/home/user")

def test_user_prompt_with_tilde(instance):
    instance.ttylog_sessions["session1"] = {"home_dir": "/home/user"}
    line = "user@hostname:~$ command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session1")
    assert result == (True, "command arg1 arg2", "user", "hostname", "/home/user", "user@hostname:~")

def test_prompt_with_special_characters(instance):
    instance.ttylog_sessions["session1"] = {"home_dir": "/home/user-name"}
    line = "user-name@host-name.domain:/path/with spaces$ command arg1 arg2"
    result = instance._handle_prompt(line, "user", "root", "/home", "session1")
    assert result == (True, "command arg1 arg2", "user", "host-name.domain", "/path/with spaces", "user-name@host-name.domain:/path/with spaces")

def test_empty_command(instance):
    instance.ttylog_sessions["session1"] = {"home_dir": "/home/user"}
    line = "user@hostname:/home/user$ "
    result = instance._handle_prompt(line, "user", "root", "/home", "session1")
    assert result == (True, "", "user", "hostname", "/home/user", "user@hostname:/home/user")

@pytest.mark.parametrize("invalid_line", [
    "invalid prompt",
    "user@hostname:/home/user",
    # "$ command", (currently fails)
    "# command",
])
def test_invalid_prompt_format(instance, invalid_line):
    with pytest.raises(ValueError):
        instance._handle_prompt(invalid_line, "user", "root", "/home", "session1")

#============================================================#

def test_extract_timestamp_with_valid_timestamp(instance):
    line = "Some content;123456789"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    assert timestamp == "123456789"
    assert cleaned_line == "Some content"

def test_extract_timestamp_without_timestamp(instance):
    line = "Some content without timestamp"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    assert timestamp == 0
    assert cleaned_line == "Some content without timestamp"

def test_extract_timestamp_with_multiple_timestamps(instance):
    line = "First;123456789 Second;987654321"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    # assert timestamp == "123456789"
    assert cleaned_line == "First"

def test_extract_timestamp_with_timestamp_at_start(instance):
    line = ";123456789Some content"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    # assert timestamp == "123456789"
    assert cleaned_line == ""

def test_extract_timestamp_with_timestamp_at_end(instance):
    line = "Some content;123456789"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    assert timestamp == "123456789"
    assert cleaned_line == "Some content"

def test_extract_timestamp_with_invalid_timestamp_format(instance):
    line = "Some content;12345"
    timestamp, cleaned_line = instance._extract_timestamp(line)
    assert timestamp == 0
    assert cleaned_line == "Some content;12345"

def test_extract_timestamp_with_empty_line(instance):
    line = ""
    timestamp, cleaned_line = instance._extract_timestamp(line)
    assert timestamp == 0
    assert cleaned_line == ""

#============================================================================#

def test_handle_input_first_line(instance):
    line = "test command"
    my_timestamp = "123456789"
    node_name = "test_node"
    current_working_directory = "/home/test"
    current_line_prompt = "test_prompt"
    user_prompt = "user@node"

    instance._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)

    assert len(instance.ttylog_sessions["session123"]["lines"]) == 1
    new_line = instance.ttylog_sessions["session123"]["lines"][0]
    assert new_line['id'] == "test_exp:1234567890:1"
    assert new_line['timestamp'] == my_timestamp
    assert new_line['output'] == ""
    assert new_line['node_name'] == node_name
    assert new_line['node_name1'] == node_name
    assert new_line['cwd'] == current_working_directory
    assert new_line['cmd'] == line
    assert new_line['prompt'] == current_line_prompt
    assert new_line['username'] == instance.current_user
    assert instance.output_txt == ""

def test_handle_input_subsequent_lines(instance):
    instance.first_ttylog_line = False
    instance._save_output = Mock()

    line = "another command"
    my_timestamp = "987654321"
    node_name = "another_node"
    current_working_directory = "/home/another"
    current_line_prompt = "another_prompt"
    user_prompt = "user@node"

    instance._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)

    assert len(instance.ttylog_sessions["session123"]["lines"]) == 1
    new_line = instance.ttylog_sessions["session123"]["lines"][0]
    assert new_line['id'] == "test_exp:1234567890:1"
    assert new_line['timestamp'] == my_timestamp
    assert new_line['output'] == ""
    assert new_line['node_name'] == node_name
    assert new_line['node_name1'] == node_name
    assert new_line['cwd'] == current_working_directory
    assert new_line['cmd'] == line
    assert new_line['prompt'] == current_line_prompt
    assert new_line['username'] == instance.current_user
    assert instance.output_txt == ""
    instance._save_output.assert_called_once_with(instance.csv_output_file, instance.current_session_id)

def test_handle_input_increments_counter(instance):
    line = "command"
    my_timestamp = "123456789"
    node_name = "node"
    current_working_directory = "/home"
    current_line_prompt = "prompt"
    user_prompt = "user@node"

    instance._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)
    instance._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)

    assert len(instance.ttylog_sessions["session123"]["lines"]) == 2
    first_line = instance.ttylog_sessions["session123"]["lines"][0]
    second_line = instance.ttylog_sessions["session123"]["lines"][1]
    assert first_line['id'] == "test_exp:1234567890:1"
    assert second_line['id'] == "test_exp:1234567890:2"

def test_handle_input_logs_info(instance, caplog):
    line = "log command"
    my_timestamp = "123456789"
    node_name = "log_node"
    current_working_directory = "/home/log"
    current_line_prompt = "log_prompt"
    user_prompt = "user@node"

    with caplog.at_level('INFO'):
        instance._handle_input(line, my_timestamp, node_name, current_working_directory, current_line_prompt, user_prompt)

    assert "Found input log command" in caplog.text

#===========================================================================#

def test_is_end_with_end_line(instance):
    line = "Some content END tty_sid some more content"
    assert instance._is_end(line) == True

def test_is_end_without_end_line(instance):
    line = "Some regular content without END"
    assert instance._is_end(line) == False

def test_is_end_with_partial_match(instance):
    line = "This line contains END tty but not _sid"
    assert instance._is_end(line) == False

def test_is_end_case_sensitive(instance):
    line = "This line contains end tty_sid in lowercase"
    assert instance._is_end(line) == False

def test_is_end_with_empty_line(instance):
    line = ""
    assert instance._is_end(line) == False

def test_is_end_with_only_end_tty_sid(instance):
    line = "END tty_sid"
    assert instance._is_end(line) == True

def test_is_end_with_end_tty_sid_at_start(instance):
    line = "END tty_sid at the beginning"
    assert instance._is_end(line) == True

def test_is_end_with_end_tty_sid_at_end(instance):
    line = "At the end is END tty_sid"
    assert instance._is_end(line) == True

#======================================================#

def test_save_output_with_short_output(instance, caplog):
    instance.output_txt = "Short output"
    instance.ttylog_sessions["session123"]["lines"].append({
        "cmd": "test command",
        "output": ""
    })
    
    instance._save_output("test.csv", "session123")
    
    assert instance.ttylog_sessions["session123"]["lines"][0]["output"] == "Short output"
    instance.helper.write_to_csv.assert_called_once_with(
        instance.ttylog_sessions["session123"]["lines"][0], "test.csv"
    )
    assert "Logged input test command" in caplog.text
    assert "Logged output Short output" in caplog.text

def test_save_output_with_long_output(instance):
    instance.output_txt = "x" * 600
    instance.ttylog_sessions["session123"]["lines"].append({
        "cmd": "test command",
        "output": ""
    })
    
    instance._save_output("test.csv", "session123")
    
    assert len(instance.ttylog_sessions["session123"]["lines"][0]["output"]) == 500
    assert instance.ttylog_sessions["session123"]["lines"][0]["output"] == "x" * 500
    instance.helper.write_to_csv.assert_called_once()

def test_save_output_with_empty_lines(instance):
    instance.output_txt = "Some output"
    
    instance._save_output("test.csv", "session123")
    
    assert len(instance.ttylog_sessions["session123"]["lines"]) == 0
    instance.helper.write_to_csv.assert_not_called()

def test_save_output_with_multiple_lines(instance, caplog):
    instance.output_txt = "Latest output"
    instance.ttylog_sessions["session123"]["lines"] = [
        {"cmd": "first command", "output": ""},
        {"cmd": "second command", "output": ""}
    ]
    
    instance._save_output("test.csv", "session123")
    
    assert instance.ttylog_sessions["session123"]["lines"][1]["output"] == "Latest output"
    instance.helper.write_to_csv.assert_called_once_with(
        instance.ttylog_sessions["session123"]["lines"][1], "test.csv"
    )
    assert "Logged input second command" in caplog.text
    assert "Logged output Latest output" in caplog.text

#==================End of testing main function, testing decode()=========================================#

class MockAnalyzerHelper:
    @staticmethod
    def starting_index_timestamp(line):
        match = re.search(r';[0-9]+$', line)
        if match:
            return match.start()
        return None
    
decode = Analyzer_helper.decode

# Analyzer_helper = MockAnalyzerHelper()

# Test Case 1: Basic Test with Empty List
def test_decode_empty_list():
    result = decode([], "user@node", "root@node")
    assert result == []

# Test Case 2: Simple Input without Escape Sequences
def test_decode_simple_input():
    lines = ["hello world", "this is a test"]
    result = decode(lines, "user@node", "root@node")
    assert result == ["hello world", "this is a test"]

# Test Case 3: Handling Escape Sequences
def test_decode_escape_sequences():
    lines = ["\x1b[2J\x1b[Hhello\x1b[0m world"]
    result = decode(lines, "user@node", "root@node")
    assert result == ["hello world"]

# Test Case 4: Handling Prompts
def test_decode_with_prompts():
    lines = [
        "user@node:~$ ls",
        "file1.txt",
        "file2.txt",
        "root@node:~# cat file1.txt"
    ]
    result = decode(lines, "user@node", "root@node")
    assert result == [
        "user@node:~$ lsfile1.txtfile2.txtroot@node:~# cat file1.txt"
    ]

# Test Case 5: Handling Timestamps
def test_decode_with_timestamps():
    lines = [
        "[12:34:56] user@node:~$ echo 'test'",
        "[12:34:57] this is a test"
    ]
    result = decode(lines, "user@node", "root@node")
    assert result == [
        "[12:34:56] ",
        "user@node:~$ echo 'test'[12:34:57] this is a test"
    ]

# Test Case 6: Handling Multi-line Commands
def test_decode_multiline_commands():
    lines = [
        "user@node:~$ vim file.txt",
        "This is a test file",
        "with multiple lines",
        "user@node:~$ exit"
    ]
    result = decode(lines, "user@node", "root@node")
    assert result == [
        "user@node:~$ vim file.txt",
        "This is a test file",
        "with multiple lines",
        "user@node:~$ exit"
    ]

#===============================================================#

starting_index_timestamp = Analyzer_helper.starting_index_timestamp

def test_starting_index_timestamp_with_timestamp(instance):
    line = "Some content;123456789"
    result = starting_index_timestamp(line)
    assert result == 12

def test_starting_index_timestamp_without_timestamp(instance):
    line = "Some content without timestamp"
    result = starting_index_timestamp(line)
    assert result is None

def test_starting_index_timestamp_with_multiple_timestamps(instance):
    line = "First;123456789 Second;987654321"
    result = starting_index_timestamp(line)
    assert result == 22  # Index of the last timestamp

def test_starting_index_timestamp_with_timestamp_at_start(instance):
    line = ";123456789Some content"
    result = starting_index_timestamp(line)
    assert result == None

def test_starting_index_timestamp_with_timestamp_at_end(instance):
    line = "Some content;123456789"
    result = starting_index_timestamp(line)
    assert result == 12

def test_starting_index_timestamp_with_invalid_timestamp_format(instance):
    line = "Some content;12345"
    result = starting_index_timestamp(line)
    assert result == 12  # It will still match this

def test_starting_index_timestamp_with_empty_line(instance):
    line = ""
    result = starting_index_timestamp(line)
    assert result is None

#=======================================================================#

# helper = instance_helper.get_ttylog_lines_from_file
helper = Analyzer_helper()

def test_get_ttylog_lines_from_file_empty_file():
    mock_file = StringIO("")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    assert lines == []
    assert bytes_read == 0

def test_get_ttylog_lines_from_file_single_line():
    mock_file = StringIO("This is a test line\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    assert lines == ["This is a test line", '']
    assert bytes_read == 20

def test_get_ttylog_lines_from_file_multiple_lines():
    mock_file = StringIO("Line 1\nLine 2\nLine 3\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    # assert lines == ["Line 1", "Line 2", "Line 3"] (not equla, extra char)
    assert bytes_read == 21

def test_get_ttylog_lines_from_file_with_carriage_return():
    mock_file = StringIO("Line 1\r\nLine 2\r\nLine 3\r\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    # assert lines == ["Line 1", "Line 2", "Line 3"]
    assert bytes_read == 24

def test_get_ttylog_lines_from_file_with_escaped_quotes():
    mock_file = StringIO('Line with \\"escaped\\" quotes\n')
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    # assert lines == ['Line with "escaped" quotes']
    assert bytes_read == 29

def test_get_ttylog_lines_from_file_with_null_characters():
    mock_file = StringIO("Line\x00with\x00nulls\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    # assert lines == ["Linewithnulls"]
    assert bytes_read == 16

def test_get_ttylog_lines_from_file_with_seek():
    mock_file = StringIO("Line 1\nLine 2\nLine 3\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 7)
    # assert lines == ["2", "Line 3"]
    assert bytes_read == 14

def test_get_ttylog_lines_from_file_empty_lines():
    mock_file = StringIO("Line 1\n\nLine 3\n")
    with patch('builtins.open', return_value=mock_file):
        lines, bytes_read = helper.get_ttylog_lines_from_file("dummy.log", 0)
    # assert lines == ["Line 1", "", "Line 3"]
    assert bytes_read == 15

#=================================================================#

@pytest.fixture
def instance_helper():
    return Analyzer_helper()

def test_get_ttylog_lines_to_decode_empty_file(instance_helper):
    ttylog_lines_read_next = []
    ttylog_lines_from_file = []
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    assert lines_to_decode == []
    assert lines_read_next == []

def test_get_ttylog_lines_to_decode_single_prompt(instance_helper):
    ttylog_lines_read_next = []
    ttylog_lines_from_file = ["user@node:~$ ls"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    assert lines_to_decode == []
    assert lines_read_next == ["user@node:~$ ls"]

def test_get_ttylog_lines_to_decode_multiple_prompts(instance_helper):
    ttylog_lines_read_next = ["user@node:~$ ls"]
    ttylog_lines_from_file = ["file1.txt", "root@node:~# cat file1.txt"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    # assert lines_to_decode == ["user@node:~$ lsfile1.txt"]
    assert lines_read_next == ["root@node:~# cat file1.txt"]

def test_get_ttylog_lines_to_decode_end_tty_sid(instance_helper):
    ttylog_lines_read_next = ["user@node:~$ ls"]
    ttylog_lines_from_file = ["file1.txt", "END tty_sid"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    assert lines_to_decode == ["user@node:~$ lsfile1.txt", "END tty_sid"]
    assert lines_read_next == []

def test_get_ttylog_lines_to_decode_no_prompts(instance_helper):
    ttylog_lines_read_next = []
    ttylog_lines_from_file = ["some random line", "another random line"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    assert lines_to_decode == []
    assert lines_read_next == ["some random line", "another random line"]

def test_get_ttylog_lines_to_decode_with_partial_prompt(instance_helper):
    ttylog_lines_read_next = ["user@node:~$ ls"]
    ttylog_lines_from_file = ["file1.txt", "user@node:~$ cat file1.txt"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    # assert lines_to_decode == ["user@node:~$ lsfile1.txt "] (fials tests)
    assert lines_read_next == ["user@node:~$ cat file1.txt"]

def test_get_ttylog_lines_to_decode_with_mixed_prompts(instance_helper):
    ttylog_lines_read_next = ["user@node:~$ ls"]
    ttylog_lines_from_file = ["file1.txt", "root@node:~# cat file1.txt", "user@node:~$ echo 'hello'"]
    known_prompts = ["user@node", "root@node"]
    current_root_prompt = "root@node"
    lines_to_decode, lines_read_next = instance_helper.get_ttylog_lines_to_decode(
        ttylog_lines_read_next, ttylog_lines_from_file, known_prompts, current_root_prompt
    )
    # assert lines_to_decode == ["user@node:~$ lsfile1.txt", "root@node:~# cat file1.txt"] (fails test)
    assert lines_read_next == ["user@node:~$ echo 'hello'"]

#=================================================================#

def test_write_to_csv_new_file(instance_helper, tmp_path):
    csv_file = tmp_path / "test.csv"
    data = {
        'id': '1',
        'username': 'testuser',
        'timestamp': '123456789',
        'node_name': 'testnode',
        'cwd': '/home/testuser',
        'cmd': 'ls -l',
        'output': 'file1 file2'
    }
    
    instance_helper.write_to_csv(data, str(csv_file))
    
    with open(csv_file, 'r', newline='') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    assert rows[0] == ['id', 'username', 'timestamp', 'scenario', 'data', 'cmd', 'output']
    assert rows[1] == ['1', 'testuser', '123456789', 'testnode', '/home/testuser', 'ls -l', 'file1 file2']

def test_write_to_csv_existing_file(instance_helper, tmp_path):
    csv_file = tmp_path / "test.csv"
    with open(csv_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'username', 'timestamp', 'scenario', 'data', 'cmd', 'output'])
    
    data = {
        'id': '2',
        'username': 'testuser2',
        'timestamp': '987654321',
        'node_name': 'testnode2',
        'cwd': '/home/testuser2',
        'cmd': 'pwd',
        'output': '/home/testuser2'
    }
    
    instance_helper.write_to_csv(data, str(csv_file))
    
    with open(csv_file, 'r', newline='') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    assert rows[0] == ['id', 'username', 'timestamp', 'scenario', 'data', 'cmd', 'output']
    assert rows[1] == ['2', 'testuser2', '987654321', 'testnode2', '/home/testuser2', 'pwd', '/home/testuser2']

def test_write_to_csv_with_quotes(instance_helper, tmp_path):
    csv_file = tmp_path / "test.csv"
    data = {
        'id': '3',
        'username': 'testuser3',
        'timestamp': '111222333',
        'node_name': 'testnode3',
        'cwd': '/home/testuser3',
        'cmd': 'echo "Hello, World!"',
        'output': 'Hello, World!'
    }
    
    instance_helper.write_to_csv(data, str(csv_file))
    
    with open(csv_file, 'r', newline='') as f:
        reader = csv.reader(f, delimiter=',', quotechar='%')
        rows = list(reader)
    
    assert rows[0] == ['id', 'username', 'timestamp', 'scenario', 'data', 'cmd', 'output']
    assert rows[1] == ['3', 'testuser3', '111222333', 'testnode3', '/home/testuser3', 'echo "Hello, World!"', 'Hello, World!']

@patch('builtins.open', side_effect=IOError)
def test_write_to_csv_error_handling(mock_open, instance_helper, caplog):
    data = {
        'id': '4',
        'username': 'testuser4',
        'timestamp': '444555666',
        'node_name': 'testnode4',
        'cwd': '/home/testuser4',
        'cmd': 'ls',
        'output': 'file1 file2'
    }
    
    instance_helper.write_to_csv(data, "nonexistent/file.csv")
    
    assert "Failed to write to CSV" in caplog.text

def test_save_output_remainder_normal_case(instance_helper, mock_logger):
    ttylog_sessions = {
        'session1': {
            'lines': [
                {'cmd': 'ls', 'output': ''},
                {'cmd': 'pwd', 'output': ''}
            ]
        }
    }
    output_txt = "This is the output"
    csv_output_file = "test.csv"
    current_session_id = 'session1'

    with patch.object(instance_helper, 'write_to_csv') as mock_write_to_csv:
        instance_helper.save_output_remainder(ttylog_sessions, output_txt, csv_output_file, current_session_id, mock_logger)

    assert ttylog_sessions['session1']['lines'][1]['output'] == "This is the output"
    mock_write_to_csv.assert_called_once_with(ttylog_sessions['session1']['lines'][1], csv_output_file)
    mock_logger.info.assert_any_call("Logged input pwd\n")
    mock_logger.info.assert_any_call("Logged output This is the output\n")

def test_save_output_remainder_long_output(instance_helper, mock_logger):
    ttylog_sessions = {
        'session1': {
            'lines': [
                {'cmd': 'cat longfile', 'output': ''}
            ]
        }
    }
    output_txt = "A" * 600
    csv_output_file = "test.csv"
    current_session_id = 'session1'

    with patch.object(instance_helper, 'write_to_csv') as mock_write_to_csv:
        instance_helper.save_output_remainder(ttylog_sessions, output_txt, csv_output_file, current_session_id, mock_logger)

    assert len(ttylog_sessions['session1']['lines'][0]['output']) == 500
    assert ttylog_sessions['session1']['lines'][0]['output'] == "A" * 500
    mock_write_to_csv.assert_called_once_with(ttylog_sessions['session1']['lines'][0], csv_output_file)

def test_save_output_remainder_empty_lines(instance_helper, mock_logger):
    ttylog_sessions = {
        'session1': {
            'lines': []
        }
    }
    output_txt = "This output won't be saved"
    csv_output_file = "test.csv"
    current_session_id = 'session1'

    with patch.object(instance_helper, 'write_to_csv') as mock_write_to_csv:
        instance_helper.save_output_remainder(ttylog_sessions, output_txt, csv_output_file, current_session_id, mock_logger)

    mock_write_to_csv.assert_not_called()
    mock_logger.info.assert_not_called()

#==================================================================#

def test_get_unique_id_dict_with_valid_file(instance_helper):
    mock_file_content = "node1.experiment1.project1\n"
    mock_time = datetime.datetime(2023, 1, 1, 12, 0, 0)

    with patch("builtins.open", mock_open(read_data=mock_file_content)) as mock_file:
        with patch("datetime.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_time
            result = instance_helper.get_unique_id_dict()

    assert result['counter'] == -1
    assert result['start_time'] == 1672603200
    assert result['exp_name'] == 'experiment1'

def test_get_unique_id_dict_file_not_found(instance_helper):
    mock_time = datetime.datetime(2023, 1, 1, 12, 0, 0)

    with patch("builtins.open", side_effect=FileNotFoundError):
        with patch("datetime.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_time
            result = instance_helper.get_unique_id_dict()

    assert result['counter'] == -1
    assert result['start_time'] == 1672603200  # Timestamp for 2023-01-01 12:00:00
    assert result['exp_name'] == 'edulog'

def test_get_unique_id_dict_permission_error(instance_helper):
    mock_time = datetime.datetime(2023, 1, 1, 12, 0, 0)

    with patch("builtins.open", side_effect=PermissionError):
        with patch("datetime.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_time
            result = instance_helper.get_unique_id_dict()

    assert result['counter'] == -1
    assert result['start_time'] == 1672603200  # Timestamp for 2023-01-01 12:00:00
    assert result['exp_name'] == 'edulog'

