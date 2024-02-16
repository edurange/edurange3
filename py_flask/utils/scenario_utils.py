
import json
import os

from random import seed, getrandbits
import yaml
from py_flask.config.settings import KNOWN_SCENARIOS

# These functions have not yet been implemented, but 
# Import the scenario string, and set to 'known_types' as a list
known_types = KNOWN_SCENARIOS

import ast
import docker

from py_flask.config.extensions import db
from py_flask.database.models import Scenarios, User, Responses, User, GroupUsers, StudentGroups
from py_flask.utils.guide_utils import readQuestions
from celery import group
from py_flask.config.extensions import db
from flask import jsonify, abort, g

#DEV_FIX (paths)


class CatalogEntry:
    def __init__(self, name, description):
        self.name = name
        self.description = description

def populate_catalog():
    scenarios = [
        dI
        for dI in os.listdir("./scenarios/prod/")
        if os.path.isdir(os.path.join("./scenarios/prod/", dI))
    ]
    descriptions = []

    for s in scenarios:
        with open("./scenarios/prod/" + s + "/" + s + ".yml", "r") as yml:
            document = yaml.full_load(yml)
            for item, doc in document.items():
                if item == "Description":
                    descriptions.append(doc)
    entries = []
    for i in range(len(scenarios)):
        entries.append(CatalogEntry(scenarios[i].title(), descriptions[i]))
    return entries

def item_generator(json_input, lookup_key):
    if isinstance(json_input, dict):
        for k, v in json_input.items():
            if k == lookup_key:
                yield v
            else:
                yield from item_generator(v, lookup_key)
    elif isinstance(json_input, list):
        for item in json_input:
            yield from item_generator(item, lookup_key)

def gather_files(s_type, logger):
    c_names = []
    g_files = []
    s_files = []
    u_files = []
    package_list = []
    ip_addrs = []
    if os.path.isdir(os.path.join("./scenarios/prod/", s_type)):
        logger.info("Scenario of type {} Found".format(s_type))
        logger.info("Now attempting to load file requirements...")
        try:
            with open(
                os.path.join("./scenarios/prod/", s_type + "/" + s_type + ".json")
            ) as f:
                data = json.load(f)
                containers = item_generator(data, "name")

                for i in containers:
                    c_names.append(i)
                logger.info("Found containers: {}".format(c_names))

                global_files = item_generator(data, "global_files")
                for g in list(global_files):
                    g_files.append(g)
                logger.info("Found global files: {}".format(g_files))

                system_files = item_generator(data, "system_files")
                for s in list(system_files):
                    s_files.append(s)
                logger.info("Found system files: {}".format(s_files))

                user_files = item_generator(data, "user_files")
                for u in list(user_files):
                    u_files.append(u)
                logger.info("Found user files: {}".format(u_files))

                packages = item_generator(data, "packages")
                for p in list(packages):
                    package_list.append(p)
                logger.info("Found required packages: {}".format(package_list))

                ip_addresses = item_generator(data, "ip_address")
                for a in list(ip_addresses):
                    ip_addrs.append(a)
                logger.info("Found addresses: {}".format(ip_addrs))

                return c_names, g_files, s_files, u_files, package_list, ip_addrs
            
        except FileNotFoundError:
            logger.warn("Could Not load json file for type: {}".format(s_type))
            raise FileNotFoundError
    else:
        logger.warn("Invalid Scenario Type - Folder Not Found")
        raise Exception(f"Could not correctly identify scenario type")

def identify_type(form):
    found_type = ""
    for i, s_type in enumerate(known_types):
        if s_type in form.keys():
            found_type = s_type
    return found_type

