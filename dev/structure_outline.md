
The notes in this doc are my sketchy/preliminary suggestions
in regards to changes that could be made from the current structure to
a new one.  

These are only my suggestions, and not set in stone, nor is it complete.  However,
as long as this document is here, we should try to keep it mostly accurate
to whatever we decide (or delete it).
- Jonah / exoriparian

edurange3
  /flask
    /routes
      public etc
      user etc
    /utils
    /requirements
  /py_scripts?  # python scripts that aren't flask? (not sure on this one)
  /react
    /node_modules # react specific node modules
    /pages (react component 'zones', note more shallow structure)
      /home
      /dashboard 
        # In retrospect, we may not need this.  
        #   students can go straight to /scenarios,
        #   and instructors can go straight to their own scenario interface.
        # From there, they still have access to account, options, etc.
        # Unless there's some other major function that would be logically
        #   seperate from the scenarios in the UI, 
        #   then /dashboard is redundant and just causes directory bloat
      /scenarios
      /instructor
        # arguably redundant, but because /scenarios (the student's UI)
        #   is already quite busy with files and subdirs, as is this area,
        #   I think it makes more sense to keep them separated for now.
    /entry (only contains index.html and entry.jsx, to load react initial script)
  /node 
    /node_modules # non-react node modules to support the socket server
    /ssh # (won't necessarily need subdirs for ssh & chat bc they both can run on same node server) 
    /chat
  /docker
  /logging
  /algo (hint system, possibly mixed language)
  /celery (does this make sense?)
  /terraform
    /data?/tmp? # dynamic (terraform related) scen data moved from /scenarios into /terraform (?)
  /scenarios
    for more static scen data like scenario text, questions and answers, etc
  /shell_scripts # For bash scripts
    clear_scenarios.sh
    otherBashScripts.sh
  /supervisord_programs? # maybe unncessesary / optional

  install.sh # keep in root?  

  # loose python files should be moved into /flask or maybe /py_scripts

  # all of /edurange_refactored (which essentially was the flask/jinja 
  #   directory in function) should be ported; 
  #   so: broken up and either removed or moved elsewhere;
  
  # templates directory (for jinja, gone)

  # webpack (fully replaced by vite, gone)
  # webpack's static/build will be gone; taken care of by vite

  # other than that it's mostly the new flask routes/config and react, both redundant to above scheme

  # tutorials (deprecated i think)

  # minimal anything else in root