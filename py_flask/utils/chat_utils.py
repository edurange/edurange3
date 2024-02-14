
import json
import os

from random import seed, getrandbits

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
    