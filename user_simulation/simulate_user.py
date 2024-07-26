from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time
import threading
import shutil
import tempfile



class User:
	
	def __init__(self, credentials):
		self.credentials = credentials
		service = Service("geckodriver")
		self.driver = webdriver.Firefox(service=service)
		
	def submit_command(self, command):
		action = ActionChains(self.driver)
		action.send_keys(command)
		action.key_down(Keys.RETURN).key_up(Keys.RETURN).perform()
		
	def login(self):
		self.driver.get(SITE)
		time.sleep(1)
		login_button = self.driver.find_element(By.CLASS_NAME, "edu3-nav-link")
		login_button.click()
		time.sleep(1)
		username_field = self.driver.find_element(By.ID, "username")
		password_field = self.driver.find_element(By.ID, "password")
		username_field.send_keys(self.credentials[0])
		password_field.send_keys(self.credentials[1])
		password_field.send_keys(Keys.RETURN)
		time.sleep(2)
		
	def enter_scenario(self, scenario):
		most_boxes = self.driver.find_elements(By.CLASS_NAME, "table-cell-item.highlightable-cell.col-small")
		for box in most_boxes:
			if box.get_attribute("innerHTML") == scenario:
				box.click()
				break
		time.sleep(1)
		ssh_button = self.driver.find_element(By.CLASS_NAME, "footcontrol-item.footcontrol-web-ssh-button")
		ssh_button.click()
		time.sleep(1)
		event_box = self.driver.find_element(By.CLASS_NAME, "terminal.xterm.xterm-dom-renderer-owner-1")
		event_box.click()
		
	def sample_commands(self):
		for i in range(3):
			self.submit_command("iamfrustrated")
			time.sleep(1)
			self.submit_command("ls")
			time.sleep(1)
			
	def quit(self):
		time.sleep(4)
		self.driver.quit()

	
	
	
	
def run_user(credentials):
	
	user = User(credentials)
	user.login()
	user.enter_scenario(SCENARIO)
	user.sample_commands()
	user.quit()




def run_many_users():

	threads = []
	counter = 0
	for user in CREDENTIALS:
		if counter >= NUM_USERS:
			break
		counter += 1
	
		thread = threading.Thread(target=run_user, args=(user,))
		threads.append(thread)
		thread.start()
	
	for thread in threads:
		thread.join()
	
	
	
	
def get_info():
	num_users = input("Enter the number of users: ")
	creds_path = input("Enter path to credentials file: ")
	creds_file = open(creds_path, "r")
	creds = creds_file.read()
	site = input("Enter eduRange host site: ")
	scenario = input("Enter scenario name: ")
	
	info_file = open("profile_info.py", "w")
	info_file.write("NUM_USERS = " + num_users + "\nSITE = \"https://" + site + "\"\nSCENARIO = \"" + scenario + "\"\nCREDENTIALS = " + creds)
	
	
	
def run():
	save = input("Use previous settings? y/n ")
	if save.lower() == "n":
		get_info()
	
	global NUM_USERS, SITE, SCENARIO, CREDENTIALS	
	import profile_info as info
	NUM_USERS = info.NUM_USERS
	SITE = info.SITE
	SCENARIO = info.SCENARIO
	CREDENTIALS = info.CREDENTIALS
	
	run_many_users()
	
run()
	
	
	
	
