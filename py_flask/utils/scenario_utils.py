import json
import os

from random import seed, getrandbits
import yaml
from py_flask.config.settings import KNOWN_SCENARIOS

# Import the scenario string, and set to 'known_types' as a list
known_types = KNOWN_SCENARIOS

import ast
import docker

from py_flask.config.extensions import db
from py_flask.database.models import Scenarios, User, Responses

from celery import group
from py_flask.config.extensions import db
from py_flask.database.models import User, GroupUsers, StudentGroups, Scenarios
from flask import jsonify, abort, g

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
    if os.path.isdir(os.path.join("./data/tmp/", name)):
        try:
            state_file = open("./data/tmp/" + name + "/terraform.tfstate", "r")
            data = json.load(state_file)

            containers = item_generator(data, "name")
            for c in list(containers):
                if c != "string" and c not in c_names:
                    c_names.append(c)

            public_ips = item_generator(data, "ip_address_public")
            miss = 0
            for i, a in enumerate(list(public_ips)):
                if a != "string":
                    addresses[c_names[i - miss]] = a
                else:
                    miss += 1

            # returns a list
            return addresses

        except FileNotFoundError:
            return {
                "No state file found": "Has the scenario been started at least once?"
            }
        except json.decoder.JSONDecodeError:
            return {"State file is still being written": "Try Refreshing"}

    else:
        return {"Could not find scenario folder": "Please destroy and re-make this scenario"}

def gen_chat_names(student_ids, sid): 
    """
    Synopsis
    --------
    Return a mapping of student IDs to temporary anonymous chat usernames.
    One name is created as <adjective><Noun> in camel case. Assumes the number of 

    Parameters
    ----------
    sid : int
        Scenario id

    Returns
    -------
    dict
        Dictionary of {student ID : chatname} mappings
    
    """

    nouns = [
            "Animal",      "Horse",     "Parrot",   "Rainbow",    "Lizard",
            "Ghost",       "Oyster",    "Potato",   "Fish",       "Lion",
            "Kangaroo",    "Rocket",    "Engine",   "Magician",   "Tractor",
            "Poetry",      "Piano",     "Finger",   "Ambassador", "Boxer",
            "Goldsmith",   "Scavenger", "Surgeon",  "Chemist",    "Cobra",
            "Elk",         "Wolf",      "Tiger",    "Shark",      "Otter",
            "Fox",         "Falcon",    "Badger",   "Bear",       "Raven",
            "Rabbit",      "Hare",      "Ant",      "Scorpion",   "Owl",
            "Finch",       "Starling",  "Sparrow",  "Bulldozer",  "Astronomer",
            "Philosopher", "Engineer",  "Catfish",  "Pirate",     "Builder",
            "Captain",     "Sailor",    "Cactus",   "Genie",      "Chimera",
            "Banshee",     "Dragon",    "Pheonix",  "Basilisk",   "Griffin",
            "Centaur",     "Sprite",    "Golem",    "Sphinx",     "Moose",
            "Mongoose",    "Star",      "Starfish", "Comet",      "Argonaut"
        ]

    adjectives = [
        "blue",          "fast",       "squirrely",     "round",
        "extravagant",   "orange",     "red",           "small",
        "rotund",        "supreme",    "inconspicuous", "fancy",
        "enraging",      "unseen",     "proper",        "green",
        "fabulous",      "nostalgic",  "shy",           "large",
        "oblivious",     "obvious",    "extreme",       "unphased",
        "frightening",   "suspicious", "miniscule",     "enormous",
        "gigantic",      "pink",       "fuzzy",         "sleek",
        "fantastic",     "boring",     "colorful",      "loud",
        "quiet",         "powerful",   "focused",       "confusing",
        "skillful",      "purple",     "invisible",     "undecided",
        "calming",       "tall",       "flat",          "octagonal",
        "hexagonal",     "triangular", "robust",        "thorough",
        "surprising",    "unexpected", "whimsical",     "musical",
        "imaginary",     "squishy",    "intricate",     "complex",
        "uncomplicated", "efficient",  "hidden",        "sophisticated",
        "ridiculous",    "strong",     "turquoise",     "plentiful",
        "yodeling",      "sneaky"
    ]

    # Get group id from scenario id

    # Collect only the useful part of the DB query
    student_ids = map(lambda row: row[0], student_ids)
    
    seed(sid)
    # Note the size of the word arrays are specified here
    return {id: adjectives[getrandbits(32)%70] + nouns[getrandbits(32)%70] for id in student_ids}
    
