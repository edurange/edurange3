from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
REPLACE_ME_1
import time
import threading



class User:
	
	def __init__(self, credentials):
		self.credentials = credentials

		REPLACE_ME_2
		REPLACE_ME_3

		
	def submit_text(self, text):
		action = ActionChains(self.driver)
		action.send_keys(text)
		action.key_down(Keys.RETURN).key_up(Keys.RETURN).perform()
		time.sleep(1)
		
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
		
	def open_ssh(self):
		ssh_button = self.driver.find_element(By.CLASS_NAME, "footcontrol-item.footcontrol-web-ssh-button")
		ssh_button.click()
		time.sleep(1)
		
	def open_chat(self):
		right_side = self.driver.find_element(By.CLASS_NAME, "scenario-rightpane-frame")
		right_side.find_element(By.CLASS_NAME, "footcontrol-item.footcontrol-chat-button").click()
		time.sleep(1)
		
	def open_guide(self):
		guide_button = self.driver.find_element(By.CLASS_NAME, "footcontrol-item.footcontrol-info-button")
		guide_button.click()
		time.sleep(1)
		
	def change_guide_tab(self, number):
		tab_panel = self.driver.find_element(By.CLASS_NAME, "guidepane-controlbar-tabs-frame")
		all_tabs = tab_panel.find_elements(By.TAG_NAME, "a")
		new_tab = all_tabs[number]
		new_tab.click()
		time.sleep(1)
		
	def select_ssh(self):
		event_box = self.driver.find_element(By.CLASS_NAME, "terminal.xterm.xterm-dom-renderer-owner-1")
		event_box.click()
	
	def select_question(self, number):
		question_box = self.driver.find_elements(By.CLASS_NAME, "edu3-qSubmit-text")
		question_box[number].click()
		
	def select_chat(self):
		chat_box = self.driver.find_element(By.CLASS_NAME, "sender-text")
		chat_box.click()
			
	def quit(self):
		time.sleep(4)
		self.driver.quit()

	
	
	
	
def run_user(credentials):
	
	user = User(credentials)
	
	user.login()
	user.enter_scenario(SCENARIO)
	
	user.open_ssh()
	user.select_ssh()
	user.submit_text("iamfrustrated")
	user.submit_text("ls")
	
	# for file_wrangler
	user.change_guide_tab(5)
	user.select_question(1)
	user.submit_text("4")
	
	user.select_ssh()
	user.submit_text("echo 'hello world'")
	
	user.open_chat()
	user.select_chat()
	user.submit_text("help me pleaseee")
	
	time.sleep(3)
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
	
	info_file = open("saved_info.py", "w")
	info_file.write("NUM_USERS = " + num_users + "\nSITE = \"https://" + site + "\"\nSCENARIO = \"" + scenario + "\"\nCREDENTIALS = " + creds)
	
	
	
	
def run():

	save = input("Use previous settings? y/n ")
	if save.lower() == "n":
		get_info()
	
	global NUM_USERS, SITE, SCENARIO, CREDENTIALS	
	import saved_info as info
	NUM_USERS = info.NUM_USERS
	SITE = info.SITE
	SCENARIO = info.SCENARIO
	CREDENTIALS = info.CREDENTIALS
	
	run_many_users()





	
run()
	
	
	
	
