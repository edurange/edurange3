from sys import stdin
from warnings import warn
from csv import reader as csvreader
from yaml import load as yamlloader
try: # Use the C-native implementation if it's available
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader
from math import floor
from itertools import chain, count, repeat
from collections import defaultdict, OrderedDict

from regex import match
#from numpy import arctan, pi

USER = 'user'
TIMESTAMP = 'timestamp'
DIR = 'dir'
NODE = 'node'
INPUT = 'input'
OUTPUT = 'output'
MATCHED = 'matched'
AND = 'and'
OR = 'or'
NOT = 'not'
ARGS = 'args'
LABEL = 'label'
OBJECTIVE = 'objective'
COMMENT = 'comment'
WEIGHTS = 'weights'
FUZZY_MATCH = 'fuzzy_match'

enable_fuzzy_patterns = True

# Exception/error/warning hierarchy
class TaggerWarning(Warning):
  pass
  
class TokenHandlerNotFoundWarning(TaggerWarning):
  pass

class IncompleteLogRowWarning(TaggerWarning):
  pass

# Milestone interpreter methods
def milestone_tagger(milestones_deserialized, log_iterator):
  for log_line, original_line in log_iterator:
    results = []
    this_user = log_line[USER]
    this_timestamp = log_line[TIMESTAMP]
    for milestone in milestones_deserialized:
      result, trace_structure = eval_milestone(milestone, log_line)
      if result == 1.0:
        matched[this_user][milestone[LABEL]].append(this_timestamp)
      results.append((result, trace_structure))
    yield matched, results, original_line
  
def eval_milestone(milestone, log_line):
  """Evaluates one milestone against one line"""
  result, trace_structure = token_and(milestone, log_line)
  trace_structure[LABEL] = milestone[LABEL]
  return result, trace_structure

# Token dispatcher and instruction evaluators
"""
The idea is to create an interpreter that returns trees (expressed as 
dicts) with each node annotated with the intermediate return value of 
each subexpression - essentially a trace of the evaluation, rather than 
just the final computed value. When the trace doesn't need to be saved, 
the final value is easily extracted and the rest discarded. Preserving 
the traces will hopefully assist in the development of better search 
macros and error metrics.

No policy yet on what should happen if an instruction token is not 
found. For now we can simply complain to the error log and return a 
true (1.0 aka 100% truth confidence) value to the expression evaluator.
""" 
class DispatchDict(dict):
  """
  DispatchDict overrides the __missing__ method to report parameterized 
  error messages and return a default value when a key is not found. 
  This will be used in fan_subnodes below to map expression node tokens 
  to token handler methods.
  """
  def __missing__(self, key):
    warn(f'key: {key}', TokenHandlerNotFoundWarning)
    return lambda value_parameters, log_line: (1.0, value_parameters)

# This is a global-level object that should be wrapped in production
dispatch = DispatchDict()

def fan_subnodes(expression_node, log_line):
  """
  Fan and dispatch subexpression nodes. When called on a dict, returns 
  a dict where each value has been replaced by a tuple of the 
  evaluated result and the original subexpression. When called on a 
  list, recursively calls itself over the items in the list. When 
  called on any other type (presumably a literal if the input is a YAML 
  structure) returns a tuple containing a confidence score of 0.0 (0% 
  truth/certain falsehood) and the expression.
  """
  if isinstance(expression_node, dict):
    result = OrderedDict()
    if ARGS in expression_node:
      # If the expression has explicit terms, just fan those. Should we 
      # distinguish 'args' in the general case from this use? Perhaps 
      # this should instead be 'terms', 'leaves', 'children', 
      # 'subnodes' etc.?
      result = OrderedDict(expression_node)
      result[ARGS] = fan_subnodes(expression_node[ARGS], log_line)
    else:
      for key in expression_node:
        # Omit or save/process special properties such as label
        if key in [LABEL, COMMENT, OBJECTIVE]:
          continue
        else:
          value_parameters = to_arg_dict(expression_node[key])
          result[key] = dispatch[key](value_parameters, log_line)
  elif isinstance(expression_node, dict):
    result = [fan_subnodes(node, log_line) for node in expression_node]
  else:
    # Could implement literals and other types of expressions here
    result = 0.0, expression_node
  return result

