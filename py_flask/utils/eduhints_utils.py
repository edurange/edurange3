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

def create_language_model_object_llama(cpu_resources: int, gpu_resources: int) -> None:  

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
            raise Exception(f"ERROR: Failed to initialize model object: {e}")


def load_context_file_contents(context_file_type: str, scenario_name: str) -> str:

      file_path = f"machine_learning/eduhints/context_files/{context_file_type}/{scenario_name}.txt"

      try: 
            with open(file_path, 'r', encoding='utf-8') as file:
                  context_file_content = file.read()
            return context_file_content

      except Exception as e:
            raise Exception (f"ERROR: Failed to load context file contents: {e}")


def export_hint_to_csv(scenario_name: str, generated_hint: str, duration: int):

      file_path = f"machine_learning/eduhints/generated_hints/{scenario_name}.csv"

      with open(file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([scenario_name, generated_hint, duration])






        


