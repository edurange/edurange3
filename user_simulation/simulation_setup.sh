#!/bin/bash

pip3 install selenium

read -p "Chrome or Firefox? (Enter C/F): " browser

if [[ ${browser,,} == "f" ]] || [[ ${browser,,} == "firefox" ]]; then
    wget https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz
    tar xf geckodriver-v0.34.0-linux64.tar.gz
    sed -i "s|REPLACE_ME_1|from selenium.webdriver.firefox.service import Service|g" simulate_user.py
    sed -i 's|REPLACE_ME_2|service = Service("geckodriver")|g' simulate_user.py
    sed -i "s|REPLACE_ME_3|self.driver = webdriver.Firefox(service=service)|g" simulate_user.py
    
elif [[ ${browser,,} == "c" ]] || [[ ${browser,,} == "chrome" ]]; then
    pip3 install chromedriver-autoinstaller
    sed -i "s|REPLACE_ME_1|import chromedriver_autoinstaller|g" simulate_user.py
    sed -i "s|REPLACE_ME_2|chromedriver_autoinstaller.install()|g" simulate_user.py
    sed -i "s|REPLACE_ME_3|self.driver = webdriver.Chrome()|g" simulate_user.py
fi