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
import llama_cpp
from llama_cpp import Llama
import sys
import os
import math
import pyopencl as cl
from memory_profiler import profile, memory_usage
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import asyncio
import yaml

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
      
      print(num_gpus)
      print(num_cpus)
   
      
      return num_cpus, num_gpus

#Calculates scaled core usage, also enables GPU offloading.
def set_cpu_gpu_resources():

      num_cpus, num_gpus= check_hardware_specs()

      #Logic for setting GPU and CPU resources
      cpu_resources = num_cpus
      gpu_resources = 0 if num_gpus == 0 or num_gpus is None else 12
      
      return cpu_resources, gpu_resources

def prompt_model(slm, prompt):
          
      output = slm(
            #Prompt
            f"<|user|>\n{prompt}<|end|>\n<|assistant|>",
            max_tokens=4080,
            stop=["<|end|>"], 
            echo=False, 
            temperature=0.7,
      ) 

      return output["choices"][0]["text"]
      

def initialize_model():
         
      cpu_resources, gpu_resources = set_cpu_gpu_resources()

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



def input_context_system(scenario):

      #Additional system and context prompts
      system_prompt = "You are an AI that assists a struggling student working on a cyber-security scenario, a student interacts with the exercise using the command line terminal. Additionally they may be asked to fill in their answers to questions with forms, you review their recent bash, chat and question answer history and provide them a very short hint relevant to the scenario guide I will provide you now, "
      scenario_guide_context_preface = " The following is the answers to the questions, do not reveal it's contents to the student. "
      parsed_scenario_guide = retrieve_and_parse_scenario_guide(scenario) + ". You have now reached the end of the scenario guide. "
      logs_context_preface = ". Now I will provide you the recent bash, chat and answer history of the student, taking into account the scenario's answers, provide them a hint on what to do next, or how to fix the current errors:  "

      #Current
      bash_history = "1. $gcc -o empty empty.c 2. gcc: error: empty.c: No such file or directory 3. gcc: fatal error: no input files 4. compilation terminated. 5. $ls 6. $ls"
      chat_history = "NO MESSAGES RECORDED YET" 
      answer_history = "NO QUESTIONS ANSWERED YET"

      bash_history_prompt = "These are the student's recent bash commands: {bash_history}. "
      chat_history_prompt = "These are the student's recent chat messages: {bash_history}. "
      answer_history_prompt = "These are the student's recent answers to the question forms: {bash_history}. "

      #ending_prompt_reiteration = ". Using the context provided by the scenario guide and the student's recent logs, provide a very short hint considering what part of the scenario they may be at and what they may be struggling with."

      finalized_prompt = system_prompt + scenario_guide_context_preface + parsed_scenario_guide + bash_history_prompt + chat_history_prompt + answer_history_prompt

      return finalized_prompt

#Generating the hint.
@profile
def generate_hint(slm, scenario):

      finalized_prompt = input_context_system(scenario)
      answer = prompt_model(slm, finalized_prompt)

      #Answer
      print(answer)


#This will be the main call function to generate the hint. Eventually it'll take studentID for param for pulling from DB.
def main():
    scenario = "strace"
    slm = initialize_model()
    generate_hint(slm, scenario)

if __name__ == "__main__":
   main()
