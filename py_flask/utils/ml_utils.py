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

# @profile
def generate_hint(language_model, logs_dict, scenario_name):

      bash_history = logs_dict['bash']
      chat_history = logs_dict['chat']
      answer_history = logs_dict['responses']

      load_learning_objectives_from_txt(scenario_name)

      finalized_system_prompt = f'''

            ROLE: 
            Your are an AI assistant that only instructs and does conversate or ask questions, you assist students in completing a cyber-security scenario by generating them a short and concise hint based off their bash commands, chat messages, and or answers.
            
            # Still deciding how to feed context to the model's prompt.

            CONTEXT: 
            For context this is the scenario's learning objectives: "{load_learning_objectives_from_txt}". 

            '''
            
      finalized_user_prompt = f'''

            CONTEXT: 
            You will now be provided with the student's recent bash, chat and question/answer response history.

            The student's recent bash commands: {bash_history}. 
            The student's recent chat messages: {chat_history}.
            The student's recent question/answer responses: {answer_history}.

            TASK:
            Using the student's recent bash commands, recent chat messages and or recent question/answer responses as context, now generate them a simple hint based off the learning objective. 
            Prioritize assisting the student in debuging errors you see in their bash history if applicable and or helping them understand technical definitions expressed in their chat or answers history if applicable. 

            '''
      result = language_model(
            f"<|system|>\n{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
            max_tokens=-1,
            stop=["<|end|>"], 
            echo=False, 
            temperature=0.8,
      ) 

      generated_hint = result["choices"][0]["text"]

      return generated_hint



def load_language_model_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)
      language_model_pickle = r.get('language_model')
    
      if language_model_pickle:
            language_model = pickle.loads(language_model_pickle)
            return language_model

      else:
            valueError('No language model found from Redis db')
            return None

def load_learning_objectives_from_txt(scenario_name):

      file_path = f"machine_learning/context_files/{scenario_name}.txt"
      with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()
      return file_content



        


