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
import os
import math
import pyopencl as cl
import asyncio
import yaml

import llama_cpp
from llama_cpp import Llama
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from memory_profiler import profile, memory_usage


#Checking user hardware specs, this also checks if the user has a local GPU as this allows offloading 
# and accelerates generation drastically
def check_hardware_specs():

      #I can't imagine the CPU not existing if they're running the program right?....right?...
      def get_cpu_specs():
            num_cpus = os.cpu_count()
            return int(num_cpus)
            
      #Checks for available graphics cards.
      def get_gpu_specs():
            try:
                  platforms = cl.get_platforms()
                  num_gpus = 0
                  
                  for platform in platforms:
                        devices = platform.get_devices(device_type=cl.device_type.GPU)
                        num_gpus += len(devices)
                  return num_gpus
                           
            except Exception as GPU_NOT_FOUND:
                  return 0
      
      num_cpus = get_cpu_specs()
      num_gpus = get_gpu_specs()
      
      return num_cpus, num_gpus

#Calculates scaled core usage, also enables GPU offloading.
def set_cpu_gpu_resources(gpu_enable, n_threads_scaler):

      num_cpus, num_gpus= check_hardware_specs()

      #Logic for setting CPU resources
      cpu_resources = int(num_cpus / n_threads_scaler) if num_cpus >= 4 else ValueError("At least 4 CPU Cores required")
      gpu_resources = -1 if gpu_enable and num_gpus and num_gpus > 0 else 0
      
      #Print to CLI the current resources being used
      print("\nGPU Detected, offloading automatically enabled") if gpu_resources !=0 else print("No GPU detected, program will run on CPU")
      print(f"Number of threads to be used: {cpu_resources}\n")
      return cpu_resources, gpu_resources



def prompt_model(slm, prompt):
          
      output = slm(
            #Prompt
            f"<|user|>\n{prompt}<|end|>\n<|assistant|>",
            max_tokens=4080,
            stop=["<|end|>"], 
            echo=False, 
            temperature=1.0,
      ) 

      return output["choices"][0]["text"]
      


def initialize_model(gpu_enable, n_threads_scaler):
         
      cpu_resources, gpu_resources = set_cpu_gpu_resources(gpu_enable, n_threads_scaler)
      

      slm = Llama.from_pretrained(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
            filename="Phi-3-mini-4k-instruct-q4.gguf",
            verbose=False,
            n_ctx=4086, 
            n_threads=cpu_resources, 
            n_gpu_layers=gpu_resources
      )

      return slm



def retrieve_and_parse_scenario_guide(scenario):

      scenario_guide_path = f'scenarios/prod/{scenario}/guide_content.yml' 

      with open(scenario_guide_path, 'r', encoding='utf-8') as file:
            parsed_scenario_guide = file.read()

      return parsed_scenario_guide



def input_context_system(scenario, username):

      #Will be a function call to getLogs()
      bash_history = "1. $gcc -o empty empty.c 2. gcc: error: empty.c: No such file or directory 3. gcc: fatal error: no input files 4. compilation terminated. 5. $ls 6. $ls"
      chat_history = "1. STUDENT: Why can't I compile?" 
      answer_history = " "

      prompt_dict = {
            "system_prompt" : "You are an instruction AI that assists a struggling student working on a cyber-security scenario. You will be provided an answer key to the question their currently completing, as well as the recent bash, chat and answer history of the student. Provide them a hint on what to do next, but prioritize asssisting them with debugging current bash errors they're experiencing. Do not ask them questions",
            "scenario_guide_context_preface" : " This is the answer do not reveal it's contents directly in any hint. ",
            "parsed_scenario_guide_end" : ". You the AI have now reached the end of the answer key, you the AI do not reveal it's contents to the student. ",
            # "parsed_scenario_guide": retrieve_and_parse_scenario_guide(scenario), # DEV_FIX 
            "logs_context_preface" : ". Now I will provide you the recent bash, chat and answer history of the student: ",
            "bash_history_prompt" : f"These are the student's recent bash commands: {bash_history}. ",
            "chat_history_prompt" : f"These are the student's recent chat messages: {chat_history}. ",
            "answer_history_prompt" : f"These are the student's recent answers to the question forms: {answer_history}. "
      }
      

      #Faster operation to initialize as dict and str.join()
      finalized_prompt = " ".join(str(value) for value in prompt_dict.values())
      print("INPUT CONTEXT PROMPT FOR MODEL: ")
      print(f"\n\n{finalized_prompt}\n")
      return finalized_prompt

