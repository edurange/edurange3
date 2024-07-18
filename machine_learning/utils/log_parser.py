####################################################################################################
# LOG PARSER MODULE
# Module for cybersecurity scenario logs into a Dataset class.
# 
# Used by train_model.py and classification_manager.py
#
# Author: Aubrey Birdwell (based on Kristian Tkacik's code)
####################################################################################################


import csv
import sys
import json
import nltk
import datetime
import numpy
from typing import List, Optional, Any

class Dataset:
    
    """
    Class representing a log dataset consisting of DatasetRecord objects.
    
    Attributes:
        records = list of DatasetRecord objects
    """

    def __init__(self):
        self.records = []

    def print_stats(self):
        """Prints dataset statistics"""
        struggled_runs_count = len(list(filter(lambda rec: rec.scenario_outcome, self.records)))
        print(f"Number of training runs: {len(self.records)}\n"
              f"Number of struggling runs: {struggled_runs_count}\n"
              f"Number of non-struggling runs: {len(self.records) - struggled_runs_count}")

class DatasetRecord:
    """Class for representing a single training run consisting of a
    command log and milestone events.

    A DatasetRecord is an individual student's log for a given
    scenario or training_group. We kept the name training group to be
    consistent with our collaborators. The DatasetRecord object holds
    a users log entrys as a list of dictionaries. Each dictionary is
    an individual log event with information about time, intput,
    output, pwd, unique user id, scenario or group id.

    The log entries are imported from a CSV file with entries having
    this structure:

    csv organization example:
    INPUT|uniqueID|class|time|uid|cwd|input|output (trunc)
    INPUT|cs211user23-ulab-0|M0|1632336950|cs211user23|/home/CS211user23|pwd|/home/CS211user23

    Attributes:
        training_group = string specifying the name of the scenario
        level_count = integer of the number of milestones or tasks
        command_log = list of dicts, where each dict represents a single command log record
        milestone_events = list of dicts, where each dict represents a single training event

    """

    def __init__(self, training_group: str, ms_count: int, user_log: list):
        #time is left in unix epoch time and treated as integer
        self.training_group = training_group
        self.ms_count = ms_count
        self.user_log = user_log

    #not needed yet, so not used
    def unique_log(self, log_data) -> list:
        """
        Returns log after removing entries with duplicate
        timestamp. Occasionally students use ssh within an ssh session
        causing an echo. May not use this function.

        :return: list[dict] containing log entries

        """
        log = []
        first_entry = log_data[0]
        [log.append(x) for x in log_data[1:] if x['time'] not in log]
        log.append(first_entry)
        log_sorted = sorted(log, key=lambda d: d['time'])
        
        return log_sorted

    ### add the statistics
    """
    def print_dataset_stats(dataset: Dataset):
        
        #Prints basic statistics about the given dataset.
        
        #:param dataset: Dataset object
        #:return: None
        
        def add_row(group_name: str, records: list):
            positive_runs_count = len(list(filter(
                lambda rec: rec.training_outcome, records
            )))
            negative_runs_count = len(records) - positive_runs_count
            command_totals = [len(rec.command_log) for rec in records]
            tab.add_row([group_name,  # Group name
                         len(records),  # Total runs
                         positive_runs_count,  # Positive runs
                         negative_runs_count,  # Negative runs
                         min(command_totals),  # Min commands
                         max(command_totals),  # Max commands
                         median(command_totals),  # Median commands
                         round(mean(command_totals), 2),  # Average commands
                         round(stdev(command_totals), 2),  # Command SD
                         sum(command_totals)])  # Total commands

        tab = PrettyTable(['', 'Total runs', 'Positive runs', 'Negative runs',
                           'Min cmds', 'Max cmds', 'Median cmds', 'Average cmds',
                           'Cmds SD', 'Total cmds'])
        tab.title = "Dataset Statistics"
        tab.align = "l"
        prev_group = ""
        group_records = []

        for record in dataset.records:
            if prev_group and record.training_group != prev_group:
                add_row(prev_group, group_records)
                group_records.clear()
                group_records.append(record)
                prev_group = record.training_group
        add_row(prev_group, group_records)
        add_row("Dataset (all groups)", dataset.records)
        print(tab)
    """
    
    @property
    def unique_tags(self) -> set:
        """ 
        Return a set of unique tags present in the log. 

        :return: set[str] containing the unique tags in log.
        """
        return {tag["ms_tag"] for tag in self.user_log if tag.get("ms_tag") is not None}
        
    @property
    def milestones_completed(self) -> set:
        """
        Return a set of unique milestone tags in a given log. 

        :return: set[str] containing only "M" + int representing the milestone acheived. 
        """
        ms = set()
        for tag in self.unique_tags:
            if "M" in tag:
                if "F" not in tag:
                    ms.add(tag)
        return ms

    @property
    def milestones_attempted(self) -> set:
        """
        Return a set of unique milestone tags in a given log. 

        :return: set[str] containing only "M" + int representing the milestone acheived. 
        """
        ms = set()
        for tag in self.unique_tags:
            if "M" in tag:
                ms.add(tag)
            if "A" in tag:
                ms.add(tag)                
        return ms

    @property
    def percent_complete(self) -> float:
        """
        Return percentage of scenario completed.

        :return: float representing percentage
        """
        return len(self.milestones_completed) / self.ms_count
        
    @property
    def scenario_outcome(self) -> bool:
        """
        Return true or false if scenario meets threshold for completion.
        
        :return: bool true if milestone tags present in log > (9/13 milestones)
        """
        # threshold correlates to 9 out of 13 milestones
        threshold = 6 / 13
        if self.percent_complete > threshold:
            return False
        else:
            return True

    @property
    def ms_times(self) -> dict:
        """
        Return a dictionary of completed milestones and their first time
        appearing
            
        :return: dict with keys and values first_instance_ms_tag : timestamp

        """

        ms_times = {}
        
        for entry in self.user_log:
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in ms_times:
                        ms_times[entry['ms_tag']] = int(entry['time'])
                        print(entry['ms_tag'] + " " + entry['time'])
                    else:
                        pass

        
        return ms_times

    @property
    def ms_command_count(self) -> dict:
        """
        Return a dictionary of completed milestones with the number of
        commands entered leading up to completion.
    
        :return: dict with keys and values first_instance_ms_tag : command_counts_between

        """
        
        ms_command_count = {}

        cmds = 0
        for entry in self.user_log:
            cmds += 1
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in ms_command_count:
                        ms_command_count[entry['ms_tag']] = cmds
                        cmds = 0
                    else:
                        pass
                    
        return ms_command_count

    @property
    def ms_error_count(self) -> List[int]:
        """
        Return an list of completed milestones with the number of errors leading up to.
    
        :return: dict with keys and values: first_instance_ms_tag : error_counts_between
        """

        ms_labels = []
        ms_errs = []
        
        errs = 0
        for entry in self.user_log:
            if 'F' in entry['ms_tag']:
                errs += 1        
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in ms_labels:
                        ms_labels.append(entry['ms_tag'])
                        ms_errs.append(errs)
                        errs = 0
                    else:
                        pass
                    
        return ms_errs

    @property
    def ms_unique_cmds(self) -> List[int]:
        """
        Returns a list of unique commands used per milestone activation.

        :return: [int] a list of numbers of unique commands used
        between first ms activations

        """
        cmds = set()
        tags = []
        ms_unique_cmds = []
        
        for entry in self.user_log:
            #add each command to set
            cmds.add(entry['cmd'][0])
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in tags:
                        #just used a list for these since we are only
                        #using min, max, and mean
                        tags.append(entry['ms_tag'])
                        ms_unique_cmds.append(len(cmds))
                        cmds = set()

        return ms_unique_cmds

    @property
    def ms_times(self) -> List[int]:
        """
        Returns a list of times beginning with the first log entry and
        followed by the first milestone activation throughout the log.

        :return: [int] of important timestamps beginning with first log entry
        """
            
        times = []
        tags = []
        times.append(int(self.user_log[0]['time']))
        for entry in self.user_log:
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in tags:
                        tags.append(entry['ms_tag'])
                        times.append(int(entry['time']))
                     
        return times

    @property
    def ms_times_absolute(self) -> List[int]:
        """
        Returns a list of times for each milestone activation.

        :return: [int] elapsed time for milestone activations
        """
        
        times = []
        tags = []
        
        for entry in self.user_log:            
            if 'M' in entry['ms_tag']:
                if 'F' not in entry['ms_tag']:
                    if entry['ms_tag'] not in tags:
                        tags.append(entry['ms_tag'])
                        #difference from beginning of log to ms completions
                        times.append(int(entry['time']) - int(self.user_log[0]['time']))

        for t in times:
            if t < 0:
                print(self.user_log[0])
        #if len(times) < 2:
        #    print(self.user_log[0])
                  
        return times

        
