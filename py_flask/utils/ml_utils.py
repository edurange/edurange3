####################################################################################################
# PHI-3 SMALL LANGUAGE MODEL MODULE
# Program for running Microsoft's Phi-3-mini-4k-instruct-q4 small language model,
# a quantized SLM with only 4b params. Aiming to generate hints based on student bash, chat
# and answer logs.
# 
#
# Author: Taylor Wolff 
# Run $python machine_learning/local_slm/phi_3_slm.py to be prompted to input bash commands.
####################################################################################################
import sys
import time
import datetime
import os
import math
import pyopencl as cl
import asyncio
import yaml
import csv
import pickle
import redis



import llama_cpp
from llama_cpp import Llama
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding



from memory_profiler import profile, memory_usage


def initialize_model():

      def determine_cpu_resources():
            #Get hardware specifications.
            num_cpus = os.cpu_count()
            if num_cpus is None or num_cpus <= 0:
                  raise ValueError(f"Invalid CPU count: {num_cpus}")
            
            return int(math.floor(num_cpus * 0.8)) # Will use 80% of cores for process

      def determine_gpu_resources():
            #Iterate over platforms and check if gpu_device exists, if so return value to use it.
            try:
                  platforms = cl.get_platforms()
                  for platform in platforms:
                        gpu_device = platform.get_devices(device_type=cl.device_type.GPU)
                        if gpu_device:
                              return -1    

            except Exception as GPU_NOT_FOUND:
                  return 0

      #Determine resources
      cpu_resources = determine_cpu_resources()
      gpu_resources = determine_gpu_resources()
      
      #Retrieve modelfile from huggingface and initialize with llama-cpp-python.
      language_model = Llama.from_pretrained(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
            filename="Phi-3-mini-4k-instruct-q4.gguf",
            verbose=False,
            n_ctx=4086, 
            n_threads=cpu_resources, 
            n_gpu_layers=gpu_resources, # By default set's to -1 if GPU is detected to offload as much work as possible to GPU.
            use_mlock=True, # Force system to keep model in memory
            use_mmap=True,  # Use mmap if possible
            flash_attn=True,
    )
      return language_model




# @profile
def generate_hint(language_model, logs_dict):

      bash_history = logs_dict['bash']
      chat_history = logs_dict['chat']
      answer_history = logs_dict['responses']

      finalized_prompt = f'''

            You are an instruction AI that assists a struggling student working on a cyber-security scenario. 
            You will be provided a private answer key and summary to the question they're currently completing, 
            as well as the recent bash, chat, and answer history of the student.
            

            . That was the end of the answer guide, now I will provide you the recent bash, chat, and answer history of the student:

            . These are the student's recent bash commands: {bash_history}.

            . These are the student's recent chat messages: {chat_history}.

            . These are the student's recent answers to the question forms: {answer_history}.

            . Now provide the student a short hint based off their bash, chat and answer history
            on what to do next, but prioritize giving them a hint on debugging current bash errors from their bash commands that they're 
            experiencing. You only instruct and must never ask for additional information. You do not suggest hints in the 
            format of a list or steps. You do not discuss the answer key with the student.
            
            '''

      result = language_model(
            f"<|user|>\n{finalized_prompt}<|end|>\n<|assistant|>",
            max_tokens=100,
            stop=["<|end|>"], 
            echo=False, 
            temperature=0.9,
      ) 

      generated_hint = result["choices"][0]["text"]

      return {'generated_hint': generated_hint}



def load_language_model_from_redis():

        r = redis.StrictRedis(host='localhost', port=6379, db=1)
        language_model_pickle = r.get('language_model')
    
        if language_model_pickle:
            language_model = pickle.loads(language_model_pickle)
            return language_model

        else:
            valueError('No language model found from Redis db')
            return None


        