def subnode_results(interpreted_parameters):
  """
  Unpacks results from interpreted parameter dicts. If there is no 
  'args' key, we assume every key-value pair has been interpreted and 
  contains (rank, subexpression) tuples for all associated values. If 
  'args' is present, then the results are read exclusively from 'args'.
  """
  results = []
  if ARGS in interpreted_parameters:
    arguments = interpreted_parameters[ARGS]
    if isinstance(arguments, list):
      for item in arguments:
        if isinstance(arguments, dict):
          results.append(list(item.values()))
        elif isinstance(arguments, list):
          results.append(item)
        else:
          results.append([item])
      results = sum(results, []) # Addition on lists is catenation
    elif isinstance(results, dict):
      results = arguments.values()
    else:
      results = [arguments]
  else:
    results = interpreted_parameters
  if isinstance(results, dict):
    results = list(results.values())
  return results
  
# Token interpreter methods
"""
Token interpreters should return a confidence value [0,1] and the trace 
trees of the parameters and/or subnodes; fan_subnodes then wraps the 
result in a dict of result, subnode tuples. See below for further 
discussion of confidence values.
"""
def token_dir(value_parameters, log_line):
  """Search the working directory portion of log_line."""
  pattern_list = to_arg_list(value_parameters)
  return relative_search(pattern_list, log_line[DIR])

def token_input(value_parameters, log_line):
  """
  Search the input portion of log_line; unless value_parameters has a 
  false fuzzy_match property, the patterns supplied as arguments will 
  be interpreted as fuzzy patterns.
  """
  pattern_list = to_arg_list(value_parameters)
  if value_parameters.get(FUZZY_MATCH, True):
    pattern_list = [fuzzy_regex(pattern) for pattern in pattern_list]
  return relative_search(pattern_list, log_line[INPUT])
  
def token_output(value_parameters, log_line):
  """Search the output portion of log_line."""
  pattern_list = to_arg_list(value_parameters)
  return relative_search(pattern_list, log_line[OUTPUT])
  
def token_node(value_parameters, log_line):
  """Search the node portion of log_line."""
  pattern_list = to_arg_list(value_parameters)
  return relative_search(pattern_list, log_line[NODE])
  
# This is a global-level object that should be wrapped in production
matched = defaultdict(lambda: defaultdict(list))
def token_matched(value_parameters, log_line):
  """
  Checks the matched record; returns n / m where n is the number of 
  milestone labels found in the matched record and m is the number of 
  labels searched for.
  """
  """
  Note that results may be inconsistent for milestones matched on the 
  same line pass due to unpredictable dictionary ordering in earlier 
  Python implementations.
  """
  search_labels = to_arg_list(value_parameters)
  if len(search_labels) == 0:
    return 0.0, ''
  this_user = log_line[USER]
  results = [1.0 if label in matched[this_user] else 0.0 for label 
              in search_labels]
  result = sum(results) / len(search_labels)
  trace_structure = list(zip(results, search_labels))
  return result, to_arg_dict(trace_structure)

def token_and(value_parameters, log_line):
  """
  Performs n-ary and on the subnodes of value_parameters. Returns 1.0 
  (true/full confidence) when all subnodes are true/full confidence; 
  returns the normalized sum (mean average) of the confidence values 
  otherwise.
  """
  """
  Problem! Subnodes/subexpressions appear to sometimes change order 
  within dictionaries, so the ordered mapping of weights to subranks is 
  not always preserved. Might need enforce that weights be a dict when 
  the subnodes are packed as a dict, and a list when the subnodes are 
  packed as a list, or something like that. Packing subnodes as a list 
  under the args key (within the YAML file) also seems to help.
  """
  arguments = value_parameters
  weights = []
  
  if WEIGHTS in value_parameters:
    arguments = value_parameters.copy()
    arguments.pop(WEIGHTS)
    weights = value_parameters[WEIGHTS]
  
  # Pads the end of weights in case the user didn't specify enough.
  weights = chain(weights, repeat(1.0))
  
  trace_structure = fan_subnodes(arguments, log_line)
  # Does this unpack incorrectly for some bad input?
  subranks = [subnode_rank for subnode_rank, _ 
              in subnode_results(trace_structure)]
  terms = list(zip(weights, subranks))
  subrank_sum = sum([weight * subrank for weight, subrank in terms])
  rank = subrank_sum / sum([weight for weight, _ in terms])
  return rank, to_arg_dict(trace_structure)
  
