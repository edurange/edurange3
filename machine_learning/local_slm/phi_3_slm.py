####################################################################################################
# PHI-3 SMALL LANGUAGE MODEL MODULE
# Program for running Microsoft's Phi-3-mini-4k-instruct-q4 small language model,
# a quantized SLM with only 4b params. Aiming to generate hints based on student bash, chat
# and answer logs.
# 
#
# Author: Taylor Wolff 
####################################################################################################

import sys
import os
import math
import pyopencl as cl

import llama_cpp
from llama_cpp import Llama
import asyncio

#Checking user hardware specs, this also checks if the user has a local GPU as this allows offloading 
# and accelerates generation drastically
def check_hardware_specs():

      def check_cpu_specs():
            num_cpus = os.cpu_count()
            if num_cpus == 0 or num_cpus is None:
                  raise ValueError("No CPU cores detected... how's this possible?")
            else:
                  return int(num_cpus)
            
      #Checks for available graphics cards.
      def check_gpu_specs():
            try:
                  platforms = cl.get_platforms()
                  num_gpus = 0
                  
                  for platform in platforms:
                        devices = platform.get_devices(device_type=cl.device_type.GPU)
                        num_gpus += len(devices)
                  return num_gpus
                           
            except Exception as e:
                  return 0
      
            
      num_cpus = check_cpu_specs()
      num_gpus = check_gpu_specs()
      #print(f"num of gpus {num_gpus}")
   
      
      return num_cpus, num_gpus

#Calculates scaled core usage, also enables GPU offloading.
def calculate_hardware_settings(resource_scaler, gpu_enable):

      hardware_specs = check_hardware_specs()
      num_cpus = hardware_specs[0]
      num_gpus = hardware_specs[1]

      performance_setting_dict = {
            "1": 0.25,
            "2": 0.5,
            "3": 0.75,
      }

      #Logic for setting GPU and CPU resources, additionally ensuring that if GPU rescources are enabled then no CPU resources should be used.

      if num_gpus != 0 and gpu_enable:
            set_gpu_resources = -1
      else: 
            set_gpu_resources = 0
      
      if set_gpu_resources == 0:
            set_cpu_resources = math.floor(num_cpus * performance_setting_dict[resource_scaler])
      else: 
            set_cpu_resources = 0


      return set_cpu_resources, set_gpu_resources


#Generating the hint.
async def generate_hint(gpu_enable, hardware_settings, question):

      #Echo to user the recources being used.
      print(f"\nCPU cores being used: {hardware_settings[0]}")
      if gpu_enable:
            if hardware_settings[1] == -1: 
                  print("GPU Enabled\n")
            else:
                  print("GPU Enabled but no graphics device found\n")
      else:
            print("GPU Disabled\n")
     
      #Direct file version
      """
      #The Phi-3 model is quantized and can be found as a .gguf file in the dir.
      slm = Llama(
      model_path="machine_learning/local_slm/Phi-3-mini-4k-instruct-q4.gguf", verbose=False,
      n_ctx=4080, 
      n_threads=hardware_settings[0], 
      n_gpu_layers=hardware_settings[1]
      )
      """

      #Import version
      slm = Llama.from_pretrained(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
            filename="Phi-3-mini-4k-instruct-q4.gguf",
            verbose=False,
            n_ctx=4080, 
            n_threads=hardware_settings[0], 
            n_gpu_layers=hardware_settings[1]
      )

      #This can be changed in the future easily, experimenting with prompting.
      system_prompt = "I'm stuck, provide me a short  hint based on my bash history: "
      question_with_system_prompt = f"{system_prompt} {question} "
      
      output = slm(
            #Prompt
            f"<|user|>\n{question_with_system_prompt}<|end|>\n<|assistant|>",
            max_tokens=4080,
            stop=["<|end|>"], 
            echo=False, 
            temperature=0.8,
      ) 

      #Answer
      return output["choices"][0]["text"]

#This will be the main call function to generate the hint. Eventually it'll take studentID for param for pulling from DB.
async def get_hint():

      print(" ________________________ ")
      print("| EDURANGE PHI-3 SLM     | ")
      print("| ---------------------- | ")
      print("| ENABLE GPU OFFLOAD?    | ")
      print("| (Highly recommended)   | ")
      print("|                        | ")
      print("| 1. ENABLE              | ")
      print("| 2. DISABLE             | ")
      print("|________________________|  ")
      print("\n")

      #Prompt if GPU should be enabled, if not default to disabled.
      gpu_enable_setting = int(input())
      gpu_enable = True if gpu_enable_setting == 1 else False

      

      print(" ________________________ ")
      print("| EDURANGE PHI-3 SLM     | ")
      print("| ---------------------- | ")
      print("| PERFORMANCE SETTING    | ")
      print("| (MEDIUM is reccomended)| ")
      print("|                        | ")
      print("| 1. LOW (.25 of cores)  | ")
      print("| 2. MEDIUM (.5 of cores)| ")
      print("| 3. HIGH (.75 of cores) | ")
      print("|________________________|  ")
      print("\n")

      #Prompt what performance settings should be used.
      performance_setting = input()

      #Make function call to calculate exact values.
      hardware_settings = calculate_hardware_settings(performance_setting, gpu_enable)

      #Prompt for user question
      print("Enter Bash History Line: ")

      #This will be replaced by a getLogs() call to the db for a given student.
      question = input()	
      answer = await generate_hint(gpu_enable, hardware_settings, question)
      print(answer)

def main():
    asyncio.run(get_hint())

if __name__ == "__main__":
   main()
