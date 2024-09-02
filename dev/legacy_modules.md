```
📦 edurange-flask
├─ .env.example
├─ .eslintrc
├─ .gitignore
├─ .gitmodules
├─ .travis.yml
├─ .wsl2_install
├─ Dockerfile
├─ LICENSE
├─ README.md
├─ assets
│  ├─ css
│  │  ├─ README.txt
│  │  └─ style.css
│  ├─ fontawesome
│  │  ├─ css
│  │  │  └─ all.css
│  │  └─ webfonts
│  │     ├─ fa-brands-400.ttf
│  │     ├─ fa-brands-400.woff2
│  │     ├─ fa-regular-400.ttf
│  │     ├─ fa-regular-400.woff2
│  │     ├─ fa-solid-900.ttf
│  │     ├─ fa-solid-900.woff2
│  │     ├─ fa-v4compatibility.ttf
│  │     └─ fa-v4compatibility.woff2
│  ├─ img
│  │  ├─ .gitkeep
│  │  ├─ Getting_Started
│  │  │  ├─ 2.png
│  │  │  └─ 3.png
│  │  ├─ Metasploitable
│  │  │  └─ m-h_example_cmd_line.png
│  │  ├─ Ssh_Inception
│  │  │  ├─ RSA.png
│  │  │  ├─ cat_secret.png
│  │  │  ├─ decrypt.png
│  │  │  ├─ decryptpassword.png
│  │  │  ├─ grep-f.png
│  │  │  ├─ grep_f.png
│  │  │  ├─ image1.png
│  │  │  ├─ key.png
│  │  │  ├─ keys.png
│  │  │  ├─ man_nmap.png
│  │  │  ├─ man_ssh.png
│  │  │  ├─ nat.png
│  │  │  ├─ nmap.png
│  │  │  ├─ nmap_ln.png
│  │  │  ├─ pwd-L.png
│  │  │  ├─ pwd_L.png
│  │  │  ├─ rsa_search.png
│  │  │  ├─ secret.png
│  │  │  └─ vim_secret.png
│  │  ├─ booting.png
│  │  ├─ building.png
│  │  ├─ favicon.ico
│  │  ├─ started.png
│  │  ├─ stopped.png
│  │  └─ stopping.png
│  └─ js
│     ├─ main.js
│     ├─ plugins.js
│     └─ script.js
├─ autoapp.py
├─ clear_scenarios.sh
├─ docker-compose.yml
├─ edurange-flask.iml
├─ edurange.org
├─ edurange_refactored
│  ├─ __init__.py
│  ├─ api
│  │  ├─ __init__.py
│  │  ├─ content.schema.json
│  │  ├─ contents.py
│  │  ├─ sample_content.json
│  │  ├─ sample_state.json
│  │  └─ state.schema.json
│  ├─ app.py
│  ├─ chat_server
│  │  ├─ chat_server.js
│  │  ├─ chat_server2.js
│  │  ├─ chat_server_logs.csv
│  │  ├─ edurange-flask.code-workspace
│  │  ├─ input.txt
│  │  ├─ messageStore.js
│  │  └─ sessionStore.js
│  ├─ commands.py
│  ├─ csv_utils.py
│  ├─ database.py
│  ├─ dev
│  │  ├─ README.md
│  │  ├─ backend_migration.md
│  │  ├─ convention
│  │  │  ├─ casing.md
│  │  │  └─ reactDirectory.md
│  │  ├─ help
│  │  │  ├─ backendBreadcrumbs.txt
│  │  │  ├─ important_locations.txt
│  │  │  ├─ migrate_step_by_step.txt
│  │  │  ├─ prestage-steps.pdf
│  │  │  ├─ reactArrayToElementMap
│  │  │  │  ├─ SampleCard.js
│  │  │  │  ├─ SampleParent.js
│  │  │  │  └─ mapping.txt
│  │  │  └─ routes_template.py
│  │  └─ justification
│  │     └─ directoryRestructure.txt
│  ├─ extensions.py
│  ├─ flask
│  │  ├─ README.md
│  │  ├─ config
│  │  │  └─ README.md
│  │  ├─ flask.index.py
│  │  └─ modules
│  │     ├─ README.md
│  │     ├─ db
│  │     │  ├─ README.md
│  │     │  ├─ db.index.py
│  │     │  └─ schemas
│  │     │     ├─ README.txt
│  │     │     └─ user_schemas.py
│  │     ├─ routes
│  │     │  ├─ README.md
│  │     │  ├─ __init__.py
│  │     │  ├─ admin_routes.py
│  │     │  ├─ instructor_routes.py
│  │     │  ├─ public_routes.py
│  │     │  ├─ scenario_routes.py
│  │     │  └─ student_routes.py
│  │     └─ utils
│  │        ├─ README.md
│  │        ├─ account_utils.py
│  │        ├─ admin_utils.py
│  │        ├─ auth_utils.py
│  │        ├─ common_utils.py
│  │        ├─ db_devHelper.py
│  │        ├─ guide_utils.py
│  │        ├─ instructor_utils.py
│  │        └─ scenario_interface.py
│  ├─ form_utils.py
│  ├─ graph_utils.py
│  ├─ nodejs
│  │  ├─ .gitignore
│  │  ├─ er3_modules
│  │  │  ├─ er3_chat.js
│  │  │  └─ er3_ssh.js
│  │  ├─ er3_nodeServer.js
│  │  ├─ helloChat_server.js
│  │  ├─ package.json
│  │  └─ public
│  │     ├─ ChatApp.js
│  │     ├─ chatEntry.js
│  │     └─ index.html
│  ├─ notification_utils.py
│  ├─ public
│  │  ├─ __init__.py
│  │  ├─ forms.py
│  │  ├─ img
│  │  │  ├─ bug.png
│  │  │  ├─ hamburger.png
│  │  │  ├─ home.png
│  │  │  ├─ info.png
│  │  │  ├─ logout.png
│  │  │  ├─ plant-tree.png
│  │  │  ├─ sitemap.png
│  │  │  ├─ terminal1.png
│  │  │  └─ terminal2.png
│  │  ├─ socket.py
│  │  └─ views.py
│  ├─ react
│  │  ├─ README.md
│  │  ├─ api
│  │  │  ├─ README.md
│  │  │  ├─ common
│  │  │  │  ├─ README.txt
│  │  │  │  └─ fetchHelper.js
│  │  │  ├─ config
│  │  │  │  └─ AxiosConfig.js
│  │  │  └─ test
│  │  │     └─ axiosTest
│  │  │        ├─ AxiosTestChild1.js
│  │  │        ├─ AxiosTestChild2.js
│  │  │        └─ AxiosTestMain.js
│  │  ├─ assets
│  │  │  ├─ README.md
│  │  │  ├─ assets.index.js
│  │  │  ├─ css
│  │  │  │  └─ unified
│  │  │  │     └─ pucs.css
│  │  │  └─ img
│  │  │     ├─ README.md
│  │  │     └─ svg
│  │  │        └─ small
│  │  │           ├─ alchemy.svg
│  │  │           ├─ elf.svg
│  │  │           ├─ fingerprint.svg
│  │  │           ├─ getting_started.svg
│  │  │           ├─ kick.svg
│  │  │           ├─ maze.svg
│  │  │           ├─ survivalist.svg
│  │  │           ├─ telephoneMan.svg
│  │  │           ├─ telephoneWoman.svg
│  │  │           ├─ tmap.svg
│  │  │           ├─ turtle.svg
│  │  │           ├─ twoHeads.svg
│  │  │           └─ wrangler.svg
│  │  ├─ config
│  │  │  └─ README.md
│  │  ├─ entry
│  │  │  ├─ EduRangeEntry.js
│  │  │  └─ README.md
│  │  ├─ modules
│  │  │  ├─ README.md
│  │  │  ├─ context
│  │  │  │  ├─ Admin_context.js
│  │  │  │  ├─ Instructor_context.js
│  │  │  │  ├─ LoggedIn_context.js
│  │  │  │  ├─ Public_context.js
│  │  │  │  └─ README.md
│  │  │  ├─ nav
│  │  │  │  ├─ README.md
│  │  │  │  └─ navItemsData.js
│  │  │  ├─ shells
│  │  │  │  ├─ README.md
│  │  │  │  ├─ instructorData_shells.js
│  │  │  │  ├─ scenarioType_shells.js
│  │  │  │  ├─ scenario_guide_shells.js
│  │  │  │  └─ user_shells.js
│  │  │  ├─ ui
│  │  │  │  ├─ README.md
│  │  │  │  ├─ cardIcons.index.js
│  │  │  │  └─ edurangeIcons.js
│  │  │  └─ utils
│  │  │     ├─ GenericDataFetcher.js
│  │  │     └─ copyToClipboard.js
│  │  └─ pages
│  │     └─ home
│  │        ├─ dashboard
│  │        │  ├─ README.txt
│  │        │  ├─ account
│  │        │  │  └─ src
│  │        │  │     ├─ Account.css
│  │        │  │     └─ Account.js
│  │        │  ├─ admin
│  │        │  │  └─ src
│  │        │  │     ├─ Admin_controller.js
│  │        │  │     ├─ Admin_home.js
│  │        │  │     ├─ Admin_router.js
│  │        │  │     └─ Test_controls.js
│  │        │  ├─ instructor
│  │        │  │  └─ src
│  │        │  │     ├─ Staff_Dash.js
│  │        │  │     ├─ Instructor_ScenDetail.js
│  │        │  │     ├─ Instr_ScenTable.js
│  │        │  │     └─ Panopticon.js
│  │        │  ├─ scenarios
│  │        │  │  ├─ README.txt
│  │        │  │  ├─ chat
│  │        │  │  │  └─ src
│  │        │  │  │     └─ ScenarioChat.js
│  │        │  │  └─ src
│  │        │  │     ├─ Scenarios_home.css
│  │        │  │     ├─ Scenarios_home.js
│  │        │  │     ├─ Student_router.js
│  │        │  │     ├─ components
│  │        │  │     │  └─ cards
│  │        │  │     │     ├─ CategoryCard.js
│  │        │  │     │     ├─ ItemCard.js
│  │        │  │     │     ├─ UserCard.js
│  │        │  │     │     ├─ cardHelper.js
│  │        │  │     │     └─ cards.css
│  │        │  │     ├─ guide
│  │        │  │     │  ├─ Q_and_A
│  │        │  │     │  │  ├─ GuideQuestion.js
│  │        │  │     │  │  ├─ GuideReading.js
│  │        │  │     │  │  ├─ HomeChapter.js
│  │        │  │     │  │  ├─ Q_and_A.css
│  │        │  │     │  │  └─ SubmitButton.js
│  │        │  │     │  ├─ Scenario_controller.css
│  │        │  │     │  ├─ Scenario_controller.js
│  │        │  │     │  ├─ controls
│  │        │  │     │  │  ├─ FootControls.css
│  │        │  │     │  │  └─ FootControls.js
│  │        │  │     │  ├─ panes
│  │        │  │     │  │  ├─ Copy_button.css
│  │        │  │     │  │  ├─ Copy_button.js
│  │        │  │     │  │  ├─ Copy_button_small.css
│  │        │  │     │  │  ├─ Copy_button_small.js
│  │        │  │     │  │  ├─ GuidePane.css
│  │        │  │     │  │  ├─ GuidePane.js
│  │        │  │     │  │  ├─ InfoPane.css
│  │        │  │     │  │  ├─ InfoPane.js
│  │        │  │     │  │  ├─ Resources_card.css
│  │        │  │     │  │  ├─ Resources_card.js
│  │        │  │     │  │  ├─ SSH_card.css
│  │        │  │     │  │  └─ SSH_card.js
│  │        │  │     │  └─ ssh
│  │        │  │     │     ├─ SSH_web.css
│  │        │  │     │     └─ SSH_web.js
│  │        │  │     ├─ list
│  │        │  │     │  ├─ ScenarioTable.css
│  │        │  │     │  └─ ScenarioTable.js
│  │        │  │     ├─ modules
│  │        │  │     │  ├─ scenarioResources.js
│  │        │  │     │  └─ utils
│  │        │  │     │     ├─ buildGuide.js
│  │        │  │     │     ├─ guide_utils.js
│  │        │  │     │     └─ login_utils.js
│  │        │  │     └─ scratch
│  │        │  │        └─ util
│  │        │  │           └─ buildInstructorData.js
│  │        │  ├─ src
│  │        │  │  ├─ Dashboard.css
│  │        │  │  ├─ Dashboard_home.js
│  │        │  │  ├─ Dashboard_router.js
│  │        │  │  ├─ components
│  │        │  │  │  └─ notifications
│  │        │  │  │     └─ components
│  │        │  │  │        ├─ DashNotifications.css
│  │        │  │  │        ├─ DashNotifications.js
│  │        │  │  │        └─ DashNotificationsTable.js
│  │        │  │  └─ sidenav
│  │        │  │     ├─ SideNav.css
│  │        │  │     └─ SideNav.js
│  │        │  └─ users
│  │        │     └─ src
│  │        │        ├─ UserGroups.js
│  │        │        ├─ UserGroupsTable.js
│  │        │        ├─ Users.js
│  │        │        └─ UsersTable.js
│  │        ├─ info
│  │        │  ├─ README.txt
│  │        │  ├─ about
│  │        │  │  └─ src
│  │        │  │     └─ About.js
│  │        │  ├─ contact
│  │        │  │  └─ src
│  │        │  │     └─ Contact.js
│  │        │  ├─ docs
│  │        │  │  └─ src
│  │        │  │     └─ Documents.js
│  │        │  ├─ faq
│  │        │  │  └─ FAQ.js
│  │        │  ├─ help
│  │        │  │  └─ src
│  │        │  │     └─ HelpPage.js
│  │        │  └─ src
│  │        │     ├─ Info_home.css
│  │        │     ├─ Info_home.js
│  │        │     └─ Info_router.js
│  │        ├─ options
│  │        │  ├─ README.txt
│  │        │  └─ src
│  │        │     ├─ Options.css
│  │        │     ├─ Options_controller.js
│  │        │     ├─ Options_home.js
│  │        │     └─ components
│  │        │        ├─ Options_accessibility.js
│  │        │        └─ Options_themes.js
│  │        └─ src
│  │           ├─ Home.css
│  │           ├─ Home.js
│  │           ├─ Home_router.js
│  │           ├─ SessionKeeper.js
│  │           └─ components
│  │              ├─ frame
│  │              │  ├─ foot
│  │              │  │  ├─ HomeFoot.css
│  │              │  │  └─ HomeFoot.js
│  │              │  └─ head
│  │              │     ├─ HomeHead.css
│  │              │     ├─ HomeHead.js
│  │              │     ├─ Notifs_button.css
│  │              │     └─ Notifs_button.js
│  │              ├─ login
│  │              │  ├─ Login.css
│  │              │  ├─ Login.js
│  │              │  └─ Register.js
│  │              └─ logout
│  │                 └─ Logout.js
│  ├─ role_utils.py
│  ├─ scenario_json.py
│  ├─ scenario_utils.py
│  ├─ settings.py
│  ├─ tasks.py
│  ├─ tasks_sister.py
│  ├─ templates
│  │  ├─ 401.html
│  │  ├─ 403.html
│  │  ├─ 404.html
│  │  ├─ 500.html
│  │  ├─ README.txt
│  │  ├─ accountmgmt
│  │  │  └─ components
│  │  │     ├─ .accountmgmt.html.swp
│  │  │     ├─ accountmgmt.css
│  │  │     ├─ accountmgmt.html
│  │  │     ├─ accountmgmt.js
│  │  │     └─ email-form
│  │  │        └─ ChangeEmailForm.js
│  │  ├─ api
│  │  │  └─ test.html
│  │  ├─ dashboard
│  │  │  ├─ account_management.html
│  │  │  ├─ admin.html
│  │  │  ├─ catalog.html
│  │  │  ├─ create_scenario.html
│  │  │  ├─ graphs.html
│  │  │  ├─ instructor.html
│  │  │  ├─ notification.html
│  │  │  ├─ notification_original.html
│  │  │  ├─ scenario_response.html
│  │  │  ├─ scenarios.html
│  │  │  ├─ scenarios_info.html
│  │  │  ├─ student.html
│  │  │  ├─ student_scenario.html
│  │  │  └─ student_scenario_new.html
│  │  ├─ footer.html
│  │  ├─ instructor_view
│  │  │  ├─ components
│  │  │  │  ├─ chat_entry
│  │  │  │  │  ├─ chat_entry.component.js
│  │  │  │  │  └─ chat_entry.css
│  │  │  │  ├─ chat_input
│  │  │  │  │  ├─ chat_input.components.js
│  │  │  │  │  └─ chat_input.css
│  │  │  │  ├─ chat_window
│  │  │  │  │  ├─ chat_window.component.js
│  │  │  │  │  └─ chat_window.css
│  │  │  │  ├─ instructor_view
│  │  │  │  │  ├─ instructor_view.component.js
│  │  │  │  │  ├─ instructor_view.css
│  │  │  │  │  └─ temp.js
│  │  │  │  ├─ notes.txt
│  │  │  │  ├─ student
│  │  │  │  │  ├─ student.component.js
│  │  │  │  │  └─ student.css
│  │  │  │  └─ student_list
│  │  │  │     ├─ student_list.component.js
│  │  │  │     └─ student_list.css
│  │  │  └─ states.json
│  │  ├─ layout.html
│  │  ├─ nav.html
│  │  ├─ public
│  │  │  ├─ about.html
│  │  │  ├─ edurange_entry.html
│  │  │  ├─ home.html
│  │  │  ├─ instructor_sees_all.html
│  │  │  ├─ login.html
│  │  │  ├─ register.html
│  │  │  ├─ request_reset_password.html
│  │  │  ├─ restore_password.html
│  │  │  ├─ socket.html
│  │  │  └─ student_view.html
│  │  ├─ sidebar.html
│  │  ├─ student_view
│  │  │  ├─ components
│  │  │  │  ├─ chat_components
│  │  │  │  │  ├─ entry_field
│  │  │  │  │  │  ├─ entry_field.component.js
│  │  │  │  │  │  └─ entry_field.styles.css
│  │  │  │  │  ├─ message
│  │  │  │  │  │  ├─ message.component.js
│  │  │  │  │  │  └─ message.styles.css
│  │  │  │  │  ├─ message_window
│  │  │  │  │  │  ├─ message_window.component.js
│  │  │  │  │  │  └─ message_window.styles.css
│  │  │  │  │  └─ socket_event_handler
│  │  │  │  │     ├─ socket_event_handler.component.js
│  │  │  │  │     └─ socket_event_handler.styles.css
│  │  │  │  ├─ chatbox
│  │  │  │  │  ├─ chatbox.component.js
│  │  │  │  │  └─ chatbox.styles.css
│  │  │  │  ├─ client_socket
│  │  │  │  │  ├─ client_socket.component.js
│  │  │  │  │  └─ client_socket.styles.css
│  │  │  │  ├─ group_chat_components
│  │  │  │  │  ├─ group_chat_entry
│  │  │  │  │  │  ├─ group_chat_entry.component.js
│  │  │  │  │  │  └─ group_chat_entry.css
│  │  │  │  │  ├─ group_chat_window
│  │  │  │  │  │  ├─ group_chat_window.component.js
│  │  │  │  │  │  └─ group_chat_window.css
│  │  │  │  │  ├─ group_client_socket
│  │  │  │  │  │  ├─ group_client_socket.component.js
│  │  │  │  │  │  └─ group_client_socket.styles.css
│  │  │  │  │  └─ hook_tester
│  │  │  │  │     └─ hook_tester.js
│  │  │  │  ├─ guide-section
│  │  │  │  │  ├─ guide-section.component.js
│  │  │  │  │  └─ guide-section.styles.css
│  │  │  │  ├─ question
│  │  │  │  │  ├─ question.component.js
│  │  │  │  │  └─ question.styles.css
│  │  │  │  ├─ reading
│  │  │  │  │  ├─ reading.component.js
│  │  │  │  │  └─ reading.styles.css
│  │  │  │  ├─ sample_content.json
│  │  │  │  ├─ scenario
│  │  │  │  │  ├─ scenario.component.js
│  │  │  │  │  └─ scenario.styles.css
│  │  │  │  ├─ student_chat_entry
│  │  │  │  │  ├─ student_chat_entry.component.js
│  │  │  │  │  └─ student_chat_entry.css
│  │  │  │  ├─ student_chat_window
│  │  │  │  │  ├─ student_chat_window.component.js
│  │  │  │  │  └─ student_chat_window.css
│  │  │  │  └─ topic-list
│  │  │  │     ├─ topic-list.component.js
│  │  │  │     └─ topic-list.styles.css
│  │  │  └─ utils
│  │  │     └─ outstide-alerter.js
│  │  ├─ tutorials
│  │  │  ├─ Elf_Infection
│  │  │  │  └─ Elf_Infection.md
│  │  │  ├─ File_Wrangler
│  │  │  │  ├─ File_Wrangler.md
│  │  │  │  ├─ codelab.json
│  │  │  │  └─ index.html
│  │  │  ├─ Getting_Started
│  │  │  │  ├─ Getting_Started.md
│  │  │  │  ├─ codelab.json
│  │  │  │  ├─ img
│  │  │  │  │  ├─ 2.png
│  │  │  │  │  ├─ 3.png
│  │  │  │  │  └─ README.md
│  │  │  │  └─ index.html
│  │  │  ├─ Metasploitable
│  │  │  │  └─ Metasploitable.md
│  │  │  ├─ Ssh_Inception
│  │  │  │  ├─ Ssh_Inception.md
│  │  │  │  ├─ assets
│  │  │  │  │  ├─ RSA.png
│  │  │  │  │  ├─ cat_secret.png
│  │  │  │  │  ├─ decrypt.png
│  │  │  │  │  ├─ decryptpassword.png
│  │  │  │  │  ├─ grep-f.png
│  │  │  │  │  ├─ grep_f.png
│  │  │  │  │  ├─ image1.png
│  │  │  │  │  ├─ key.png
│  │  │  │  │  ├─ keys.png
│  │  │  │  │  ├─ man_nmap.png
│  │  │  │  │  ├─ man_ssh.png
│  │  │  │  │  ├─ nat.png
│  │  │  │  │  ├─ nmap.png
│  │  │  │  │  ├─ nmap_ln.png
│  │  │  │  │  ├─ pwd-L.png
│  │  │  │  │  ├─ pwd_L.png
│  │  │  │  │  ├─ rsa_search.png
│  │  │  │  │  ├─ secret.png
│  │  │  │  │  └─ vim_secret.png
│  │  │  │  ├─ codelabs.json
│  │  │  │  ├─ img
│  │  │  │  │  ├─ 1519ef92e94c377e.png
│  │  │  │  │  ├─ 18fe10d8a158f202.png
│  │  │  │  │  ├─ 275239299772b2a7.png
│  │  │  │  │  ├─ 3583f4755f63810b.png
│  │  │  │  │  ├─ 54732dc966286634.png
│  │  │  │  │  ├─ 62321fa3a84c57d.png
│  │  │  │  │  ├─ 74771d6b7a4d2305.png
│  │  │  │  │  ├─ 93634956df7dc888.png
│  │  │  │  │  ├─ 98cbbd92fd964461.png
│  │  │  │  │  ├─ add32862cb8801e7.png
│  │  │  │  │  ├─ c25b9fc576b67166.png
│  │  │  │  │  ├─ codelabexample.png
│  │  │  │  │  ├─ d28a8ca19c489b1a.png
│  │  │  │  │  ├─ decryptpassword.png
│  │  │  │  │  ├─ f137ec492d1eefab.png
│  │  │  │  │  └─ fd1a83a238456e6.png
│  │  │  │  ├─ index.html
│  │  │  │  ├─ no_codelab
│  │  │  │  ├─ ssh-inception
│  │  │  │  │  ├─ codelab.json
│  │  │  │  │  ├─ img
│  │  │  │  │  │  ├─ 1519ef92e94c377e.png
│  │  │  │  │  │  ├─ 18fe10d8a158f202.png
│  │  │  │  │  │  ├─ 275239299772b2a7.png
│  │  │  │  │  │  ├─ 3583f4755f63810b.png
│  │  │  │  │  │  ├─ 54732dc966286634.png
│  │  │  │  │  │  ├─ 62321fa3a84c57d.png
│  │  │  │  │  │  ├─ 74771d6b7a4d2305.png
│  │  │  │  │  │  ├─ 93634956df7dc888.png
│  │  │  │  │  │  ├─ 98cbbd92fd964461.png
│  │  │  │  │  │  ├─ add32862cb8801e7.png
│  │  │  │  │  │  ├─ c25b9fc576b67166.png
│  │  │  │  │  │  ├─ eab004b3a7cc0b1c.png
│  │  │  │  │  │  ├─ f137ec492d1eefab.png
│  │  │  │  │  │  └─ fd1a83a238456e6.png
│  │  │  │  │  └─ index.html
│  │  │  │  └─ sshInception.md
│  │  │  ├─ Strace
│  │  │  │  └─ Strace.md
│  │  │  ├─ Total_Recon
│  │  │  │  ├─ Total_Recon.md
│  │  │  │  ├─ codelab.json
│  │  │  │  └─ index.html
│  │  │  ├─ Treasure_Hunt
│  │  │  │  └─ Treasure_Hunt.md
│  │  │  ├─ Web_Fu
│  │  │  │  └─ Web_Fu.md
│  │  │  └─ list.html
│  │  └─ utils
│  │     ├─ .keys
│  │     │  └─ oct.json
│  │     ├─ create_group_response.html
│  │     ├─ manage_student_response.html
│  │     ├─ reset_password_email.html
│  │     ├─ reset_password_email.txt
│  │     ├─ scenario_timeout_warning_email.html
│  │     ├─ scenario_timeout_warning_email.txt
│  │     └─ student_answer_response.html
│  ├─ tutorials
│  │  ├─ __init__.py
│  │  └─ views.py
│  ├─ user
│  │  ├─ __init__.py
│  │  ├─ forms.py
│  │  ├─ models.py
│  │  └─ views.py
│  ├─ utils.py
│  ├─ webpack
│  │  └─ .gitkeep
│  └─ wsgi.py
├─ install.sh
├─ new-log-testing
│  └─ proto_milestones.yml
├─ package.json
├─ py_scripts
│  └─ translate_guide.py
├─ requirements.txt
├─ requirements
│  ├─ dev.txt
│  └─ prod.txt
├─ scenarios
│  ├─ dev
│  │  ├─ new_container_importer
│  │  │  └─ importer.py
│  │  ├─ new_scenario.sh
│  │  └─ scenario_template_files
│  │     ├─ README
│  │     ├─ container_name.tf.json
│  │     ├─ milestones.txt
│  │     ├─ network.tf.json
│  │     ├─ questions.yaml
│  │     ├─ scenario_name.json
│  │     └─ scenario_name.yaml
│  ├─ global_scripts
│  │  ├─ analyze.py
│  │  ├─ analyze_cyclic.pl
│  │  ├─ cgconfig.conf
│  │  ├─ change_root_pass
│  │  ├─ clearlogs
│  │  ├─ gateway_setup
│  │  ├─ iamfrustrated
│  │  ├─ intervention.py
│  │  ├─ limit_resources
│  │  ├─ makeTsv.py
│  │  ├─ milestone-lbl.pl
│  │  ├─ place_milestone_file
│  │  ├─ start_ttylog.sh
│  │  ├─ tty_setup
│  │  └─ ttylog
│  └─ prod
│     ├─ elf_infection
│     │  ├─ elf_infection.json
│     │  ├─ elf_infection.yml
│     │  ├─ gateway.tf.json
│     │  ├─ install
│     │  ├─ milestones.txt
│     │  ├─ motd
│     │  ├─ motd_nat
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  └─ student_view
│     │     ├─ content.json
│     │     └─ readings
│     │        ├─ Reading1.md
│     │        ├─ Reading10.md
│     │        ├─ Reading11.md
│     │        ├─ Reading2.md
│     │        ├─ Reading3.md
│     │        ├─ Reading4.md
│     │        ├─ Reading5.md
│     │        ├─ Reading6.md
│     │        ├─ Reading7.md
│     │        ├─ Reading8.md
│     │        └─ Reading9.md
│     ├─ file_wrangler
│     │  ├─ README.md
│     │  ├─ codes
│     │  │  ├─ man.txt
│     │  │  └─ perm.txt
│     │  ├─ file_wrangler.json
│     │  ├─ file_wrangler.yml
│     │  ├─ files
│     │  │  ├─ codes
│     │  │  │  ├─ manipulate.txt
│     │  │  │  └─ permissions.txt
│     │  │  ├─ instructions.txt
│     │  │  ├─ manipulate
│     │  │  │  ├─ file1.txt
│     │  │  │  └─ file2.txt
│     │  │  ├─ permissions
│     │  │  │  ├─ perm1.txt
│     │  │  │  ├─ perm2.txt
│     │  │  │  └─ task10
│     │  │  ├─ task1
│     │  │  ├─ task2
│     │  │  ├─ task3
│     │  │  ├─ task4
│     │  │  ├─ task5
│     │  │  ├─ task8
│     │  │  ├─ task9
│     │  │  └─ view
│     │  │     ├─ .Some-hidden-file.pdf
│     │  │     ├─ Part 1.pdf
│     │  │     ├─ Part 2.pdf
│     │  │     ├─ Part 3.pdf
│     │  │     ├─ Part 4.pdf
│     │  │     ├─ Part 5.pdf
│     │  │     ├─ instructions.txt
│     │  │     ├─ task6
│     │  │     └─ task7
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ install
│     │  ├─ milestones.txt
│     │  ├─ motd
│     │  │  └─ message.txt
│     │  ├─ motd_nat
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ python
│     │  │  ├─ manflag
│     │  │  └─ perflag
│     │  ├─ questions.yml
│     │  ├─ setup_player
│     │  ├─ student_view
│     │  │  ├─ content.json
│     │  │  └─ readings
│     │  │     ├─ Reading1.md
│     │  │     ├─ Reading10.md
│     │  │     ├─ Reading11.md
│     │  │     ├─ Reading2.md
│     │  │     ├─ Reading3.md
│     │  │     ├─ Reading4.md
│     │  │     ├─ Reading5.md
│     │  │     ├─ Reading6.md
│     │  │     ├─ Reading7.md
│     │  │     ├─ Reading8.md
│     │  │     └─ Reading9.md
│     │  └─ tests.json
│     ├─ getting_started
│     │  ├─ cleanup_globals
│     │  ├─ final-mission
│     │  │  ├─ .donthackme
│     │  │  └─ U348bdks8cowFJS8dJF3hHDFj.jpg
│     │  ├─ gateway.tf.json
│     │  ├─ getting_started.json
│     │  ├─ getting_started.yml
│     │  ├─ guide.md
│     │  ├─ guide_interleaved.md
│     │  ├─ images
│     │  │  ├─ 002edurange.jpg
│     │  │  ├─ 4edurange.jpeg
│     │  │  ├─ edurange001.gif
│     │  │  ├─ edurange006weeeeeee.png
│     │  │  ├─ edurange3.GIF
│     │  │  └─ edurange5meow.JPG
│     │  ├─ install
│     │  ├─ milestones.txt
│     │  ├─ motd_nat
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  ├─ setup_home
│     │  ├─ student_view
│     │  │  ├─ content.json
│     │  │  └─ readings
│     │  │     ├─ Reading1.md
│     │  │     ├─ Reading10.md
│     │  │     ├─ Reading11.md
│     │  │     ├─ Reading2.md
│     │  │     ├─ Reading3.md
│     │  │     ├─ Reading4.md
│     │  │     ├─ Reading5.md
│     │  │     ├─ Reading6.md
│     │  │     ├─ Reading7.md
│     │  │     ├─ Reading8.md
│     │  │     └─ Reading9.md
│     │  ├─ stuff
│     │  │  ├─ 3dprintedbox.txt
│     │  │  ├─ 3leggedcat.txt
│     │  │  ├─ iamanimage2.txt
│     │  │  ├─ iamanimage3.txt
│     │  │  ├─ imtxt.txt
│     │  │  └─ mysong.txt
│     │  ├─ tests.json
│     │  └─ toLearn
│     │     ├─ cat.jpg
│     │     └─ dog.jpg
│     ├─ metasploitable
│     │  ├─ Install
│     │  ├─ README
│     │  ├─ attacker_firewall_rules
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ metasploitable.json
│     │  ├─ metasploitable.yml
│     │  ├─ milestones.txt
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  ├─ student_view
│     │  │  ├─ content.json
│     │  │  └─ readings
│     │  │     ├─ Reading1.md
│     │  │     ├─ Reading10.md
│     │  │     ├─ Reading11.md
│     │  │     ├─ Reading2.md
│     │  │     ├─ Reading3.md
│     │  │     ├─ Reading4.md
│     │  │     ├─ Reading5.md
│     │  │     ├─ Reading6.md
│     │  │     ├─ Reading7.md
│     │  │     ├─ Reading8.md
│     │  │     └─ Reading9.md
│     │  ├─ target.tf.json
│     │  └─ target_firewall_rules
│     ├─ ransomware
│     │  ├─ gateway.tf.json
│     │  ├─ milestones.txt
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  ├─ ransom.tf.json
│     │  ├─ ransomware.json
│     │  ├─ ransomware.yml
│     │  └─ student_view
│     │     ├─ content.json
│     │     └─ readings
│     │        ├─ Reading1.md
│     │        ├─ Reading10.md
│     │        ├─ Reading11.md
│     │        ├─ Reading2.md
│     │        ├─ Reading3.md
│     │        ├─ Reading4.md
│     │        ├─ Reading5.md
│     │        ├─ Reading6.md
│     │        ├─ Reading7.md
│     │        ├─ Reading8.md
│     │        └─ Reading9.md
│     ├─ ssh_inception
│     │  ├─ AnonFTP.tf.json
│     │  ├─ FifthStop.tf.json
│     │  ├─ FirstStop.tf.json
│     │  ├─ FourthStop.tf.json
│     │  ├─ SatansPalace.tf.json
│     │  ├─ SecondStop.tf.json
│     │  ├─ ThirdStop.tf.json
│     │  ├─ adjust_motd
│     │  ├─ authorize_rsa
│     │  ├─ base64_msg
│     │  ├─ block_third_stop
│     │  ├─ decrypt_script
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ id_rsa
│     │  ├─ install
│     │  ├─ make_maze
│     │  ├─ milestones.txt
│     │  ├─ motd_fifth
│     │  ├─ motd_first
│     │  ├─ motd_fourth
│     │  ├─ motd_nat
│     │  ├─ motd_second
│     │  ├─ motd_third
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ place_rsa
│     │  ├─ questions.yml
│     │  ├─ reset_pass_fifth
│     │  ├─ reset_pass_fourth
│     │  ├─ satans_palace_setup
│     │  ├─ ssh_inception.json
│     │  ├─ ssh_inception.yml
│     │  ├─ ssh_port_123
│     │  ├─ ssh_port_666
│     │  └─ student_view
│     │     ├─ content.json
│     │     └─ readings
│     │        ├─ Reading1.md
│     │        ├─ Reading10.md
│     │        ├─ Reading11.md
│     │        ├─ Reading2.md
│     │        ├─ Reading3.md
│     │        ├─ Reading4.md
│     │        ├─ Reading5.md
│     │        ├─ Reading6.md
│     │        ├─ Reading7.md
│     │        ├─ Reading8.md
│     │        └─ Reading9.md
│     ├─ strace
│     │  ├─ README
│     │  ├─ cat
│     │  ├─ files
│     │  │  ├─ copy.c
│     │  │  ├─ empty.c
│     │  │  ├─ foo.txt
│     │  │  ├─ hello.c
│     │  │  ├─ mystery.c
│     │  │  ├─ script.sh
│     │  │  ├─ strace-identify
│     │  │  └─ tiger.txt
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ install
│     │  ├─ milestones.txt
│     │  ├─ motd_nat
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  ├─ strace.json
│     │  ├─ strace.yml
│     │  └─ student_view
│     │     ├─ content.json
│     │     └─ readings
│     │        ├─ Reading1.md
│     │        ├─ Reading10.md
│     │        ├─ Reading11.md
│     │        ├─ Reading2.md
│     │        ├─ Reading3.md
│     │        ├─ Reading4.md
│     │        ├─ Reading5.md
│     │        ├─ Reading6.md
│     │        ├─ Reading7.md
│     │        ├─ Reading8.md
│     │        └─ Reading9.md
│     ├─ total_recon
│     │  ├─ ControlRoom.tf.json
│     │  ├─ EarthSpaceport.tf.json
│     │  ├─ LastResort.tf.json
│     │  ├─ MarsSpaceport.tf.json
│     │  ├─ Rekall.tf.json
│     │  ├─ ResistanceBase.tf.json
│     │  ├─ Subway.tf.json
│     │  ├─ Venusville.tf.json
│     │  ├─ adjust_motd
│     │  ├─ block_http
│     │  ├─ block_ping
│     │  ├─ check_reactors
│     │  ├─ control_fake_ports
│     │  ├─ control_script
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ milestones.txt
│     │  ├─ motd_base
│     │  ├─ motd_control
│     │  ├─ motd_earth
│     │  ├─ motd_home
│     │  ├─ motd_mars
│     │  ├─ motd_rekall
│     │  ├─ motd_resort
│     │  ├─ motd_subway
│     │  ├─ motd_venus
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ nmap_to_sudoers
│     │  ├─ only_base
│     │  ├─ only_venusville
│     │  ├─ questions.yml
│     │  ├─ reactor_control
│     │  ├─ ssh_port_123
│     │  ├─ ssh_port_1938
│     │  ├─ ssh_port_2345
│     │  ├─ ssh_port_444
│     │  ├─ ssh_port_632
│     │  ├─ ssh_port_666
│     │  ├─ start_apache
│     │  ├─ student_view
│     │  │  ├─ content.json
│     │  │  └─ readings
│     │  │     ├─ Reading1.md
│     │  │     ├─ Reading10.md
│     │  │     ├─ Reading11.md
│     │  │     ├─ Reading2.md
│     │  │     ├─ Reading3.md
│     │  │     ├─ Reading4.md
│     │  │     ├─ Reading5.md
│     │  │     ├─ Reading6.md
│     │  │     ├─ Reading7.md
│     │  │     ├─ Reading8.md
│     │  │     └─ Reading9.md
│     │  ├─ total_recon.json
│     │  └─ total_recon.yml
│     ├─ treasure_hunt
│     │  ├─ README.md
│     │  ├─ gateway.tf.json
│     │  ├─ guide.md
│     │  ├─ install
│     │  ├─ milestones.txt
│     │  ├─ motd_nat
│     │  ├─ nat.tf.json
│     │  ├─ network.tf.json
│     │  ├─ questions.yml
│     │  ├─ resetFakeUsers.c
│     │  ├─ resetUsers
│     │  ├─ student_view
│     │  │  ├─ content.json
│     │  │  └─ readings
│     │  │     ├─ Reading1.md
│     │  │     ├─ Reading10.md
│     │  │     ├─ Reading11.md
│     │  │     ├─ Reading2.md
│     │  │     ├─ Reading3.md
│     │  │     ├─ Reading4.md
│     │  │     ├─ Reading5.md
│     │  │     ├─ Reading6.md
│     │  │     ├─ Reading7.md
│     │  │     ├─ Reading8.md
│     │  │     └─ Reading9.md
│     │  ├─ treasure-hunt-users-fall12.tar
│     │  ├─ treasure_hunt.json
│     │  └─ treasure_hunt.yml
│     └─ web_fu
│        ├─ assets
│        │  ├─ app.php
│        │  ├─ auth.php
│        │  ├─ db.php
│        │  ├─ levels
│        │  │  ├─ SQL-1.php
│        │  │  ├─ SQL-2.php
│        │  │  ├─ SQL-3.php
│        │  │  ├─ XSS-reflected-1.php
│        │  │  ├─ XSS-reflected-2.php
│        │  │  ├─ XSS-stored-1.php
│        │  │  └─ res
│        │  │     └─ profile.png
│        │  ├─ logging.php
│        │  ├─ res
│        │  │  ├─ books.csv
│        │  │  ├─ countries.csv
│        │  │  ├─ movies.csv
│        │  │  └─ users.csv
│        │  └─ views
│        │     ├─ SQL-1.php
│        │     ├─ SQL-2.php
│        │     ├─ SQL-3.php
│        │     ├─ body.php
│        │     ├─ header.php
│        │     └─ main.php
│        ├─ gateway.tf.json
│        ├─ guide.md
│        ├─ nat.tf.json
│        ├─ network.tf.json
│        ├─ questions.yml
│        ├─ setup.sh
│        ├─ student_view
│        │  ├─ content.json
│        │  └─ readings
│        │     ├─ Reading1.md
│        │     ├─ Reading10.md
│        │     ├─ Reading11.md
│        │     ├─ Reading2.md
│        │     ├─ Reading3.md
│        │     ├─ Reading4.md
│        │     ├─ Reading5.md
│        │     ├─ Reading6.md
│        │     ├─ Reading7.md
│        │     ├─ Reading8.md
│        │     └─ Reading9.md
│        ├─ web_fu.json
│        └─ web_fu.yml
├─ setup.cfg
├─ shell_scripts
│  ├─ auto_pipenv.sh
│  ├─ scenario_movekeys
│  └─ supervisord_entrypoint.sh
├─ supDock.py
├─ supervisord.conf
├─ supervisord_programs
│  └─ gunicorn.conf
├─ tests
│  ├─ __init__.py
│  ├─ conftest.py
│  ├─ factories.py
│  ├─ settings.py
│  ├─ test-container.py
│  ├─ test_api.py
│  ├─ test_celery.py
│  ├─ test_forms.py
│  ├─ test_functional.py
│  └─ test_models.py
├─ update.sh
├─ venv
│  └─ pyvenv.cfg
├─ webpack.config.js
├─ webssh-install.sh
└─ webssh2
```
