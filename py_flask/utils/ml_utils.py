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

      learning_objectives = load_learning_objectives_from_txt(scenario_name)

      finalized_system_prompt = "You assist a student through a bash command based cybersecurity exercise called a scenario. Students interact with the scenario online using a bash terminal, they can then submit answers with web-based forms and ask the teacher questions via a chat messaging system. For context you will be provided a document outlining the scenario's learning objectives along with the student's recent logs for bash commands, chat messages and answers. Taking all of these into account you generate them a single sentence long hint, prioritizing assisting them in debugging syntactical errors or questions asked in their chat messages. Assist them in understanding the relavant topics, ideas and vocabulary. Never reveal the answer to the scenario task entirely."
      finalized_user_prompt = f"CONTEXT: The scenario learning objectives: {learning_objectives}. The student's recent bash commands: {bash_history}. The student's recent chat messages: {chat_history}. The student's recent answers: {answer_history}. "

      result = language_model(
            f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
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

def load_cpu_and_gpu_resources_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)
      cpu_resources_pickle = r.get('language_model_cpu_resources')
      if cpu_resources_pickle:
            cpu_resources = pickle.loads(cpu_resources_pickle)
      else:
            cpu_resources = None
      
      gpu_resources_pickle = r.get('language_model_gpu_resources')

      if gpu_resources_pickle:
            gpu_resources = pickle.loads(gpu_resources_pickle)
      else:
            gpu_resources = None

      return cpu_resources, gpu_resources


def load_generate_hint_task_id_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)
      generate_hint_task_id_pickle = r.get('generate_hint_task_id')
    
      if generate_hint_task_id_pickle:
            generate_hint_task_id = pickle.loads(generate_hint_task_id_pickle)
            return generate_hint_task_id

      else:
            valueError('No generate hint task id found from Redis db')
            return None

def load_learning_objectives_from_txt(scenario_name):

      file_path = f"machine_learning/learning_objectives_files/{scenario_name}.txt"
      with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()
      return file_content



        