def token_or(value_parameters, log_line):
  """
  Performs n-ary or on the subnodes of value_parameters. Returns 1.0 
  (true/full confidence) if any subnode is true/full confidence; 
  returns the maximum found confidence value otherwise.
  """
  trace_structure = fan_subnodes(value_parameters, log_line)
  results = subnode_results(trace_structure)
  ranks = [subrank for subrank, _ in results]
  rank = max(ranks)
  return rank, to_arg_dict(trace_structure)
  
def token_not(value_parameters, log_line):
  """Negation of the n-ary or of value_parameters"""
  # This was misbehaving before; should check the traces and/or 
  # construct a truth table to examine whether or not this properly 
  # implements logical not. token_and and token_or are also suspect.
  result, trace_structure = token_or(value_parameters, log_line)
  if result == 1.0:
    rank = 1.0
  else:
    rank = 0.0
  return rank, trace_structure
# end parse methods

# Make sure to register all token handlers here.
dispatch |= {
    DIR: token_dir,
    INPUT: token_input,
    OUTPUT: token_output,
    NODE: token_node,
    MATCHED: token_matched,
    AND: token_and,
    OR: token_or,
    NOT: token_not
    }

# Error ranking/match metric helpers
"""
First we need a way of converting a Levenshtein-type distance metric 
[0,inf) to a finite interval. Using such a mapping, we can create a 
"correctness" metric that can be sensibly compared to finite sets of 
logical criteria. This will allow us to mix Levenshtein distances with 
"completeness" scoring strategies for logical operations. Generally, 
these mappings should have f(0) = 1 (no errors = 100% correct), 
lim(f(x)) -> 0 as x approaches infinty, and be 
order-preserving/monotonic (strictly decreasing over the interval ie a 
negative derivative).

This is a naive approach! In practice with partial matches allowed (the 
default regex search behavior) the maximum possible Levenshtein 
distance will be n for a pattern of n literal characters - one 
insertion or replacement for each character. (Potentially less for 
patterns of length n that include escaped or interpreted characters, 
but also as many as infinite for wildcards of unconstrained 
length/repetition.)

It may be preferable to normalize the Levenshtein distance relative to 
the length of the pattern in some applications. At other times it 
should be sufficient, and perhaps more versatile, to use an 
order-preserving interval mapping as described above. One strategy 
would be to disallow infinite length regexes in basic search strings, 
and create a wildcard mechanism at the parser level. This would make it 
trivial to identify expressions with potentially infinite distance 
values and handle their normalization separately.
"""  
def relative_search(pattern_list, string):
  """
  Searches the given string for the patterns supplied in pattern_list. 
  Returns the logical or of the patterns supplied; 1.0 (continuous 
  value True) if and only if at least one pattern was found in the 
  string, or the maximum value found if pattern_list included fuzzy 
  patterns.
  """
  match_pairs = match_patterns(pattern_list, string)
  match_ranks = [(relative_distance(match_obj), term) for match_obj, 
                  term in match_pairs]
  best_rank = max((rank for rank, _ in match_ranks))
  trace_structure = to_arg_dict(match_ranks)
  return best_rank, trace_structure
  
