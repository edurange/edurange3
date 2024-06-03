
import json
import os
from py_flask.database.models import GroupUsers, StudentGroups, Users, Channels, ChannelUsers, ChatMessages


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

def getChannelDictList_byUser(userID, username):

    avail_channel_objs = Channels.query.join(ChannelUsers, Channels.id == ChannelUsers.channel_id) \
                                  .filter(ChannelUsers.user_id == userID).all()

    channelDict_list = [channel.to_dict(include_relationships=True) for channel in avail_channel_objs]
   
    home_channel = next((chanDict['id'] for chanDict in channelDict_list if chanDict['name'] == username), None)

    channels_info = {
        "available_channels": channelDict_list,
        "home_channel": home_channel
    }

    return channels_info

def getChatHistory_byUser(userID, username):

    channelData = getChannelDictList_byUser(userID, username)
    available_channel_ids = [channel['id'] for channel in channelData['available_channels']]

    chatHistory_forUser = ChatMessages.query.filter(ChatMessages.channel.in_(available_channel_ids)).all()
    chatHistory_dictList = [message.to_dict() for message in chatHistory_forUser]

    return chatHistory_dictList

def groupAllMessages_byUser(chatLibrary_dbObj):

    chatLibrary_dict = {}
    for message in chatLibrary_dbObj:
        message_dict = message.to_dict()
        sender = message_dict['sender'] 
        
        if sender in chatLibrary_dict:
            chatLibrary_dict[sender].append(message_dict)
        else:
            chatLibrary_dict[sender] = [message_dict]

    return chatLibrary_dict

def createListOfChats(chatLibrary_dbObj):
    """
    Returns a list of dictionaries where each dictionary represents a message with all its data.
    """
    messages_list = [message.to_dict() for message in chatLibrary_dbObj]
    return messages_list

def getChatLibrary():
    """
    Fetches all chat messages and channel user entries from the database, and returns them as a list of dictionaries for messages and a dictionary for user-channel mappings.
    """
    all_db_chatMessages_rawObj = ChatMessages.query.all()
    unordered_messages_list = createListOfChats(all_db_chatMessages_rawObj)

    channel_user_entries = ChannelUsers.query.all()
    user_channels_dict = {}
    for entry in channel_user_entries:
        if entry.user_id in user_channels_dict:
            user_channels_dict[entry.user_id].append(entry.channel_id)
        else:
            user_channels_dict[entry.user_id] = [entry.channel_id]

    return {
        "unordered_messages_list": unordered_messages_list,
        "user_channels_dict": user_channels_dict
    }


def groupAllMessages_byChannel(chatLibrary_dbObj):

    chatLibrary_dict = {}
    for message in chatLibrary_dbObj:
        message_dict = message.to_dict()
        channel = message_dict['channel'] 
        
        if channel in chatLibrary_dict:
            chatLibrary_dict[channel].append(message_dict)
        else:
            chatLibrary_dict[channel] = [message_dict]

    return chatLibrary_dict
def getChatLibrary_sortByChannel():

    chatLibrary = ChatMessages.query.all()
    chatLibrary_dict = groupAllMessages_byChannel(chatLibrary)
    channel_user_entries = ChannelUsers.query.all()

    user_channels_dict = {}
    
    for entry in channel_user_entries:
        if entry.user_id in user_channels_dict:
            user_channels_dict[entry.user_id].append(entry.channel_id)
        else:
            user_channels_dict[entry.user_id] = [entry.channel_id]
    return {
        "chatLibrary_dict" : chatLibrary_dict,
        "user_channels_dict": user_channels_dict
    }
