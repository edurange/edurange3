#!/bin/bash

# Initial requirements
pip install selenium
wget https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz
tar xf geckodriver-v0.34.0-linux64.tar.gz

# Making the profile_info.py file
touch profile_info.py
firefox_profile = $(sudo grep -m 1 -Po '(?<=Path=).*' /$HOME/snap/firefox/common/.mozilla/firefox/profiles.ini)
echo 'FIREFOX_PROFILE_PATH = "/home/jsco/snap/firefox/common/.mozilla/firefox/${firefox_profile}"' >> profile_info.py
