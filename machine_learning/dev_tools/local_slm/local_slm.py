####################################################################################################
# LOCAL SMALL LANGUAGE MODEL TOOL
# Program for running Microsoft's Phi-3-mini-4k-instruct-q4 small language model,
# a quantized SLM with only 4b params. Aiming to generate hints based on student bash, chat
# and answer logs.
# 
#
# Author: Taylor Wolff 
# Run $python3 machine_learning/dev_tools/local_slm/local_slm.py to be prompted to input bash commands.
####################################################################################################
import sys
import os
import time
import csv
import math
import pyopencl as cl
import asyncio
import yaml
import llama_cpp
from llama_cpp import Llama
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from contextlib import contextmanager
from memory_profiler import profile, memory_usage


@contextmanager
def timing_context(description: str):
      start = time.time()
      yield
      elapsed_time = time.time() - start
      print(f"* {description} {elapsed_time}s\n")
      
def initialize_model():
      with timing_context("Initialized model"):
            def determine_cpu_resources():   
                  cpu_resource_scaler = 1 # Multiplicative scaler for CPU cores to be used.
                  num_cpus = os.cpu_count()
                  if num_cpus is None or num_cpus <= 0:
                        raise ValueError(f"Invalid CPU count: {num_cpus}")
                  else:   
                        return math.floor(num_cpus * cpu_resource_scaler) 

            def determine_gpu_resources():
                  try:
                        platforms = cl.get_platforms()
                        for platform in platforms:
                              gpu_device = platform.get_devices(device_type=cl.device_type.GPU)
                              if gpu_device:
                                    return -1
                              else:
                                    return 0    

                  except Exception as GPU_NOT_FOUND:
                        return 0
      
            cpu_resources = determine_cpu_resources()
            gpu_resources = determine_gpu_resources()
            print("\n__________________________________________\n")
            print (f"\n* CPU threads used: {cpu_resources}\n")
            if gpu_resources == -1: 
                  print (f"* GPU Found and Enabled\n") 
            else:
                  print("No GPU found")

            language_model = Llama.from_pretrained(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
            filename="Phi-3-mini-4k-instruct-q4.gguf",
            verbose=False,
            n_ctx=4086, 
            n_threads=cpu_resources, 
            n_gpu_layers=gpu_resources,
            flash_attn=True,
            use_mlock=True,
      )

            return language_model

def load_scenario_learning_objectives_file_contents(scenario_name):

      file_path = f"machine_learning/context_files/scenario_learning_objectives/{scenario_name}.txt"

      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  scenario_learning_objectives = file.read()
            return scenario_learning_objectives

      except Exception as e:
            print(f"Failed to load context file contents: {e}")


# @profile
def generate_hint(language_model, scenario_name):
      
      with timing_context("Hint generated in "):      
            scenario_learning_objectives = load_scenario_learning_objectives_file_contents(scenario_name)
            finalized_system_prompt = "You generate hint's for a cybersecurity scenario, go through the provided document and generate a list of hints."
            finalized_user_prompt = f"DOCUMENT:  {scenario_learning_objectives}"

            result = language_model(
                  f"<|system|>{finalized_system_prompt}<|end|>\n<|user|>\n{finalized_user_prompt}<|end|>\n<|assistant|> ",
                  max_tokens=-1,
                  stop=["<|end|>"], 
                  echo=False, 
                  temperature=0.8,
            ) 
                  
            generated_hint = result["choices"][0]["text"]
            print("\n__________________________________________\n")
            print(f"[{generated_hint}] \n")

            return generated_hint

def export_hint_to_csv(scenario_name, generated_hint):
    with timing_context(f"Exported hint to pre-generated_hints/{scenario_name}.csv"):
      file_path = f"machine_learning/dev_tools/local_slm/pre-generated_hints/{scenario_name}.csv"
      with open(file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([scenario_name, generated_hint])

def cli_prompt():
      print(f"\nEDURANGE LOCAL SLM TESTING DEVELOPMENT TOOL")
      print(f"Author: Taylor Wolff\n")

      scenario_name = input("Scenario name?: ")
      num_of_hints = int(input("How many hints to generate?: \n"))
      export_to_csv_option = input("Export to csv? Type Y for yes: \n").strip().upper()

      return scenario_name, num_of_hints, export_to_csv_option

def generate_num_of_hints(num_of_hints, export_to_csv_option, language_model, scenario_name):
      for i in range(num_of_hints): 
            generated_hint = generate_hint(language_model, scenario_name)
            if export_to_csv_option == 'Y':
                  export_hint_to_csv(scenario_name, generated_hint)
      
def main():
      scenario_name, num_of_hints, export_to_csv_option = cli_prompt()
      language_model = initialize_model()
      generate_num_of_hints(num_of_hints, export_to_csv_option, language_model, scenario_name)

if __name__ == "__main__":
    main()


