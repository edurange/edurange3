#!/usr/bin/env python3

import yaml
import sys
# from pprint import pprint as print


def process_answers(answers, type):
    result = []
    for i, a in enumerate(answers):
        answer = dict()
        answer["answer_type"] = type
        answer["value"] = a["Value"]
        answer["points_possible"] = a["Points"]
        result.append(answer)

    return result 


questions_path = sys.argv[1]
with open(questions_path, "r") as f:
    questions = yaml.safe_load(f)


question_count = 0
result = dict()
while question_count < len(questions):
    q = dict()
    q["question_num"] = question_count + 1
    q["type"] = "question"
    q["content"] = questions[question_count]["Text"]
    q["answers"] = process_answers(
        questions[question_count]["Answers"], questions[question_count]["Type"]
    )
    q["points_possible"] = questions[question_count]["Points"]

    q_key = "Question" + str(question_count + 1)
    result[q_key] = q
    question_count += 1

yaml_string = yaml.dump(result, stream=None, sort_keys=False)
print(yaml_string)
