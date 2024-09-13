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


def generate_hint(language_model, logs_dict, scenario_name, enable_scenario_context):
      start_time = time.time()

      bash_history = logs_dict['bash']
      chat_history = logs_dict['chat']
      answer_history = logs_dict['responses']

      if enable_scenario_context:
                  
            scenario_summary = load_context_file_contents('scenario_summaries', scenario_name)
            finalized_system_prompt = "You directly assist a student through a bash command based cybersecurity exercise called a scenario. Students interact with the scenario online using a bash terminal, they can then submit answers with web-based forms and ask the teacher questions via a chat messaging system. For context you will be provided the scenario's summary and the student's recent logs for bash commands, chat messages and answers. Generate them a ONE SENTENCE LONG hint, do not echo back any of their logs. If present, prioritize helping them debug errors found in their bash history and or questions they ask in their chat history."
            finalized_user_prompt = f" The scenario summary: {scenario_summary}. Recent bash commands: {bash_history}. The student's recent chat messages: {chat_history}. The student's recent answers: {answer_history}. "

            result = language_model(
                  f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
                  max_tokens=50,
                  stop=["<|end|>"], 
                  echo=False, 
                  temperature=0.8,
            ) 

            generated_hint = result["choices"][0]["text"]

            stop_time = time.time()
            function_duration = round(stop_time - start_time, 2)
      
            return generated_hint, function_duration

      else: 
                  
            finalized_system_prompt = "You directly assist a student through a bash command based cybersecurity exercise called a scenario. Students interact with the scenario online using a bash terminal, they can then submit answers with web-based forms and ask the teacher questions via a chat messaging system. For context you will be provided the student's recent logs for bash commands, chat messages and answers. Generate them a ONE SENTENCE LONG hint, do not echo back any of their logs. If present, prioritize helping them debug errors found in their bash history and or questions they ask in their chat history."
            finalized_user_prompt = f"  Recent bash commands: {bash_history}. The student's recent chat messages: {chat_history}. The student's recent answers: {answer_history}. "

            result = language_model(
                  f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
                  max_tokens=50,
                  stop=["<|end|>"], 
                  echo=False, 
                  temperature=0.8,
            ) 

            generated_hint = result["choices"][0]["text"]

            stop_time = time.time()
            function_duration = round(stop_time - start_time, 2)

            return generated_hint, function_duration
            

def load_language_model_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)
      language_model_pickle = r.get('language_model')
    
      if language_model_pickle:
            language_model = pickle.loads(language_model_pickle)
            return language_model

      else:
            raise valueError('No language model found from Redis db')

def get_available_cpu_and_gpu_resources_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)

      cpu_resources_pickle = r.get('cpu_resources')
      if cpu_resources_pickle:
            cpu_resources = pickle.loads(cpu_resources_pickle)
      else:
            raise ValueError("CPU count value not found in redis cache")
      
      gpu_resources_pickle = r.get('gpu_resources')
      if gpu_resources_pickle:
            gpu_resources = pickle.loads(gpu_resources_pickle)
      else:
            gpu_resources = 0

      return cpu_resources, gpu_resources


def load_generate_hint_task_id_from_redis():

      r = redis.StrictRedis(host='localhost', port=6379, db=1)
      generate_hint_task_id_pickle = r.get('generate_hint_task_id')
    
      if generate_hint_task_id_pickle:
            generate_hint_task_id = pickle.loads(generate_hint_task_id_pickle)
            return generate_hint_task_id

      else:
            raise valueError('No generate hint task id found from Redis db')

def load_context_file_contents(context_file_type, scenario_name):

      file_path = f"machine_learning/context_files/{context_file_type}/{scenario_name}.txt"

      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  context_file_content = file.read()
            return context_file_content

      except Exeption as e:
            print(f"Failed to load context file contents: {e}")

def export_hint_to_csv(scenario_name, generated_hint, function_duration):
      file_path = f"machine_learning/rt_generated_hint_results/{scenario_name}.csv"
      with open(file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([scenario_name, generated_hint, function_duration])





        