def create_dataset_records(dataset: Dataset, training_group: str, ms_count: int, logs: dict):        
    """We are only using one scenario. create_dataset_records takes a set
    of data of one scenario type (i.e. filewrangler) and creates DatasetRecords and adds
    them to Dataset.

    :param dataset: Dataset where the created records are added
    :param training_group: String representing the name of the training group "filewrangler"
    :param ms_count: Integer representing the number of milestones
    :param user_logs: Dictionary where key is user session and value is list of command log records
    :return: None
    """
    cnt = 0
    for user in logs:
        #examples of data format:
        #INPUT|cs211user23-ulab-0|M0|1632336950|cs211user23|/home/CS211user23|pwd| /home/CS211user23
        #INPUT|uniqueID|class|time|uid|cwd|node:input|output (trunc)
        user_log = []
        for entry in logs[user]:
            cnt += 1
            log_entry = {"user" : entry[4], "ms_tag" : entry[2], "cmd" : separate_command(entry[6]), "time" : entry[3]}
            user_log.append(log_entry)
        dataset_record = DatasetRecord(training_group, ms_count, user_log)
        dataset.records.append(dataset_record)

    print("log entries: " + str(cnt))
    return
    
def read_file(file_name):
    '''
    Takes a reader object connected to a csv file and pulls each line
    and places it into a dictionary.
    
    csv organization example:
    INPUT|uniqueID|class|time|uid|cwd|input|output (trunc)
    INPUT|cs211user23-ulab-0|M0|1632336950|cs211user23|/home/CS211user23|pwd|/home/CS211user23

    Parameters:
           file_name: a reader object to the file
    Return:
           log: a dictionary with all the entries from the csv file (with some sanitization)
    '''

    csv_file = open(file_name, 'r', encoding="utf-8")
    reader = csv.reader(csv_file, delimiter="|", quotechar="%", quoting=csv.QUOTE_MINIMAL)
    
    log = dict()
    
    for line in reader:
        if len(line) != 8:
            print(line)
        else:
            inpt = 'INPUT'
            uid = line[1]
            milestone = line[2] 
            timestamp = line[3]
            user = line[4].lower()
            path = line[5]
            command = line[6].split(':')
            output = line[7].replace('\n',' ')
            if user not in log:
                log[user] = []
            event = (inpt, uid, milestone, timestamp, user, path, command[1], output)
            log[user].append(event)

    csv_file.close()

    return log
                        
def separate_command(input_string):
    '''
    Takes a command -flags opts in raw format
    Returns (str,str,str) no spaces and sorted alphabetically

    Parameters:
            input_string: str

    Returns:
            res (Str, Str, Str)
    '''
    
    cmd_list = input_string.split(" ")

    command = ""
    command += cmd_list[0]

    opt_flags = ""

    args = []

    for field in cmd_list[1:]:
        if "-" in field:
            opt_flags += field.strip(" -")
        else:
            args.append(field)

    opt_flags = "".join(sorted(opt_flags))  
    
    args = "".join(sorted(args))

    command_split = [command,opt_flags,args]

    return command_split

#later add param for path of files to import
def main(file_name: str):
    """
    Opens a csv file and creates a dataset record object which holds
    the individual log entries.
    """
    dataset = Dataset()

    #open the file
    log = read_file(file_name)
    create_dataset_records(dataset, "file_wrangler", 13, log)

    dataset.print_stats()



    
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print('usage: enter file name')
        sys.exit(1)

    file_name = sys.argv[1] 

    main(file_name)


    


