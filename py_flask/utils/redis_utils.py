import json
import logging
import os
import random
import string
import subprocess
import yaml
import redis
import pickle
import time
from datetime import datetime


def get_resource_settings_from_redis(arg_sys_db_redis_client):

        try:
            cpu_resources = arg_sys_db_redis_client.get("cpu_resources")
            gpu_resources = arg_sys_db_redis_client.get("gpu_resources")

        except Exception as e:
            raise Exception (f"ERROR: Failed to retrieve cpu/gpu resources from redis db1. Additioanl information: [{e}]")
        
        return {'cpu_resources': cpu_resources, 'gpu_resources': gpu_resources}
    
def get_logs_dict_from_redis(arg_user_db_redis_client):

        try:
            logs_dict_pickle = arg_user_db_redis_client.get("logs_dict")

        except Exception as e:
            raise Exception (f"ERROR: Failed to retrieve 'logs_dict' from redis db2: [{e}]")

        try:
            logs_dict = pickle.loads(logs_dict_pickle)
        
        except Exception as e:
            raise Exception (f"ERROR: Failed to load logs_dict pickle: [{e}]")
        
        return logs_dict