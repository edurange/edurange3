Changelog
The original version of analyzer.py was 880 lines long and one long script

## Version 2 
### What was the problem?

There are serveral problems with analyzer.py. 
1. It was very difficult to read. 
2. it was difficult to maintain.
3. had multiple bugs
4. had dangerous logic
5. had python loading all the functions even if unused causing namsespace bloat

### What has changed?
analyzer2.py is the "main" section of the original
analyzer_methods.py is all the functions from above the "main" section

Removed are the global variables, adding them to a config.py file
Added some initial logging, enabled some of the commented out logging 
Moved the logic out of the if name == main section
Added a class object to give more control over chaing flow in the future.

### What does each method do?
...pending
