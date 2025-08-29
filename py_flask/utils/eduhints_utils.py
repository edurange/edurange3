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

from ctransformers import AutoModelForCausalLM
from py_flask.utils.common_utils import get_system_resources


"""
For local generation we use the Phi-3 small language model, provided is it's license:

Microsoft.
Copyright (c) Microsoft Corporation.

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

"""

def create_language_model_object(cpu_resources: int, gpu_resources: int) -> None:  

      try:
            language_model_object = AutoModelForCausalLM.from_pretrained(
                  "TheBloke/Llama-2-7B-Chat-GGML",
                  model_file="llama-2-7b-chat.q4_0.bin",
                  model_type="llama",
                  gpu_layers=gpu_resources,
                  threads=cpu_resources,
                  context_length=4096
            )
            return language_model_object

      except Exception as e:
            raise Exception(f"ERROR: Failed to initialize model object: {e}")


def load_context_file_contents(context_file_type: str, scenario_name: str) -> str:

      file_path = f"machine_learning/eduhints/context_files/{context_file_type}/{scenario_name}.txt"

      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  context_file_content = file.read()
            return context_file_content

      except Exception as e:
            raise Exception (f"ERROR: Failed to load context file contents: {e}")


def export_hint_to_csv(scenario_name: str, scenario_context_file_bool: bool, finalized_system_prompt: str, finalized_user_prompt: str, generated_hint: str, duration: int):

      file_path = f"machine_learning/eduhints/generated_hints/{scenario_name}.csv"

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






        