#
#   INSTRUCTOR SCENARIO INTERFACE
#


# Guide utils are functions that primarily populate and run the 
# question & answer 'guide' that students see on the eduRange webpage (not the terminal ssh)

## TESTED/WORKING

def getContent(scenario_id, username):
    db_ses = db.session
    statusSwitch = {
        0: "Stopped",
        1: "Started",
        2: "Something went very wrong",
        3: "Starting",
        4: "Stopping",
        5: "ERROR",
        7: "Building"
    }
    status = db_ses.query(Scenarios.status).filter(Scenarios.id == scenario_id).first()
    status = statusSwitch[status[0]]

    unique_name = db_ses.query(Scenarios.name).filter(Scenarios.id == scenario_id).first()
    if unique_name: unique_name = unique_name[0]
    if (not unique_name
    or status != "Started"): abort(418) 
      
    unique_name = "".join(e for e in unique_name if e.isalnum())
    
    with open(f'data/tmp/{unique_name}/student_view/content.json', 'r') as fp:
        contentJSON = json.load(fp)
    with open(f'data/tmp/{unique_name}/students.json', 'r') as fp:
        credentialsJSON = json.load(fp)
    
    saniName = username.replace('-','')
    user_creds = credentialsJSON[saniName][0]
    if not user_creds: abort(418)
    return contentJSON, user_creds, unique_name

def getScenarioMeta(scenario_id):
        db_ses = db.session
        scenario = db_ses.query (Scenarios).filter_by(id=scenario_id).first()

        scenario_info = {
            "scenario_id": scenario.id,
            "scenario_name": scenario.name,
            "scenario_description": scenario.description,
            "scenario_owner_id": scenario.owner_id,
            "scenario_created_at": scenario.created_at,
            "scenario_status": scenario.status,
        }
        return scenario_info

def bashResponse(sid, uid, ans):
    db_ses = db.session

    uName = db_ses.query(User.username).filter(User.id == uid).first()[0]
    uName = "".join(e for e in uName if e.isalnum())

    sName = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()[0]
    sName = "".join(e for e in sName if e.isalnum())

    if "${player.login}" in ans:
        students = open(f"./data/tmp/{sName}/students.json")
        user = ast.literal_eval(students.read())
        username = user[uName][0]["username"]
        ansFormat = ans[0:6]
        newAns = ansFormat + username
        return newAns
    elif "${scenario.instances" in ans:
        wordIndex = ans[21:-1].index(".")
        containerName = ans[21:21+wordIndex]
        containerFile = open(f"./data/tmp/{sName}/{containerName}.tf.json")
        content = ast.literal_eval(containerFile.read())
        index = content["resource"][0]["docker_container"][0][sName + "_" + containerName][0]["networks_advanced"]
        ans = ""
        for d in index:
            if d["name"] == (sName + "_PLAYER"):
                ans = d["ipv4_address"]

        return ans

    return ans

def readQuestions(scenario):
    scenario = "".join(e for e in scenario if e.isalnum())

    with open(f"./data/tmp/{scenario}/questions.yml") as yml:
        return yaml.full_load(yml)

