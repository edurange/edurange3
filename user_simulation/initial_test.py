from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from profile_info import * # This is a separate document where I set the variables in all-caps
import time


service = Service("geckodriver")
options = Options()
options.add_argument("-profile")
options.add_argument(FIREFOX_PROFILE_PATH)
driver = webdriver.Firefox(service=service, options=options)


username = CREDENTIALS[0][0]
password = CREDENTIALS[0][1]

def submit_command(command):
	action = ActionChains(driver)
	for letter in command:
		action.key_down(letter).key_up(letter)
	action.key_down(Keys.RETURN).key_up(Keys.RETURN).perform()


# Open EDURange and log in
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
time.sleep(1)

# Select specific scenario, open the Web SSH, and click on text area
most_boxes = driver.find_elements(By.CLASS_NAME, "table-cell-item.highlightable-cell.col-small")
for box in most_boxes:
	if box.get_attribute("innerHTML") == SCENARIO_NAME:
		box.click()
		break
time.sleep(1)
ssh_button = driver.find_element(By.CLASS_NAME, "footcontrol-item.footcontrol-web-ssh-button")
ssh_button.click()
time.sleep(1)
event_box = driver.find_element(By.CLASS_NAME, "terminal.xterm.xterm-dom-renderer-owner-1")
event_box.click()

# Enter commands
submit_command("iamfrustrated")
time.sleep(1)
submit_command("ls")


time.sleep(4)




driver.close()
