from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from profile_info import * # This is a separate document where I set the variables in all-caps
import time
import threading
import shutil
import tempfile



def submit_command(command, driver):

	action = ActionChains(driver)
	action.send_keys(command)
	action.key_down(Keys.RETURN).key_up(Keys.RETURN).perform()
	
	
def simulate_user(credentials):

	print("entered user function")

	# Connect to Firefox
	service = Service("geckodriver")
	options = Options()
	options.add_argument("-profile")
	options.add_argument(FIREFOX_PROFILE_PATH)
	driver = webdriver.Firefox(service=service, options=options)

	# Open EDURange and log in
	driver.maximize_window()
	driver.get("https://edurange.dev")
	time.sleep(1)
	login_button = driver.find_element(By.CLASS_NAME, "edu3-nav-link")
	login_button.click()
	time.sleep(1)
	username_field = driver.find_element(By.ID, "username")
	password_field = driver.find_element(By.ID, "password")
	username_field.send_keys(credentials[0])
	password_field.send_keys(credentials[1])
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
	submit_command("iamfrustrated", driver)
	time.sleep(1)
	submit_command("ls", driver)
	time.sleep(1)
	submit_command("iamfrustrated", driver)

	time.sleep(4)

	driver.close()
	
	
# Try running multiple at once :0
threads = []
for user in CREDENTIALS:
	print(user)
	thread = threading.Thread(target=simulate_user, args=(user,))
	threads.append(thread)
	thread.start()
	print("Here we are!")
	
for thread in threads:
	thread.join()
	
	
	
	
	
	
