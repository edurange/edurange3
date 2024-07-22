Changelog
The original version of analyzer.py was 880 lines long and one long serially linked script

## Version 2 
### What was the problem?

There are serveral problems with analyze.py. 
1. It was very difficult to read. 
2. it was difficult to maintain.
3. had multiple bugs
4. had dangerous logic
5. had python loading all the functions even if unused causing namsespace bloat

### What was done to address the problem?
 1. previous main() is now new_analyzer.py (may change eventually). It is the "main" section of the original script. 
2. analyzer_methods.py are all the helper functions from above the old main section of the script. Some of these functions are not used currently but to preserve development they are left in. They are currenlty not loaded when the program runs where previously they were loaded.


### What has changed?
Current verison (1.2) is using new_analzer_main.py as the entry point.py 
   
Removed are the global variables, adding them to a config.py file
Added some initial logging, enabled some of the commented out logging 
Moved the logic out of the if name == main section
Added a class object to give more control over chaing flow in the future.
Added a main driver script
Refactored loop function and enumerate_ttylog in new_analyzer.py to reduce time complexity.

### What is left to do?
    1. refactor decode function into it's own script
    2. check for more areas for retry logic
    3. Add some testing

### What does each method do?
    New Analyzer:
      
