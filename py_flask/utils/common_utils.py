import random
import redis
import pickle
import pyopencl as cl
import json
import os
import random
import shutil
import string
import subprocess
import yaml
import redis
import pickle
import time
import datetime
import math
import pyopencl as cl
import asyncio
import csv
from ctransformers import AutoModelForCausalLM

def generate_alphanum(length):
    alphanums = '1234567890abcdefghijklmnopqrstuvwxyz'
    return ''.join(random.choice(alphanums) for _ in range(length))


def get_system_resources():

    def determine_cpu_resources():   
        num_cpus = os.cpu_count()
        return num_cpus

    def determine_gpu_resources():
        try:
            platforms = cl.get_platforms()
            for platform in platforms:
                gpu_device = platform.get_devices(device_type=cl.device_type.GPU)
                if gpu_device:
                    return -1
            return 0   

        except Exception as GPU_NOT_FOUND:
            return 0
      
    cpu_resources = determine_cpu_resources()
    gpu_resources = determine_gpu_resources()
      
    return {'cpu_resources': cpu_resources, 'gpu_resources': gpu_resources}