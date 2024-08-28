import os
import shutil
import json
import logging

# def find_and_copy_template(s_type, c_name):
#     path = '../../../scenarios/prod/' + s_type
#     try:
#         shutil.copy(path + '/' + c_name + '.tf.json', c_name + '.tf.json')
#     except FileNotFoundError:
#         return "Template not found, or path error"

def find_and_copy_template(s_type, c_name):
    # Validate inputs
    if not isinstance(s_type, str) or not isinstance(c_name, str):
        return "Invalid input: s_type and c_name must be strings"

    # Define paths
    base_path = os.path.normpath(os.path.join('../../../scenarios/prod', s_type))
    source_file = os.path.join(base_path, 'container', c_name + '.tf.json')
    destination_file = os.path.join(os.getcwd(), c_name + '.tf.json')  # Save in the current working directory
    source_network_dir = os.path.join(base_path, 'network')
    destination_network_dir = os.path.join(os.getcwd(), 'network')  # Save the network directory in the current working directory

    try:
        # Copy the template file
        shutil.copy(source_file, destination_file)
        
        # Copy the network directory
        if os.path.isdir(source_network_dir):
            if os.path.isdir(destination_network_dir):
                # If the network directory already exists, remove it before copying
                shutil.rmtree(destination_network_dir)
            shutil.copytree(source_network_dir, destination_network_dir)
        else:
            return f"Network directory not found at {source_network_dir}"
        
        return f"Template {c_name}.tf.json and network directory copied successfully"
    
    except FileNotFoundError:
        return f"Template {c_name}.tf.json not found at {source_file}"
    except shutil.Error as e:
        return f"Error during copying: {str(e)}"
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"



def build_users(usernames, passwords):
    users = []
    for i, u in enumerate(usernames):
        next_line = ""
        if i != 0:
            next_line += "\""
        next_line += str("useradd --home-dir /home/" + u + " --create-home --shell /bin/bash --password $(echo " + \
                         str(passwords[i]) + " | openssl passwd -1 -stdin) " + u, )
        if i != len(usernames) - 1:
            next_line += "\","
        users.append(next_line)
    return users


def build_uploads(s_files, g_files, u_files, log_files, s_type):
    all_files = s_files + g_files + u_files
    uploads = ""
    for f in all_files:
        uploads += str("""
  "provisioner": [
    { 
    "file": [ 
      {
      "source"      : "${path.module}/../../../scenarios/prod/""" + s_type + "/" + f + '",'
                       + """
      "destination" : """ + '"/' + f + '"'
                       + """
      }
    ]
    }
  ],
""")
    for lf in log_files:
        uploads += str("""
  "provisioner": [
    { 
    "file": [ 
      {
      "source"      : "${path.module}/../../../scenarios/global_scripts/""" + lf + '",'
                       + """
      "destination" : """ + '"/' + lf + '"'
                       + """
      }
    ]
    }
  ],
""")
    return uploads


def build_execute_files(s_files, g_files, u_files, flags):
    execs = "mkdir /home/ubuntu\",\n"

    # Global files get 'chmod + x' and then moved to /usr/bin
    for i, f in enumerate(g_files):
        execs += str("\"chmod +x /" + f + '"' + """, 
        "mv /""" + f + " /usr/bin/" + f + '",\n')

    # User files marked 777 permission and moved to /home/ubuntu
    for i, f in enumerate(u_files):
        execs += str("""
      "chmod +rwx /""" + f + '"' + """,
      "cp -R /""" + f + " /home/ubuntu/" + f + '"' + """,
""")
    # System files chmod+x, move to /home/ubuntu, and then RUN
    for i, f in enumerate(s_files):
        execs += str("""
      "chmod +x /""" + f + '"' + """,
      "mv /""" + f + " /home/ubuntu/" + f + '"' + """,
      "/home/ubuntu/""" + f)
        if f == "install":
            execs += " " + str(" ".join(v for v in flags))
        if f == "change_root_pass":
            root_pass = os.getenv("ROOT_PASS", "root")
            execs += " " + str(root_pass)
        if i != len(s_files) - 1:
            execs += "\","
    return execs

