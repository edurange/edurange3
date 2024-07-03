####################################################################################################
# FEATURE EXTRACTOR MODULE
# Extracts features from dataset
# 
# Used by train_model.py, rt_classify.py
# Author: Aubrey Birdwell (based on Kristian Tkacik's code)
####################################################################################################




import sys
import pandas as pd
import numpy as np
import matplotlib.pylab as plt
import seaborn as sns
from itertools import groupby
from statistics import mean, median, StatisticsError
from log_parser import Dataset, DatasetRecord, create_dataset_records, read_file

INFINITY = np.inf
MAX_COMMAND_GAP = 1200

CORR_THRESHOLD = 0.11

def get_unique_commands(record: DatasetRecord) -> set:
    """
    Gets a dataset record and returns the set of unique tools from its command log.

    :param record: DatasetRecord object representing a training run
    :return: Set of unique tools used in the given training run
    """
    return {command["cmd"][0] for command in record.user_log if command.get("cmd") is not None}

def longest_command_repetition(record: DatasetRecord) -> int:
    """
    Get a DatasetRecord object and return the length of the longest sequence
    of a single repeating tool (command without arguments).

    :param record: DatasetRecord object representing a training run
    :return: Length of the longest sequence of repeating tool usage
    """
    rep_lengths = []
    cmd_seq = [
        command["cmd"]
        for command in record.user_log
        if command.get("cmd") is not None
    ]
    for _, g in groupby(cmd_seq):
        rep_lengths.append(len(list(g)))
    return max(rep_lengths)

def command_repetition_count(record: DatasetRecord) -> int:
    """
    Get a DatasetRecord object and return the length of the longest sequence
    of a single repeating command.

    :param record: DatasetRecord object representing a training run
    :return: Length of the longest sequence of repeating command usage
    """
    rep_lengths = []
    cmd_seq = [
        command["cmd"]
        for command in record.user_log
        if command.get("cmd") is not None
    ]
    for _, g in groupby(cmd_seq):
        rep_lengths.append(len(list(g)))
    return len(rep_lengths) - rep_lengths.count(1)

def attempt_count(record: DatasetRecord) -> int:
    """
    Returns the number of submissions of the given type from the training run.
    The answer type must be one of {'Submitted', 'Correct', 'Wrong'}.

    :param record: DatasetRecord object representing a training run
    :return: Number of answer submissions of the specified type
    """
    return len([event for event in record.user_log if 'U' not in event.get("ms_tag")])

def user_scenario_time(record: DatasetRecord) -> int:
    """
    Returns the scenario time by subtracting last time stamp from first timestamp.

    :return: int elapsed time
    """
    log_sorted = sorted(record.user_log, key=lambda d: d['time'])
    t_secs = (int(log_sorted[-1]["time"]) - int(log_sorted[0]["time"]))
    return t_secs


def commands_per_minute(record: DatasetRecord) -> float:
    """
    Gets a dataset record and returns number of executed commands per minute
    in the training run.

    :param record: DatasetRecord object representing a training run
    :return: Number of commands per minute in the training run
    """
    log_sorted = sorted(record.user_log, key=lambda d: d['time'])
    t_secs = (int(log_sorted[-1]["time"]) - int(log_sorted[0]["time"]))
    return len(record.user_log) / t_secs


def avg_command_time_gap(record: DatasetRecord) -> float:
    """
    Returns average time gap between commands in seconds.

    :param record: DatasetRecord object representing a training run
    :return: Average time gap between commands in the given dataset record
    """
    gaps = [
        (int(record.user_log[i]["time"]) - int(record.user_log[i - 1]["time"]))
        for i in range(1, len(record.user_log) - 1)
    ]
    return mean(gaps)
    


def total_cmd_errors(record: DatasetRecord) -> int:
    """
    Returns count of total errors in user_log tags.

    :return: int of the total number of log entries with bash errors
    """
    return len([event for event in record.user_log if 'F' in event.get("ms_tag")])