def identify_state(name, state):
    if state == "Stopped":
        return {"Nothing to show": "Scenario is Not Running"}
    addresses = {}
    c_names = []
    name = "".join(e for e in name if e.isalnum())
    if os.path.isdir(os.path.join("./scenarios/tmp/", name)):
        # print ("PATH TEST ",os.path.join("./scenarios/tmp/", name)) #DEV_ONLY (this seems to show correct relative path)
        try:
            state_file = open("./scenarios/tmp/" + name + "/terraform.tfstate", "r")
            data = json.load(state_file)

            containers = item_generator(data, "name")
            for c in list(containers):
                if c != "string" and c not in c_names:
                    c_names.append(c)

            public_ips = item_generator(data, "ip_address_public")
            miss = 0
            for i, a in enumerate(list(public_ips)):
                if a != "string": addresses[c_names[i - miss]] = a
                else: miss += 1
            return addresses
        
        except FileNotFoundError:
            return {"No state file found": "Has the scenario been started at least once?"}
        except json.decoder.JSONDecodeError:
            return {"State file is still being written": "Try Refreshing"}

    else: return {"Could not find scenario folder": "Please destroy and re-make this scenario"}

def getDescription(scenario):
    scenario = scenario.lower().replace(" ", "_")
    with open(f"./scenarios/prod/{scenario}/{scenario}.yml", "r") as yml:
        document = yaml.full_load(yml)
        for item, doc in document.items():
            if item == "Description":
                return doc

def getPass(scenario, username):
    scenario = "".join(e for e in scenario if e.isalnum())
    with open(f'./scenarios/tmp/{scenario}/students.json') as fd:
        data = json.load(fd)
    user = data.get(username)[0]
    return user.get('password')

def getResponses(uid, att, query, questions):
    responses = []
    entries = [entry for entry in query if entry.user_id == uid and entry.attempt == att]
    for response in entries:
        qNum = response.question
        question = questions[qNum-1]
        responses.append({
            'number': qNum,
            'question': question['Text'],
            'answer': question['Answers'][0]['Value'],
            'points': question['Points'],
            'student_response': response.student_response,
            'earned': response.points
        })
    return responses

def responseSelector(resp):
    return db.session\
            .query(Responses.id, Responses.user_id, Responses.scenario_id, Responses.attempt)\
            .filter_by(id=int(resp))\
            .first().scalar_subquery()

# scoring functions used in functions such as queryPolish()
# used as: scr = score(getScore(uid, att, query), readQuestions(sName))

# required query entries: user_id, attempt, question, correct, student_response

def getTotalScore(questions):
    return sum([question['Points'] for question in questions])

def scoreSetup(questions):
    checkList = {}  # List of question to be answered so duplicates are not scored.
    for index, question in enumerate(questions):
        qNum = str(index + 1)
        if question['Type'] == "Multi String":
            checkList[qNum] = [False for _ in question['Answers']]
        else:
            checkList[qNum] = False
    return checkList

def scoreCheck(qnum, checkList):
    keys = list(checkList.keys())
    for k in keys:
        if k == str(qnum):
            if checkList[k]:
                return True, checkList  # answer has already been checked
            elif not checkList[k]:
                checkList[k] = True
                return False, checkList  # answer has not been checked before but is now checked
        elif str(qnum) in k and '.' in k:  # if multi string
            if checkList[k]:
                return True, checkList  # answer was already checked
            elif not checkList[k]:
                checkList[k] = True
                return False, checkList  # answer was not checked before but is now
    return False, checkList

def scoreCheck2(qnum, checkList, resp, quest):
    keys = list(checkList.keys())
    for k in keys:
        if k == str(qnum):
            if type(checkList[k]) == list:  # if multi string
                return False
                # check stu_resp against q.yml
                #   if stu_resp in q.yml
                #       if i in q.yml = false in checkList[k][i]
                #           return true
                #       else
            elif type(checkList[k]) == bool:    # if NOT a multi string
                if checkList[k]:
                    return True, checkList  # answer has already been checked
            elif not checkList[k]:
                checkList[k] = True
                return False, checkList  # answer has not been checked before but is now checked

def getScore(uid, att, query, questions):
    stuScore = 0
    checkList = scoreSetup(questions)
    for resp in query:
        if resp.user_id == uid and resp.attempt == att:     # if response entry matches uid and attempt number
            if resp.points > 0:                             # if the student has points i.e. if the student answered correctly
                qNum = int(resp.question)
                check, checkList = scoreCheck(qNum, checkList)      # check against checkList with question number
                if not check:
                    stuScore += resp.points
    return f'{stuScore}/{getTotalScore(questions)}'