def evaluateResponse(user_id, scenario_id, question_num, student_response):
    """Check student answer matches correct one from YAML file."""
    db_ses = db.session
    scenario = db_ses.query (Scenarios).filter_by(id=scenario_id).first()
    scenario_uniqueName = scenario.name
    questions = readQuestions(scenario_uniqueName)
    question = questions[question_num-1]

    responseData = []

    print("evaluateResponse says student_response: ", student_response)

    for i in question['Answers']:

        correctResponse = str(i['Value'])

        tempResponseItem = {
            "submitted_response":student_response,
            "correct_response":correctResponse,
            "points_awarded":0
        }

        if "${" in correctResponse:
            correctResponse = bashResponse(scenario_id, user_id, correctResponse)

        if student_response == correctResponse or correctResponse == 'ESSAY':
            pointsAwarded = i['Points']
            tempResponseItem['points_awarded'] = pointsAwarded

        responseData.append (tempResponseItem)

    return responseData

### UNTESTED / DEV 

def get_dockerPort (scenario_unique_name):

    # use name to select docker container
    docClient = docker.from_env()
    active_containers = docClient.containers.list()

def getDescription(scenario):
    scenario = scenario.lower().replace(" ", "_")
    with open(f"./scenarios/prod/{scenario}/{scenario}.yml", "r") as yml:
        document = yaml.full_load(yml)
        for item, doc in document.items():
            if item == "Description":
                return doc


def getPass(scenario, username):
    scenario = "".join(e for e in scenario if e.isalnum())

    with open(f'./data/tmp/{scenario}/students.json') as fd:
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

    # for entry in responses:
    #     if entry.id == int(resp):
    #         return entry

# scoring functions used in functions such as queryPolish()
# used as: scr = score(getScore(uid, att, query), questionReader(sName))

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
        #elif str(qnum) in k:
            #flash("Could not check question {0} with key {1}".format(qnum, k))

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


# query(Responses.user_id, Responses.attempt, Responses.question, Responses.points, Responses.student_response)
# .filter(Responses.scenario_id == sid).filter(Responses.user_id == uid).filter(Responses.attempt == att).all()


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


def questionReader(scenario):
    scenario = "".join(e for e in scenario if e.isalnum())

    with open(f"./data/tmp/{scenario}/questions.yml") as yml:
        return yaml.full_load(yml)


def queryPolish(query, sName):
    questions = []
    for entry in query:
        i = entry.id
        uid = entry.user_id
        att = entry.attempt
        usr = entry.username
        if questions is None:
            scr = getScore(uid, att, query, questionReader(sName))  # score(getScore(uid, att, query), questionReader(sName))
            d = {'id': i, 'user_id': uid, 'username': usr, 'score': scr, 'attempt': att}
            questions.append(d)
        else:
            error = 0
            for lst in questions:
                if uid == lst['user_id'] and att == lst['attempt']:
                    error += 1
            if error == 0:
                scr = getScore(uid, att, query, questionReader(sName))  # score(getScore(uid, att, query), questionReader(sName))
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
    questions = questionReader(sName)
    ques = {}

    for index in range(len(questions)):
        order = index+1
        recent = recentCorrect(uid, order, sid)
        if recent is not None:
            recent = recent[0]
        else:
            recent = -1

        ques[order] = recent

    return ques


def displayProgress(sid, uid):
    db_ses = db.session
    att = getAttempt(sid)
    sName = db_ses.query(Scenarios.name).filter(Scenarios.id == sid).first()
    query = db_ses.query(Responses.attempt, Responses.question, Responses.points, Responses.student_response, Responses.scenario_id, Responses.user_id)\
        .filter(Responses.scenario_id == sid).filter(Responses.user_id == uid).all()
    questions = questionReader(sName.name)
    answered, tQuest = getProgress(query, questions)
    score, totalScore = calcScr(uid, sid, att)  # score(uid, att, query, questionReader(sName))  # score(getScore(uid, att, query), questionReader(sName))

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
    checkList = scoreSetup(questionReader(sName.name))
    for r in query:
        check, checkList = scoreCheck(r.question, checkList)
        if not check:
            score += int(r.points)
    # score = '' + str(score) + ' / ' + str(totalScore(questionReader(sName)))
    tScore = getTotalScore(questionReader(sName.name))

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