def total_commands_difference(record: DatasetRecord, median_commands: int) -> int:
    """
    Returns the difference between the median number of commands
    and the total number of commands in the given dataset record.

    :param record: DatasetRecord object representing a training run
    :param median_commands: int representing median number of commands
    of a training group
    :return: The difference between the median commands and total
    commands in the dataset record
    """
    return len(record.user_log) - median_commands

def unique_commands_difference(record: DatasetRecord, median_unique_cmds: int) -> int:
    """
    Returns the difference between the median number of unique tools (commands
    without arguments) and the total number of unique tools in the given
    dataset record.

    :param record: DatasetRecord object representing a training run
    :param median_unique_tools: int representing median unique tool
    count of a training group
    :return: The difference between the median unique tool count
    and unique tool count in the dataset record
    """
    return len(get_unique_commands(record)) - median_unique_cmds


def training_time_difference(record: DatasetRecord, median_time: int) -> float:
    """
    Returns the difference between the median training time
    and the training time of the given dataset record.

    :param record: DatasetRecord object representing a training run
    :param median_time: int representing median training time
    :return: The difference between the median training time
    and training time of the dataset record
    """
    return user_scenario_time(record) - median_time

# apply to mean function calls from list comps
def try_mean(vals):
    try:
        return mean(vals)
    except ValueError:
        print(mean(vals))
        return mean(vals)

def extract_features(dataset: Dataset) -> pd.DataFrame:
    """
    
    """
    median_total_commands = median([len(record.user_log) for record in dataset.records])
    median_unique_cmds = median([len(get_unique_commands(record)) for record in dataset.records])
    median_times = median([user_scenario_time(record) for record in dataset.records])

    dataframe = pd.DataFrame({
        
        # ===== total values =====
        "scenario_times": [user_scenario_time(record) for record in dataset.records],
        "executed_cmds": [len(record.user_log) for record in dataset.records],
        "total_cmd_errors": [total_cmd_errors(record) for record in dataset.records],
        "unique_cmds": [len(get_unique_commands(record)) for record in dataset.records],
        "cmd_rep_count": [command_repetition_count(record) for record in dataset.records],
        "attempt_count": [attempt_count(record) for record in dataset.records], #rename to related_command_count

        # ===== Difference from median =====
        "total_cmds_diff": [total_commands_difference(record, median_total_commands) for record in dataset.records],
        "unique_tools_diff": [unique_commands_difference(record, median_unique_cmds)for record in dataset.records],
        "training_time_diff": [training_time_difference(record, median_times)for record in dataset.records],

        "total_unique_tags": [len(record.unique_tags) for record in dataset.records],
        "total_ms_complete": [len(record.milestones_completed) for record in dataset.records],

        
        "avg_unique_cmds_per_ms": [mean(record.ms_unique_cmds) for record in dataset.records],        
        "min_unique_cmds_per_ms": [min(record.ms_unique_cmds) for record in dataset.records],
        "max_unique_cmds_per_ms": [max(record.ms_unique_cmds) for record in dataset.records],
                       
        # ===== features concerning use of commands and tools =====
        "max_cmd_rep": [longest_command_repetition(record) for record in dataset.records],
        "cmds_per_minute": [commands_per_minute(record) for record in dataset.records],
        "avg_cmd_gap": [avg_command_time_gap(record) for record in dataset.records],

        "avg_cmds_per_ms": [mean(list(record.ms_command_count.values())) for record in dataset.records],
        "min_cmds_per_ms": [min(record.ms_command_count.items(), key=lambda x: x[1])[1] for record in dataset.records],
        "max_cmds_per_ms": [max(record.ms_command_count.items(), key=lambda x: x[1])[1] for record in dataset.records],

        # ===== features concerning answer submission =====
        "avg_time_to_ms": [mean(record.ms_times_absolute) for record in dataset.records],
        "min_time_to_ms": [min(record.ms_times_absolute) for record in dataset.records],
        "max_time_to_ms": [max(record.ms_times_absolute) for record in dataset.records],
        "avg_ms_gap": [mean(np.diff(record.ms_times)) for record in dataset.records],
        "avg_errors_per_ms": [mean(record.ms_error_count) for record in dataset.records],
        #can I take the first positive entry?
        #"min_errors_per_ms": [min(record.ms_error_count) for record in dataset.records],
        "max_errors_per_ms": [max(record.ms_error_count) for record in dataset.records],
        
        # ===== target variable =====
        "struggled": [int(record.scenario_outcome) for record in dataset.records]
        #"percent_passed": [int(record.percent_completed) for record in dataset.records]
        
    })
    
    
    # Replace np.inf with large constant
    #dataframe.replace(np.nan, sys.maxsize, inplace=True)
    
    # Replace np.nan with column maximum
    #dataframe.apply(lambda col: col.fillna(col.max(), inplace=True), axis=0)

    df_copy = dataframe.copy()
    print("data: ommited:")
    print(df_copy[df_copy["scenario_times"] >= 16000])
    print(df_copy[df_copy["scenario_times"] >= 16000].describe().transpose())
    print()
    df_filtered = df_copy[df_copy["scenario_times"] < 16000] # there are two exceptionally long sessions with over 100 commands issued
    #df_filtered = df_filtered[df_filtered["scenario_times"] > 600]
    df_filtered = df_filtered.reset_index(drop=True)

    #df_copy = dataframe.copy() #df_copy["scenario_times"] > 600

    #for col in dataframe.columns[:-1]:
    #    threshold = 3 * dataframe[col].std()
    #    pos_thresh = dataframe[col].median() + threshold
    #    neg_thresh = dataframe[col].median() - threshold

    #df_copy = df_copy[df_copy[col] < pos_thresh]
    #    df_copy = df_copy[df_copy[col] > neg_thresh]
        
    
    
    print("Number of training runs after filtering: " + str(df_filtered.shape[0]))

    print(df_filtered.describe().transpose())
    
    return df_filtered


