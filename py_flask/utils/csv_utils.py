import csv
import os
from py_flask.database.models import Scenarios
from py_flask.config.extensions import db


def readCSV(value, attribute):
    with open('./logs/archive_id.txt', 'r') as log_id_file:
        this_archive_id = log_id_file.read().rstrip()
    if attribute == 'id':
        sName = db.session.query(Scenarios.name).filter(Scenarios.id == value).first()[0]
        sName = "".join(e for e in sName if e.isalnum())
    else:
        sName = value

    fd = open(f"./scenarios/tmp/{sName}/{sName}-{this_archive_id}.csv")
    reader = csv.reader(fd, delimiter="|", quotechar="%", quoting=csv.QUOTE_MINIMAL)

    return [row for row in reader if len(row) == 8]


def groupCSV(arr, keyIndex): # keyIndex - value in csv line to group by
    dict = {}
    for entry in arr:
        key = str(entry[keyIndex].replace('-', ''))
        if key in dict:
            dict[key].append(entry)
        else:
            dict[key] = [entry]

    return dict