def relative_distance(match_obj):
  """
  Returns a float from [1,0] based on Levenshtein edit distance of a 
  regex.Match object; normalizes the distance by inferring the length 
  of the target search string based on the length of the partial match 
  and the number of edits. An edit distance of 0 characters maps to 1.0 
  - continuous value True, and (for a string of N characters) an edit 
  distance of N characters maps to 0.0.
  """
  """
  If regex.match returned None, it was probably a non-fuzzy pattern 
  that failed to match.
  """
  if match_obj == None:
    return 0.0
  match_length = len(match_obj.captures()[0])
  """
  An empty pattern should always match but this is a confusing way to 
  do it. Also is it possible that a variable-length pattern could 
  partially match an empty string with non-zero fuzzy_counts?
  """
  rank = 1.0
  if match_length > 0:
    counts = match_obj.fuzzy_counts
    net_chars_added = counts[1] - counts[2]
    target_length = match_length - net_chars_added
    rank = (target_length - sum(counts)) / target_length
  return rank

#def normalized_arctan(num):
#  """Maps [0,inf) to [1,0) using the inverse tangent"""
#  return 1 - 2 * arctan(num) / pi

def multiplicative_inverse(num):
  """
  Maps [0,inf) to [1,0) using the multiplicative inverse: 1 / (1 + num)
  """
  return 1 / (1 + num)

# Regex search helpers
def match_patterns(pattern_list, string):
  """Dispatches regex.match over a string of text"""
  matches = (match(pattern, string, concurrent=True) for pattern in 
              pattern_list)
  return zip(matches, pattern_list)

def fuzzy_regex(string_pattern):
  """
  Wraps a simple regex search string with the proper parameterization 
  to use with the fuzzy matching provided by regex.search. Permits some 
  simple wildcard pattern features but likely does not support all 
  regexes due to the nesting of pattern in the return value.
  """
  regex_pattern = f'(?:{string_pattern})'
  if enable_fuzzy_patterns:
    regex_pattern += r'{e}(?b)'
  return regex_pattern
  
# Expression tree helpers  
def to_arg_dict(value_parameters):
  """
  Packs lists and literals into a dict so that parse methods can always 
  look for their arguments under the key 'args' and implement 
  standardized patterns for parameter handling.
  """
  if isinstance(value_parameters, dict):
    return value_parameters
  else:
    return OrderedDict({ARGS: to_arg_list(value_parameters)})

def to_arg_list(value_parameters):
  """
  Makes things into lists so we can traverse YAML attribute structures 
  like n-tree nodes. By wrapping all primitive values as singleton 
  lists, parse methods can avoid type checking and handle all such 
  values as iterable collections.
  """
  args = []
  if isinstance(value_parameters, list):
    args = value_parameters
  elif isinstance(value_parameters, dict):
    # derivatives can parse options/keywords here
    # 'args' isn't guaranteed to be a list - is this a problem?
    args = value_parameters[ARGS]
  else:
    args = [value_parameters]
  return args
    
# Milestone file handling helpers
def load_milestones(filename):
  return label_anonymous_milestones(load_yaml(filename))
  
def label_anonymous_milestones(milestones):
  """
  Adds a 'label' key-value pair to each dict in a list of milestone 
  dicts, if 'label' was not already present.
  """
  """
  The labeling algorithm should be extended to check for naming 
  collisions.
  """
  num = count()
  for milestone in milestones:
    if LABEL not in milestone:
      milestone[LABEL] = f'Anonymous Milestone {next(num)}'
  return milestones

def load_yaml(filename):
  """
  Interprets a YAML file as a list of nested dicts, lists and literals
  """
  with open(filename) as file:
    contents = yamlloader(file, Loader=Loader)
  return to_ordered_dicts(contents)
  
def to_ordered_dicts(obj):
  """
  Recurses over a YAML structure of dicts, lists and literals, creating 
  OrderedDicts in place of ordinary dictionaries.
  """
  if type(obj) is dict:
    result = OrderedDict(obj)
    for key in result:
      result[key] = to_ordered_dicts(result[key])
  if type(obj) is list:
    result = [to_ordered_dicts(item) for item in obj]
  else:
    result = obj
  return result

