
# eduRange3 [![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/coojac09/edurange-flask/blob/master/LICENSE) [![Py2&3](https://img.shields.io/badge/Python-2%20%26%203-green.svg)]()

# SIGCSE? Click [Here](https://github.com/edurange/edurange3/tree/sigcse25)



**NOTE:  If you are installing on a new Virtual Machine or Ubuntu 22.04 installation,
it is likely you will need to install 'git' via apt.**
To do so, enter the following in your bash cli:
```
sudo apt update
sudo apt upgrade
sudo apt install git
```
It is also recommended that you use 'minimal installation' option for the Ubuntu install,
as well as skip updates.  You can update from the command line with the above sequence.

Once you have your Ubuntu 22 set up, proceed to these steps...

## Step 1: Clone the edurange3 github repo

First, clone this repository (choose ONE of these commands, not both!)

**Be sure you're cloning this branch (sigcse25)**

If you're using standard git auth (no key), then use the HTTPS clone:
```bash
git clone -b sigcse25 https://github.com/edurange/edurange3.git
```
If you're using an ssh key to auth, then use the SSH clone:
```bash
git clone -b sigcse25 git@github.com:edurange/edurange3.git
```

## Step 2: Install edurange3 and dependencies
Next, run the installation script from the project root (./install.sh), and input your NEW credentials when prompted.

Please use unique responses for each prompt.
```bash
cd edurange3
./quick_install.sh
```
To verify that you're ready to launch the app, check that "flask" and "celery" are recognized bash commands, and whether "docker run hello-world" works.
If any of these fail, simply log out and back in, and they should work then. 

## Step 3: Running Locally

3) Once installed, start the app using
```bash
cd edurange3 (if not in edurange3 root dir)
npm run build
npm start
```

Or, for a live-reload dev version run with Vite (without a build), start the app using
```bash
cd edurange3 (if not in edurange3 root dir)
npm run dev
```

Or each service can be run separately 
```bash
flask run --host=0.0.0.0
celery worker -B -E -f celery.log -l DEBUG -A edurange3.py_flask.utils.tasks
```
After npm start has started flask (it continues running), you can open a browser and connect
For example, with URL ```localhost:5000``` 
Login to the server using the administrator credentials set in the .env file
```
FLASK_USERNAME = ...
PASSWORD = ...
```

## More Info

### .env
For developers, it is important to be aware of the .env file that is created and placed in the edurange3 root directory.
This env will have values that are likely unique to YOUR installtion.  It is recommended to at least review the file.  
This file is in the repo's .gitignore, which means it will not be added to your git commits.

### Instructor orientation
As admin, you can create student groups, create 'dummy accounts', and  create scenarios, all from the 'Dashboard' (click the nav link on the left sidebar).

In order to create a Scenario, you must have at least 1 student group that will be assigned to it.
If you do not already have a student group, create a Student Group on the Dashboard BEFORE you create the Scenario (optionally, create test users to go with it).

Then, at the top of the 'Scenarios' table, use the dropdown menu to select a Student Group, the 'Type' of Scenario you want,
and a UNIQUE scenario name (one that does not current exist in your database).  Hit create.

Once your scenario has been created, it should automatically rest at the 'stopped' status.  Finally, press the START button to allow student access to the new Scenario.



