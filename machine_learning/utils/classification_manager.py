####################################################################################################
# CLASSIFICATION MANAGER MODULE
# Manages execution, compute and logging of the real time classification with Naive Bayes
# 
# Takes command arg of
# python py_flask\utils\classification_manager.py py_flask\mode\{model name}.joblib py_flask\log\{output for probability}.csv {Compute and update frequency}
# EXAMPLE:
# python py_flask\utils\classification_manager.py py_flask\model\trained_model.joblib py_flask\log\student_probability_table.csv 4
#
#
# Author: Taylor Wolff (building off of Aubrey Birdwell's modules)
####################################################################################################


import sys
import time
import csv
import joblib
import pandas as pd
from memory_profiler import profile, memory_usage
from py_flask.utils.instructor_utils import getLogs

import sys
import joblib
import pandas as pd

from feature_extractor import extract_features
from log_parser import Dataset, DatasetRecord, create_dataset_records, read_file



def get_rt_logs():
    rt_logs = getLogs()
    rt_bash_logs = rt_logs["bash"]
    rt_chat_logs = rt_logs["chat"]
    rt_response_logs = rt_logs["responses"]
    
    return rt_bash_logs, rt_chat_logs, rt_response_logs


def rt_classify_student(model_filename, rt_bash_logs):

    #Load model using joblib
    classifier_model = joblib.load(model_filename)

    dataset = Dataset()

    #Create dataset records with log_parser.py
    log = rt_bash_logs
    create_dataset_records(dataset, "file_wrangler", 13, log)

    #Extract features with feature_extractor.py module
    extracted_features = extract_features(dataset)
    
    #Map extracted features
    x = extracted_features.iloc[:, 11:-1]
    y = extracted_features["struggled"]

    #Compute prediction
    prediction_result = classifier_model.predict_proba(x)
   
    return prediction_result

def update_table(prediction_result, table_file):

    probability_of_completion = round(prediction_result[0][1], 2)

    with open(r'log\student_probability_table.csv', mode='a', newline='') as file:
        writer = csv.writer(file)

        #Takes arg as list
        writer.writerow([probability_of_completion])

def start_rt_classifier(model_filename, table_file, frequency):

    run_rt_classifier = True

    while run_rt_classifier:
        rt_bash_logs, rt_chat_logs, rt_responses_logs = get_rt_logs()
        prediction_result = rt_classify_student(model_filename, rt_bash_logs)
        update_table(prediction_result, table_file)
        time.sleep(int(frequency))
    

def main(model_filename, table_file, frequency):
    
    start_rt_classifier(model_filename, table_file, frequency)



if __name__ == "__main__":
   
    if len(sys.argv) != 4:
        print('usage: enter file name')
        sys.exit(1)

   
    model_filename = sys.argv[1]
    table_file = sys.argv[2]
    frequency = sys.argv[3]
    main(model_filename, table_file, frequency)