# Log file/stream handling helpers
def toy_yield_log(filename):
  """
  As below, but with a simplified log format for early testing. The 
  bare minimum of what a log handling generator should do.
  """
  for original_line in yield_csv(filename):
    log_line = {
            USER: original_line[0],
            TIMESTAMP: original_line[1],
            DIR: original_line[2],
            NODE: original_line[3],
            INPUT: original_line[4], 
            OUTPUT: original_line[5]
    }
    yield log_line, original_line

def yield_log(source):
  """
  A generator function that yields the log line-by-line, with relevant 
  columns (input, output, etc) pre-processed into a dict of 
  properties. The original line from csv.reader is returned for 
  constructing log output later. This can be re-implemented and its 
  references swapped in the main portion of the script to support 
  different log format versions.
  """
  if type(source) is str:
    file_iterator = yield_file(source)
  else:
    file_iterator = source
    
  # Sample logs have null bytes which csv.reader cannot handle, so I'm 
  # providing a filter function to use before csv.reader gets the input
  enumerated_csv = enumerate(yield_csv(remove_null_bytes(file_iterator)))
  for i, original_line in enumerated_csv:
    err = False
    
    try: # This version is very permissive of bad log lines
      timestamp_text = original_line[2]
    except IndexError:
      timestamp_text = ''
      err = True
      
    try:
      dir_text = original_line[3]
    except IndexError:
      dir_text = ''
      err = True
      
    try:
      input_text = original_line[4]
    except IndexError:
      input_text = ''
      err = True
      
    try:
      output_text = original_line[5]
    except IndexError:
      output_text = ''
      err = True
    
    try:
      prompt = original_line[6].split('@')
    except IndexError:
      prompt = ['', '']
      err = True
    
    user_text = prompt[0]
    
    try: # split() could return a list of length 1
      node_text = prompt[1]
    except IndexError:
      node_text = ''
      err = True
      
    if err:
      warn(f'line {i}', IncompleteLogRowWarning)
      # Suppress this print unless we know we're not writing to stdout 
      # or otherwise know we are allowed to be verbose
      # print(f'yield_log: Incomplete row at line {i}')
      
    log_line = {
            USER: user_text,
            TIMESTAMP: timestamp_text,
            DIR: dir_text,
            NODE: node_text,
            INPUT: input_text, 
            OUTPUT: output_text
    }
    yield log_line, original_line
  """
  Consider changing dict representation to a @dataclass for 
  compactness. String dict keys come with redundant reference clutter; 
  trying to save space here by using marker objects as keys instead of 
  plain strings. See also typing.Literal for a possible improvement.
  
  May need to implement a separate log loader module that does the 
  error handling and cleaning elsewhere for clarity.
  """

def yield_csv(source, delimiter=',', quotechar='"'):
  """
  Generates a list of strings according to a csv file.
  """
  if type(source) is str:
    iterator = yield_file(source)
  else:
    iterator = source
  for line in csvreader(iterator, delimiter=delimiter, 
      quotechar=quotechar):
    yield line

def yield_file(filename):
  with open(filename, newline='') as iterator:
    for line in iterator:
      yield line

def remove_null_bytes(source):
  for string in source:
    yield string.replace('\0', '')