def adjust_network(address, name, logger):
    try:
        # Read from the new template location
        with open('network/network_template.tf.json', 'r') as net:
            net_config = json.load(net)
    except FileNotFoundError:
        return "Network Template Not Found"

    # Replace the name and addresses in the template
    for i, r in enumerate(net_config['resource']):
        for s in r:
            for j, t in enumerate(net_config['resource'][i][s]):
                net_config['resource'][i][s][j] = eval(str(t).replace('SNAME', name).replace('OCTET', address))

    # Write the modified configuration directly to network.tf.json
    with open('network.tf.json', 'w') as f:
        json.dump(net_config, f, indent=4)

    return "Network configuration updated successfully"


def write_resource(address, name, s_type,
                   container_index, usernames, passwords,
                   s_files, g_files, u_files, flags, c_names):
    # Generate a list of strings of commands for adding users

    template_folder = "../../../scenarios/prod/" + s_type + "/"
    users = build_users(usernames, passwords)

    log_files = ["tty_setup", "analyze.py", "makeTsv.py",
                 "milestone-lbl.pl", "intervention.py", "start_ttylog.sh",
                 "ttylog", "clearlogs", "iamfrustrated",
                 "place_milestone_file", "change_root_pass", "cgconfig.conf",
                 "limit_resources", "gateway_setup"]

    global_scripts = ["cgconfig.conf", "limit_resources", "iamfrustrated", "change_root_pass"]
    # Generate a list of 'provisioner' blocks to upload all files
    if c_names[container_index] == "gateway":
        uploads = build_uploads(s_files, g_files, u_files, log_files, s_type)
        s_files = ["tty_setup", "place_milestone_file", "change_root_pass", "limit_resources","gateway_setup"] + s_files
        g_files = ["iamfrustrated", "clearlogs"] + g_files
        u_files = ["ttylog", "start_ttylog.sh", "makeTsv.py", "analyze.py",
               "milestone-lbl.pl", "intervention.py"] + u_files
    else:
        uploads = build_uploads(s_files, g_files, u_files, global_scripts, s_type)
        s_files = ["change_root_pass", "limit_resources"] + s_files
        g_files = ["iamfrustrated"] + g_files

    # Generate a list of commands to move files, and run them if needed
    execs = build_execute_files(s_files, g_files, u_files, flags)
    if c_names[container_index] == "gateway":
        host_names = '\\n'.join(name for name in c_names)
        execs += "\",\n\"echo '" + host_names.casefold() + "' > /usr/local/src/ttylog/host_names"

    host = os.getenv('HOST_EXTERN_ADDRESS', 'localhost')
    # Make sure the container has a known template
    try:
        tf = open(c_names[container_index] + '.tf.json', 'r+')
        config = json.load(tf)
    except FileNotFoundError:
        return "Template not found"


    # SNAME and OCTET appear in multiple places, so this 'for' loop is used to replace all occurrences of them.
    # To inspect the structure of the 'config', use 'flask shell', import json, and load the data as in the above 'try'
    for i, r in enumerate(config['resource']):
        for s in r:
            for j, t in enumerate(config['resource'][i][s]):
                config['resource'][i][s][j] = eval(str(t).replace('SNAME', name)
                                                   .replace('OCTET', address)
                                                   .replace('EXTERN_HOST', host))


    for i, l in enumerate(config['locals']):
        config['locals'][i] = eval(str(l).replace('SNAME', name).replace('EXTERN_HOST', host))

    for i, o in enumerate(config['output']):
        config['output'][i] = eval(str(o).replace('SNAME', name).replace('EXTERN_HOST', host))

    # Use a temporary file to hold the updated data
    with open('tmp.tf.json', 'w') as f:
        json.dump(config, f, indent=4)

    # Move the temporary file, replacing the template
    os.rename('tmp.tf.json', c_names[container_index] + '.tf.json')

    # Read our new file as raw text
    with open(c_names[container_index] + '.tf.json', 'r') as outfile:
        data = outfile.read()

    # Insert the list of commands that register students in the 'remote-exec' block
    data = data.replace('USERS', '\n'.join(users))

    # Find the first 'provisioner', insert more in the space prior to it for uploading files
    data = data[:data.index('provisioner') - 2] + uploads + data[data.index('provisioner') - 2:]

    # In the 'remote-exec' block, insert commands for moving and executing scenario files
    data = data.replace('EXECS', execs)

    print(data)

    with open(c_names[container_index] + '.tf.json', 'w') as outfile:
        outfile.write(data)
