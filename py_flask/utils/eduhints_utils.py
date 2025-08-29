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

try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

def create_language_model_object() -> tuple:  

      if not ML_AVAILABLE:
          raise Exception("ERROR: ML libraries (torch, transformers) are not installed. Install ml_requirements.txt to use hint generation.")

      try:
            # Load model optimized for CPU inference - using GPT-2 base for better text completion
            model = AutoModelForCausalLM.from_pretrained(
                "gpt2",                      # GPT-2 base model (124M parameters) - better for completion tasks
                torch_dtype=torch.float32,   # float32 for CPU, float16 not supported on CPU
                device_map="cpu",            # Force CPU to avoid GPU detection overhead
                low_cpu_mem_usage=True,      # Optimize CPU memory usage
                use_cache=True               # Enable KV-cache for faster inference
            )
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained("gpt2")
            tokenizer.pad_token = tokenizer.eos_token
            
            return model, tokenizer

      except Exception as e:
            raise Exception(f"ERROR: Failed to initialize model object: {e}")


def load_context_file_contents(context_file_type: str, scenario_name: str) -> str:

      file_path = f"machine_learning/context_files/{context_file_type}/{scenario_name}.txt"

      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  context_file_content = file.read()
            return context_file_content

      except Exception as e:
            raise Exception (f"ERROR: Failed to load context file contents: {e}")


def export_hint_to_csv(scenario_name: str, scenario_context_file_bool: bool, finalized_system_prompt: str, finalized_user_prompt: str, generated_hint: str, duration: int):

      file_path = f"machine_learning/generated_hints/{scenario_name}.csv"

      with open(file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            f"*SCENARIO NAME*: {scenario_name}", 
            f"*BOOL DISABLE SCENARIO CONTEXT FILE*: {scenario_context_file_bool}",
            f"*SYSTEM PROMPT*: {finalized_system_prompt}",
            f"*USER PROMPT*: {finalized_user_prompt}",
            f"*GENERATED HINT*: {generated_hint}",
            f"*HINT GENERATION DURATION*: {duration}"
            ])






        


