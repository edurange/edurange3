#!/bin/bash

GRN='\033[0;32m'
YLW='\033[1;33m'
NC='\033[0m'

pass_pattern=^[!-/0-9:-@A-Z\[-\`a-z\{-~]{8,16}$
db_name_pattern=^[a-z][a-z0-9]{7,15}$
flask_name_pattern=^[a-z][a-z0-9]{2,24}$
flask_pass_pattern=^[!-/0-9:-@A-Z\[-\`a-z\{-~]{6,40}$

# Placeholder default for when we want an invalid string that doesn't 
# match printables or empty patterns. See prompt_and_match as used in 
# the network code; failing_string is used in place of empty or 
# whitespace strings to allow prompt_and_match to detect the enter key. 
# If we use this code elsewhere, consider a design that is more 
# straightforward. I don't expect this implementation to age well.
failing_string="\a"