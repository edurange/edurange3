from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from profile_info import *


service = Service("geckodriver")
options = Options()
options.add_argument("-profile")
options.add_argument(FIREFOX_PROFILE_PATH)
driver = webdriver.Firefox(service=service, options=options)


username = "group0"
password = "lyspy3ez"


driver.maximize_window()
driver.get("https://edurange.dev")
login_button = driver.find_element(By.CLASS_NAME, "edu3-nav-link")
login_button.click()

driver.close()
