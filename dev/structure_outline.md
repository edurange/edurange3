
The notes in this doc are my sketchy/preliminary suggestions
in regards to changes that could be made from the current structure to
a new one.  

These are only my suggestions, and not set in stone, nor is it complete.  However,
as long as this document is here, we should try to keep it mostly accurate
to whatever we decide (or delete it).
- Jonah / exoriparian

edurange3
  /py_flask
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
      /scenarios
      /instructor
    /entry (only contains index.html and entry.jsx, to load react initial script)
  /node 
    /node_modules # non-react node modules to support the socket server
    /ssh # (won't necessarily need subdirs for ssh & chat bc they both can run on same node server) 
    /chat
  /dock
  /logging
  /algo (hint system, possibly mixed language)
  /py_celery (does this make sense?)
  /tform
    /data?/tmp? # dynamic (terraform related) scen data moved from /scenarios into /terraform (?)
  /scenarios
    for more static scen data like scenario text, questions and answers, etc
  /shell_scripts # For bash scripts
    clear_scenarios.sh
    otherBashScripts.sh
  /supervisord_programs? # maybe unncessesary / optional

  install.sh # keep in root?  
  package.json
  .gitignore
  app.py
  celery.log?
  celerybeat-schedule? (can these be moved?)

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