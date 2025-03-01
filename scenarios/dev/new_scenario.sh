#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Function to print section headers
print_header() {
    echo -e "\n${BOLD}${BLUE}===== $1 =====${RESET}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${RESET}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${RESET}"
}

# Function to print info messages
print_info() {
    echo -e "${CYAN}ℹ $1${RESET}"
}

# Function to print prompts
print_prompt() {
    echo -e "${YELLOW}$1${RESET}"
}

# Function to replace strings in a file
replace_string() {
    local file="$1"
    local search="$2"
    local replace="$3"
    
    python3 -c '
import sys

file_path = sys.argv[1]
search_string = sys.argv[2]
replace_string = sys.argv[3]

try:
    with open(file_path, "r") as f:
        content = f.read()
    
    content = content.replace(search_string, replace_string)
    
    with open(file_path, "w") as f:
        f.write(content)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
    ' "$file" "$search" "$replace"
}

# Function to extract the third octet from CIDR notation
extract_third_octet() {
    local cidr="$1"
    # Extract the IP part before the slash
    local ip=$(echo "$cidr" | cut -d'/' -f1)
    # Extract the third octet
    local third_octet=$(echo "$ip" | cut -d'.' -f3)
    echo "$third_octet"
}

extract_fourth_octet() {
    local cidr="$1"
    # Extract the IP part before the slash
    local ip=$(echo "$cidr" | cut -d'/' -f1)
    # Extract the third octet
    local fourth_octet=$(echo "$ip" | cut -d'.' -f4)
    echo "$fourth_octet"
}

extract_cidr_size() {
    local cidr="$1"
    # Extract the IP part after the slash
    local size=$(echo "$cidr" | cut -d'/' -f2)
    echo "$size"
}
# Clear the screen
clear

# Print welcome banner
echo -e "${BOLD}${MAGENTA}"
echo "  ____                            _         ____                _             "
echo " / ___|  ___ ___ _ __   __ _ _ __(_) ___   / ___|_ __ ___  __ _| |_ ___  _ __ "
echo " \___ \ / __/ _ \ '_ \ / _\` | '__| |/ _ \ | |   | '__/ _ \/ _\` | __/ _ \| '__|"
echo "  ___) | (_|  __/ | | | (_| | |  | | (_) || |___| | |  __/ (_| | || (_) | |   "
echo " |____/ \___\___|_| |_|\__,_|_|  |_|\___/  \____|_|  \___|\__,_|\__\___/|_|   "
echo -e "${RESET}\n"

print_header "Scenario Creation Tool"

# Prompt for scenario name
print_prompt "Enter the name for your new scenario:"
read scenario_name

scenario_name=$(echo $scenario_name | tr '[:upper:]' '[:lower:]')
working_folder="./construction/$scenario_name"

