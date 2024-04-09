import csv
import os
from py_flask.database.models import Scenarios
from py_flask.config.extensions import db
from flask import (
    current_app
)

def readCSV(value, attribute):
    if attribute == 'id':
        sName = db.session.query(Scenarios.name).filter(Scenarios.id == value).first()[0]
        sName = "".join(e for e in sName if e.isalnum())
    else:
        sName = value

    fd = open(f"./scenarios/tmp/{sName}/{sName}-history.csv")
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

def claimOctet():

    lowest_octet = int(os.getenv("SUBNET_STARTING_OCTET", 10))

    # Define the path to the CSV file
    csv_file_path = os.path.join(current_app.root_path, 'py_flask', 'config', 'used_octets.csv')

    # Read the octets from the CSV file
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        OCTET_SET = {int(row['octet']) for row in reader}

    # Find the lowest available octet
    octet_int = lowest_octet
    while octet_int in OCTET_SET:
        octet_int += 1
    print(octet_int)
    OCTET_SET.add(octet_int)

    # Write the updated octets back to the CSV file
    with open(csv_file_path, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=['octet'])
        writer.writeheader()
        for octet in OCTET_SET:
            writer.writerow({'octet': octet})
    
    return octet_int

def discardOctet(int_to_discard):

    int_to_discard = int(int_to_discard)
    # Define the path to the CSV file
    csv_file_path = os.path.join(current_app.root_path, 'py_flask', 'config', 'used_octets.csv')

    # Read the octets from the CSV file
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        OCTET_SET = {int(row['octet']) for row in reader}

    # Remove the specified octet
    OCTET_SET.discard(int_to_discard)

    # Write the updated octets back to the CSV file
    with open(csv_file_path, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=['octet'])
        writer.writeheader()
        for octet in OCTET_SET:
            writer.writerow({'octet': octet})

    return int_to_discard