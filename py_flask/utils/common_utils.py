import random

def generate_alphanum(length):
    alphanums = '1234567890abcdefghijklmnopqrstuvwxyz'
    return ''.join(random.choice(alphanums) for _ in range(length))