def queryPolish(query, sName):
    questions = []
    for entry in query:
        i = entry.id
        uid = entry.user_id
        att = entry.attempt
        usr = entry.username
        if questions is None:
            scr = getScore(uid, att, query, readQuestions(sName))  # score(getScore(uid, att, query), readQuestions(sName))
            d = {'id': i, 'user_id': uid, 'username': usr, 'score': scr, 'attempt': att}
            questions.append(d)
        else:
            error = 0
            for lst in questions:
                if uid == lst['user_id'] and att == lst['attempt']:
                    error += 1
            if error == 0:
                scr = getScore(uid, att, query, readQuestions(sName))  # score(getScore(uid, att, query), readQuestions(sName))
                d = {'id': i, 'user_id': uid, 'username': usr, 'score': scr, 'attempt': att}
                questions.append(d)
    return questions

def responseProcessing(data):
    '''Response info getter.'''
    db_ses = db.session
    uid, sid = data.user_id, data.scenario_id
    uname = db_ses.query(User.username).filter(User.id == uid).first()[0]
    sname = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()[0]
    return uid, uname, sid, sname, data.attempt

def setAttempt(sid):
    currentAttempt = db.session.query(Scenarios.attempt).filter(Scenarios.id == sid).first()[0]
    if currentAttempt == 0:
        return 1
    return int(currentAttempt) + 1

def getAttempt(sid):
    return db.session.query(Scenarios.attempt).filter(Scenarios.id == sid).first()[0]

def readScenario():
    desc = []
    scenarios = [
        dI
        for dI in os.listdir("./scenarios/prod/")
        if os.path.isdir(os.path.join("./scenarios/prod/", dI))
    ]
    for scenario in scenarios:
        desc.append(getDescription(scenario))
    return 0

def recentCorrect(uid, qnum, sid):
    return db.session.query(Responses.points).filter(Responses.user_id == uid) \
        .filter(Responses.scenario_id == sid).filter(Responses.question == qnum) \
        .order_by(Responses.response_time.desc()).first()

def displayCorrectAnswers(sName, uid):
    db_ses = db.session
    sid = db_ses.query(Scenarios.id).filter(Scenarios.name == sName).first()[0]
    questions = readQuestions(sName)
    ques = {}
    for index in range(len(questions)):
        order = index+1
        recent = recentCorrect(uid, order, sid)
        if recent is not None:
            recent = recent[0]
        else: recent = -1
        ques[order] = recent
    return ques

def displayProgress(sid, uid):
    db_ses = db.session
    att = getAttempt(sid)
    sName = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()
    query = db_ses.query(Responses.attempt, Responses.question, Responses.points, Responses.student_response, Responses.scenario_id, Responses.user_id)\
        .filter(Responses.scenario_id == sid).filter(Responses.user_id == uid).all()
    questions = readQuestions(sName.name)
    answered, tQuest = getProgress(query, questions)
    score, totalScore = calcScr(uid, sid, att)  # score(uid, att, query, readQuestions(sName))  # score(getScore(uid, att, query), readQuestions(sName))
    return {
        'questions': answered,
        'total_questions': tQuest,
        'score': score,
        'total_score': totalScore
    }

def calcScr(uid, sid, att):
    score = 0
    db_ses = db.session
    sName = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()
    query = db_ses.query(Responses.points, Responses.question).filter(Responses.scenario_id == sid).filter(Responses.user_id == uid)\
        .filter(Responses.attempt == att).order_by(Responses.response_time.desc()).all()
    checkList = scoreSetup(readQuestions(sName.name))
    for r in query:
        check, checkList = scoreCheck(r.question, checkList)
        if not check:
            score += int(r.points)
    # score = '' + str(score) + ' / ' + str(totalScore(readQuestions(sName)))
    tScore = getTotalScore(readQuestions(sName.name))
    return score, tScore

def getProgress(query, questions):
    checkList = scoreSetup(questions)
    corr = 0
    total = list(checkList.keys())[-1]
    for resp in query:
        if int(resp.points) > 0:
            q = int(resp.question)
            check, checkList = scoreCheck(q, checkList)
            if not check:
                corr += 1
    return corr, total