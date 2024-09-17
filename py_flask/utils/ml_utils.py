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

def get_system_resources():
      
      def determine_cpu_resources():   
        num_cpus = os.cpu_count()
        if num_cpus and num_cpus > 0:
            return num_cpus
        else:   
            raise ValueError(f"Invalid CPU count: {num_cpus}")

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

      return cpu_resources, gpu_resources

def create_model_object(cpu_resources, gpu_resources):  
      try:
            language_model_object = Llama.from_pretrained(
                  repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
                        filename="Phi-3-mini-4k-instruct-q4.gguf",
                        verbose=False,
                        n_ctx=4086, 
                        n_threads=cpu_resources, 
                        n_gpu_layers=gpu_resources,
                        flash_attn=True,
                        use_mlock=True,
            )
            return language_model_object

      except Exception as e:
            raise Exception(f"Failed to initialize model object: {e}")

def load_context_file_contents(context_file_type, scenario_name):
      file_path = f"machine_learning/context_files/{context_file_type}/{scenario_name}.txt"
      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  context_file_content = file.read()
            return context_file_content

      except Exception as e:
            print(f"Failed to load context file contents: {e}")

def generate_hint(language_model, logs_dict, scenario_name, disable_scenario_context, temperature):
      start_time = time.time()
      bash_history = logs_dict['bash']
      chat_history = logs_dict['chat']
      answer_history = logs_dict['responses']

      if disable_scenario_context:
                  
            finalized_system_prompt = "##A student is completing a cyber-security scenario, look at their bash, chat and question/answer history and provide them a single concise hint on what to do next. The hint must not exceed two sentences in length."
            finalized_user_prompt = f"  The student's Recent bash commands: {bash_history}. The student's recent chat messages: {chat_history}. The student's recent answers: {answer_history}. "

            result = language_model(
                  f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
                  max_tokens=30,
                  stop=["<|end|>"], 
                  echo=False, 
                  temperature=temperature,
            ) 

            generated_hint = result["choices"][0]["text"]

            stop_time = time.time()
            function_duration = round(stop_time - start_time, 2)

            return generated_hint, function_duration

      else: 
                  
            scenario_summary = load_context_file_contents('scenario_summaries', scenario_name)
            finalized_system_prompt = "##A student is completing a cyber-security scenario, review the scenario guide along with their bash, chat and question/answer history and provide them a single concise hint on what to do next. The hint must not exceed two sentences in length."
            finalized_user_prompt = f" The scenario summary: {scenario_summary}. The student's recent bash commands: {bash_history}. The student's recent chat messages: {chat_history}. The student's recent answers: {answer_history}. "

            result = language_model(
                  f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
                  max_tokens=30,
                  stop=["<|end|>"], 
                  echo=False, 
                  temperature=temperature,
            ) 

            generated_hint = result["choices"][0]["text"]

            stop_time = time.time()
            function_duration = round(stop_time - start_time, 2)
      
            return generated_hint, function_duration

def export_hint_to_csv(scenario_name, generated_hint, function_duration):
      file_path = f"machine_learning/rt_generated_hint_results/{scenario_name}.csv"
      with open(file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([scenario_name, generated_hint, function_duration])






        