#later add param for path of files to import
def main(file_name: str):
    """
    Main function. Parses raw dataset files, extracts features, and
    outputs correlation matrices.

    :param file_name: name of dataset file
    :return: None
    """
    dataset = Dataset()

    log = read_file(file_name)
    create_dataset_records(dataset, "file_wrangler", 13, log)

    dataset.print_stats()

    df = extract_features(dataset)
    
    
    
    df.iloc[:, 11:].describe().transpose().to_csv("results/feature-descriptive-stats.csv")
    print(df.head())

    # Correlation matrix of all features
    df_corr_all = df.iloc[:, 9:].corr(method='kendall')
    plt.figure(figsize=(16, 14))
    sns.heatmap(
        df_corr_all, annot=True, square=True,
        linewidths=0.5, annot_kws={"fontsize": 8}
    )
    plt.tight_layout()
    plt.subplots_adjust(bottom=0.13)
    corr_matrix_file = "results/corr_matrix_all.pdf"
    plt.savefig(corr_matrix_file)
    print("Correlation matrix of all extracted features exported to "
          f"{corr_matrix_file}")

    # Correlation matrix of best features
    best_features = df_corr_all.loc[
        (df_corr_all['struggled'] >= CORR_THRESHOLD) |
        (df_corr_all['struggled'] <= -CORR_THRESHOLD)
    ].index
    df_corr_best = df[best_features].corr(method='kendall')
    plt.figure(figsize=(8, 7))
    sns.heatmap(
        df_corr_best, annot=True, square=True,
        linewidths=0.5, annot_kws={"fontsize": 9}
    )
    plt.tight_layout()
    plt.subplots_adjust(bottom=0.2)
    corr_matrix_file = "results/corr_matrix_best.pdf"
    plt.savefig(corr_matrix_file)
    print("Correlation matrix with best extracted features exported to "
          f"{corr_matrix_file}")
    
    
if __name__ == "__main__":
    #proper arg check
    if len(sys.argv) != 2:
        print('usage: enter file name')
        sys.exit(1)

    file_name = sys.argv[1] 

    main(file_name)

    