# Validate scenario name (no spaces, special characters limited)
if [[ ! "$scenario_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    print_error "Scenario name can only contain letters, numbers, underscores, and hyphens."
    exit 1
fi

# Create main directory
print_info "Creating scenario directory: $scenario_name"
mkdir -p "$working_folder"

if [ ! -d "$working_folder" ]; then
    print_error "Failed to create scenario directory."
    exit 1
fi

# Create subdirectories
print_info "Creating subdirectories..."
mkdir -p "$working_folder/network"

mkdir -p "$working_folder/container"

# Network configuration
print_header "Network Configuration"
print_prompt "How many networks would you like to create? [1]:"
read network_count
network_count=${network_count:-1}

# Validate network count is a number
if ! [[ "$network_count" =~ ^[0-9]+$ ]]; then
    print_error "Please enter a valid number."
    exit 1
fi

# Initialize network configuration file
network_file="$working_folder/network/network_template.json"
echo '{' > "$network_file"
echo '  "resource": [' >> "$network_file"

# Arrays to store network information
declare -a network_names
declare -a network_cidrs
declare -a network_third_octets

# Loop for each network
for (( i=1; i<=$network_count; i++ )); do
  echo -e "\n${CYAN}Network $i of $network_count:${RESET}"

  # Get network name
  print_prompt "Enter a name for this network:"
  read network_name

  # Validate network name
  if [[ ! "$network_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    print_error "Network name can only contain letters, numbers, underscores, and hyphens."
    print_info "Using default name: network$i"
    network_name="network$i"
  fi

  # Get CIDR notation
  print_prompt "Enter CIDR notation for this network (e.g., 10.0.0.0/24) NOTE 10.*.1.0/27 is reserved:"
  read network_cidr

  # Validate CIDR notation (basic validation)
  if ! [[ "$network_cidr" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/[0-9]+$ ]]; then
    print_error "Invalid CIDR notation. Using default: 10.0.0.0/24"
    network_cidr="10.0.0.0/24"
  fi

  # Extract third octet
  third_octet=$(extract_third_octet "$network_cidr")
  fourth_octet=$(extract_fourth_octet "$network_cidr")
  cidr_size=$(extract_cidr_size "$network_cidr")

  # Store network information
  network_names[$i]="$network_name"
  network_cidrs[$i]="$network_cidr"
  network_third_octets[$i]="$third_octet"

  # Add network configuration to file
  if [ $i -gt 1 ]; then
    echo '  },' >> "$network_file"
    echo '  ]' >> "$network_file"
    echo '  },' >> "$network_file"
  fi

  echo '    {' >> "$network_file"
  echo '      "docker_network": [' >> "$network_file"
  echo '        {' >> "$network_file"
  echo '          "'SNAME_${network_name}'": [' >> "$network_file"
  echo '            {' >> "$network_file"
  echo '              "driver": "bridge",' >> "$network_file"
  echo '              "internal": "true",' >> "$network_file"
  echo '              "ipam_config": [' >> "$network_file"
  echo '              {' >> "$network_file"
  echo '                "subnet": "'10.OCTET.$third_octet.$fourth_octet/$cidr_size'"' >> "$network_file"
  echo '              }' >> "$network_file"
  echo '              ],' >> "$network_file"
  echo '              "name": "'SNAME_${network_name}'"' >> "$network_file"
  echo '            }' >> "$network_file"
  echo '          ]' >> "$network_file"
  echo '        }'  >> "$network_file"
  echo '      ]' >> "$network_file"
  echo '    },' >> "$network_file"

  print_success "Network $network_name created with CIDR $network_cidr (Third octet: $third_octet)"
done

  echo '    {' >> "$network_file"
  echo '      "docker_network": [' >> "$network_file"
  echo '        {' >> "$network_file"
  echo '          "'SNAME_NAT'": [' >> "$network_file"
  echo '            {' >> "$network_file"
  echo '              "driver": "bridge",' >> "$network_file"
  echo '              "internal": "false",' >> "$network_file"
  echo '              "ipam_config": [' >> "$network_file"
  echo '              {' >> "$network_file"
  echo '                "subnet": "'10.OCTET.1.0/27'"' >> "$network_file"
  echo '              }' >> "$network_file"
  echo '              ],' >> "$network_file"
  echo '              "name": "'SNAME_NAT'"' >> "$network_file"
  echo '            }' >> "$network_file"
  echo '          ]' >> "$network_file"
  echo '        }'  >> "$network_file"
  echo '      ]' >> "$network_file"
  echo '    }' >> "$network_file"

# Close the network configuration file
echo '  ]' >> "$network_file"
echo '}' >> "$network_file"

# Container configuration
print_header "Container Configuration"
print_prompt "How many containers would you like to create? [1]:"
read container_count
container_count=${container_count:-1}

# Validate container count is a number
if ! [[ "$container_count" =~ ^[0-9]+$ ]]; then
    print_error "Please enter a valid number."
    exit 1
fi

# Template file path
template_file="./template_files/container/container_template.tf.json"

# Check if template exists
if [ ! -f "$template_file" ]; then
    print_error "Template file not found at $template_file"
    print_error "Please ensure the template file exists."
    exit 1
fi

# Initialize scenario JSON file
scenario_json="$working_folder/$scenario_name.json"
echo '{' > "$scenario_json"
echo '  "containers": [' >> "$scenario_json"

# Array to store container names
declare -a container_names

# Loop for each container
for (( i=1; i<=$container_count; i++ )); do
    echo -e "\n${CYAN}Container $i of $container_count:${RESET}"
    
    if [ "$i" -eq "1" ]; then
      print_prompt "By convention, the first container of a scenario will be named StartingLine"
      container_name="StartingLine"
    else
      print_prompt "Enter a name for this container:"
      read container_name
    fi

    # Validate container name
    if [[ ! "$container_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        print_error "Container name can only contain letters, numbers, underscores, and hyphens."
        print_error "Skipping this container."
        continue
    fi
    
    # Store container name
    container_names[$i]="$container_name"
    
    # Display available networks
    echo -e "${CYAN}Available networks:${RESET}"
    for (( j=1; j<=$network_count; j++ )); do
        echo -e "  ${BOLD}$j.${RESET} ${network_names[$j]} (CIDR: ${network_cidrs[$j]})"
    done
    
    # Ask which network to attach to
    print_prompt "Which network should this container be attached to? (1-$network_count):"
    read network_choice
    
    # Validate network choice
    if ! [[ "$network_choice" =~ ^[0-9]+$ ]] || [ "$network_choice" -lt 1 ] || [ "$network_choice" -gt "$network_count" ]; then
        print_error "Invalid network choice. Defaulting to network 1."
        network_choice=1
    fi
    
    # Get the selected network's information
    selected_network="${network_names[$network_choice]}"
    selected_third_octet="${network_third_octets[$network_choice]}"
    
    # Ask for the fourth octet
    print_prompt "Enter the fourth octet for this container's IP address (1-254) NOTE 4 is reserved:"
    read fourth_octet
    
    # Validate fourth octet
    if ! [[ "$fourth_octet" =~ ^[0-9]+$ ]] || [ "$fourth_octet" -lt 1 ] || [ "$fourth_octet" -gt 254 ]; then
        print_error "Invalid fourth octet. Using default value of $((i+10))."
        fourth_octet=$((i+10))
    fi
    
    # Copy template to destination
    container_file="$working_folder/container/$container_name.tf.json"
    cp "$template_file" "$container_file"
    
    if [ ! -f "$container_file" ]; then
        print_error "Failed to copy template for $container_name."
        continue
    fi
    
    # Replace placeholders
    print_info "Configuring container $container_name on network $selected_network..."
    replace_string "$container_file" "|cName|" "$container_name"
    replace_string "$container_file" "THIRD_OCT" "$selected_third_octet"
    replace_string "$container_file" "FOURTH_OCT" "$fourth_octet"
    replace_string "$container_file" "SNAME_PLAYER" "SNAME_${selected_network}"
    
    # Add container to scenario JSON - with proper comma handling
    if [ $i -gt 1 ]; then
        echo '    },' >> "$scenario_json"
    fi
    
    echo '    {' >> "$scenario_json"
    echo '      "name": "'$container_name'",' >> "$scenario_json"
    echo '      "files": [' >> "$scenario_json"
    echo '        {' >> "$scenario_json"
    echo '          "global_files": [' >> "$scenario_json"
    echo '          ],' >> "$scenario_json"
    echo '          "system_files": [' >> "$scenario_json"
    echo '            "install"' >> "$scenario_json"
    echo '          ],' >> "$scenario_json"
    echo '          "user_files": [' >> "$scenario_json"
    echo '            "milestones.txt"' >> "$scenario_json"
    echo '          ]' >> "$scenario_json"
    echo '        }' >> "$scenario_json"
    echo '      ]' >> "$scenario_json"
    echo '    },' >> "$scenario_json"
    
    
    print_success "Container $container_name created successfully on network $selected_network with IP ending in .$fourth_octet"
done

# Add the gateway TODO fit this into the above container loop?
echo '    {' >> "$scenario_json"
echo '      "name": "'gateway'",' >> "$scenario_json"
echo '      "files": [' >> "$scenario_json"
echo '        {' >> "$scenario_json"
echo '          "global_files": [' >> "$scenario_json"
echo '          ],' >> "$scenario_json"
echo '          "system_files": [' >> "$scenario_json"
echo '          ],' >> "$scenario_json"
echo '          "user_files": [' >> "$scenario_json"
echo '            "milestones.txt"' >> "$scenario_json"
echo '          ]' >> "$scenario_json"
echo '        }' >> "$scenario_json"
echo '      ]' >> "$scenario_json"
echo '    }' >> "$scenario_json"

# Close the scenario JSON file - fixed to properly close all containers in one array
echo '  ]' >> "$scenario_json"
echo '}' >> "$scenario_json"

# Copy and configure additional template files
print_header "Copying Additional Template Files"

# Template directory
template_dir="./template_files"

# Check if template directory exists
if [ ! -d "$template_dir" ]; then
    print_error "Template directory not found at $template_dir"
    print_error "Please ensure the template directory exists."
    exit 1
fi

# Copy guide.md
if [ -f "$template_dir/guide.md" ]; then
    cp "$template_dir/guide.md" "$working_folder/"
    print_info "Copied guide.md"
    replace_string "$working_folder/guide.md" "SCENARIO_NAME" "$scenario_name"
else
    print_error "Template guide.md not found"
fi

# Copy guide_content.yml
if [ -f "$template_dir/guide_content.yml" ]; then
    cp "$template_dir/guide_content.yml" "$working_folder/"
    print_info "Copied guide_content.yml"
    replace_string "$working_folder/guide_content.yml" "SCENARIO_NAME" "$scenario_name"
else
    print_error "Template guide_content.yml not found"
fi

# Copy questions.yml
if [ -f "$template_dir/questions.yml" ]; then
    cp "$template_dir/questions.yml" "$working_folder/"
    print_info "Copied questions.yml"
    replace_string "$working_folder/questions.yml" "SCENARIO_NAME" "$scenario_name"
else
    print_error "Template questions.yml not found"
fi

# Copy README
if [ -f "$template_dir/README" ]; then
    cp "$template_dir/README" "$working_folder/"
    print_info "Copied README"
    replace_string "$working_folder/README" "SCENARIO_NAME" "$scenario_name"
else
    print_error "Template README not found"
fi

# Copy and rename scenario.yml
if [ -f "$template_dir/scenario_name.yml" ]; then
    cp "$template_dir/scenario_name.yml" "$working_folder/$scenario_name.yml"
    print_info "Copied scenario_name.yml to $working_folder.yml"
    replace_string "$working_folder/$scenario_name.yml" "SCENARIO_NAME" "$scenario_name"
else
    print_error "Template scenario.yml not found"
fi

# Copy gateway container file
if [ -f "$template_dir/container/gateway.tf.json" ]; then
    cp "$template_dir/container/gateway.tf.json" "$working_folder/container/gateway.tf.json"
    print_info "Copied gateway terraform template"
else
    print_error "Template gateway.tf.json not found"
fi

# Copy remaining files TODO safety check like the others, they're blank right now though
cp "$template_dir/milestones.txt" "$working_folder/milestones.txt"
cp "$template_dir/install" "$working_folder/install"


# Copy over provider files
cp "$template_dir/container/main.tf.json" "$working_folder/container/main.tf.json"
cp "$template_dir/container/main.tf.json" "$working_folder/network/main.tf.json"

# Final gateway cleanup TODO put this closer to other container code
gateway_file="$working_folder/container/gateway.tf.json"
replace_string "$gateway_file" "THIRD_OCT" "$selected_third_octet"
replace_string "$gateway_file" "SNAME_PLAYER" "SNAME_${network_names[1]}"

print_header "Scenario Creation Complete"
echo -e "${GREEN}Scenario '${BOLD}$scenario_name${RESET}${GREEN}' has been created with:${RESET}"
echo -e "${CYAN}- $network_count network(s)${RESET}"
echo -e "${CYAN}- $container_count container(s)${RESET}"
echo -e "${CYAN}Location: ${BOLD}$(pwd)/$scenario_name${RESET}"
echo

echo -e "${BOLD}${BLUE}Files created:${RESET}"
echo -e "${YELLOW}- Network configuration:${RESET} $network_file"
echo -e "${YELLOW}- Scenario JSON:${RESET} $scenario_json"
echo -e "${YELLOW}- Container configurations:${RESET}"
for (( i=1; i<=$container_count; i++ )); do
    if [ -n "${container_names[$i]}" ]; then
        echo -e "  - $working_folder/container/${container_names[$i]}.tf.json"
    fi
done
echo

echo -e "${BOLD}${BLUE}Directory structure:${RESET}"
find "$working_folder" -type f | sort | while read file; do
    echo -e "${CYAN}$file${RESET}"
done

exit 0