"""
Questions:
  - Do we want to coerce values on loading - ie should timestamps be 
    converted from strings to ints? How do we want to handle 
    irregularities?
  - Double dicts and other such nested iterators are discouraged - 
    should we consider a class interface for the return structure? Or 
    switch to a numpy matrix/pandas dataframe?
  - Is deleting null bytes the right approach for preparing the log 
    CSVs? Do the null bytes mean something in the original encoding?
  - Can log_line be factored out safely as a global? Is this possible 
    with a simple global or is a protection/scoping scheme needed? It's 
    only assigned in one place, so it seems plausible.
  - Would it be worthwhile to move to a [-1,1] logic system? When 
    confidence values are [0,1], the behavior of logical not becomes 
    asymmetric (under this implementation, at least.) In particular, 
    for a truth value n, not(not(n)) is 0.0 or 1.0, rather than n. This 
    is because [0,1) all represent intermediate falsity, and only 1.0 
    proper is interpreted as a true value.
  - How should milestones be formatted in the output? Now that all 
    milestones have distance metrics, it's probably more likely that 
    partial matches aka 'attempts' under the prior nomenclature will be 
    found on any given line.
  - How should unlabeled milestones be enumerated? Should measures be 
    taken to pad milestones to uniform length?
  - Could we/how would we create a specification for maximum error 
    distance? regex.Match provides this as a parameter, and 
    implementing the parameter seems straightforward, but its design 
    implications are unclear to me. Does a maximum error distance imply 
    that we should adjust the mapping of our relative distance metric?
  - Is it possible to load an 'empty' milestone through yaml.load and 
    is the interpreter robust when encountering such a milestone?
Note:
  - regex fuzzy matching only supports the classic Levenshtein metric. 
    It may be desirable to implement the Damerau-Levenshtein algorithm 
    instead, which accounts for one-character transpostions.
  - regex.Match objects maintain a copy of/reference to the original 
    search string. This could become a memory issue. Match objects 
    have a method to instruct them to release the reference if needed.
  - Could be helpful to wrap the log iterator with a class interface to 
    allow the user column to be checked at multiple levels, eg to 
    select just the user's dict from matched when displaying updated 
    rows.
  - dict.keys sometimes returns alphabetized order? Had to change the 
    subtraction of the 'weights' key from a set/list operation on 
    dict.keys to dict.pop('weights'). Also aggressively changed 
    dicts used in milestone expressions to OrderedDicts; 
    order-preserving behavior in Python dicts is considered a 'desired' 
    characteristic but not a part of the definitive feature set, and is 
    therefor not guaranteed to remain in future versions.
To Do:
  - Add a canonical invocation method (possibly a different file?) that 
    properly reports script termination through sys.exit.
  - Wrap all incoming value_parameters and outgoing trace_structure in 
    to_arg_dict to enforce a more uniform output structure.
  - See csv library's dialects feature for managing different CSV 
    parsing parameters.
  - Consolidate IndexError try blocks in yield_log.
  - Consider pandas for normalizing log and output representations.
  - Experiment with regex.Match to better distinguish between the 
    BESTMATCH and ENHANCEMATCH options; documentation mostly shows use 
    examples and does not clearly define the difference between the 
    two; likely need to examine the module source. BESTMATCH appears to 
    be quite time intensive for large inputs.
  - Verify this version is well-behaved in the case of multiple 
    milestones matching on the same line.
  - Add exception raising/error output for file handlers, especially 
    yield_log.
  - Verify the reasoning behind relative_distance, particularly that 
    sum(counts) will never exceed target_length.
  - Work out unifying terminology for module.
  - Consider changing toy_yield_log to automatically generate indicies/ 
    timestamps for interactive testing.
  - Wrap load_milestones, yield_log and milestone_tagger into a single 
    convenience function so users only have to import one symbol.
  - Find a way to expose csv.reader.line_num to yield_log and 
    toy_yield_log so that log lines don't have to be inferred by a 
    separate enumerator.
  - Replace max() with a short-circuiting version for places where we 
    know the maximum possible value (eg confidence values; return 1.0 
    as soon as 1.0 is found, rather than searching the whole list).
  - Provide a positional matching system similar to slicing or relative 
    ordering of string patterns.
  - Implement explicit conversion of strings to search patterns using 
    fnmatch.
  - Catch yaml.load errors/exceptions.
  - Check return value of subnode_results; appears to be using a 
    generator or builtin type related to dict. Type should be 
    standardized.
  - Add search options, including flags for fuzzy matching. See 
    positional matching above; should be compatible with anchor (^ and 
    $) patterns.
  - Methods in dispatch dict should be renamed; token is an ambiguous 
    term now that the scope includes shell language grammar.
"""
