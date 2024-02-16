
# eduRange3 [![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/coojac09/edurange-flask/blob/master/LICENSE) [![Py2&3](https://img.shields.io/badge/Python-2%20%26%203-green.svg)]()

EDURange

Additional documentation can be found in the wiki

## Installation
We recommend using a new Ubuntu 22.04 LTS installation, using Python 3.10

Support for other Operating Systems and Python versions is pending.

First, clone this repository

```bash
git clone https://github.com/edurange/edurange3.git --recurse-submodules
```

Then, run the installation script (./install.sh), and input credentials when prompted.

Please use unique responses for each prompt.
```bash
cd edurange3
./install.sh
```
To verify that you're ready to launch the app, check that "flask" and "celery" are recognized bash commands, and whether "docker run hello-world" works.
If any of these fail, simply log out and back in, and they should work then. 

### Running Locally

Once installed, start the app using
```bash
cd edurange3 (if not in edurange3 root dir)
npm start
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
### creating a student group
As administrator, you can create a student group using the GUI.
You can create default users in that group for testing purposes. You should save their credentials so that you can fully explore scenarios as a student.
Those credentials are for the flask server, not for the Containers in the scanarios.

