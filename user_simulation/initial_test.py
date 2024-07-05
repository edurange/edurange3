from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from profile_info import *
import time


service = Service("geckodriver")
options = Options()
options.add_argument("-profile")
options.add_argument(FIREFOX_PROFILE_PATH)
driver = webdriver.Firefox(service=service, options=options)


username = CREDENTIALS[0][0]
password = CREDENTIALS[0][1]


driver.maximize_window()
driver.get("https://edurange.dev")
time.sleep(1)
login_button = driver.find_element(By.CLASS_NAME, "edu3-nav-link")
login_button.click()
time.sleep(1)
username_field = driver.find_element(By.ID, "username")
password_field = driver.find_element(By.ID, "password")
username_field.send_keys(username)
password_field.send_keys(password)
password_field.send_keys(Keys.RETURN)
time.sleep(2)


driver.close()
