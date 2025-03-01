#!/bin/bash

# Script to generate a custom JSX component with colors and nice formatting
# and properly handle the export statement

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Clear screen for better presentation
clear

# Print header
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}║                Scenario Catalog Injector               ║${RESET}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════╝${RESET}"
echo

target_file="../../react/modules/shells/scenarioType_shells.js"
env_file="../../.env"

# Prompt for class name (default: Custom)
echo -e "${CYAN}${BOLD}► Scenario Name${RESET}"
echo -e "${YELLOW}  This will be used for both the Scenario name and scenario type${RESET}"
echo -e "${YELLOW}  It should also be the same as the name of the directory generated by new_scenario.sh in this current directory."
read -p "  Enter name: " class_name
class_name=${class_name:-Custom}
class_name=$(echo $class_name| tr '[:upper:]' '[:lower:]')
echo

# Prompt for keywords (comma-separated)
echo -e "${CYAN}${BOLD}► Keywords${RESET}"
echo -e "${YELLOW}  Enter as comma-separated values${RESET}"
read -p "  Enter keywords that apply to your scenario (default: Command Line,Security): " keywords_input
keywords_input=${keywords_input:-Command Line,Security}
echo

# Convert comma-separated keywords to array format
IFS=',' read -ra keyword_array <<< "$keywords_input"
keywords_formatted="["
for keyword in "${keyword_array[@]}"; do
    # Trim whitespace and add quotes
    keyword=$(echo "$keyword" | xargs)
    keywords_formatted+="\"$keyword\","
done
keywords_formatted=${keywords_formatted%,}  # Remove trailing comma
keywords_formatted+="]"

# Prompt for short description
echo -e "${CYAN}${BOLD}► Short Description${RESET}"
echo -e "${YELLOW}  A brief summary of the scenario (one sentence)${RESET}"
read -p "  Enter short description: " description_short
description_short=${description_short:-"blurb needed for $class_name"}
echo

# Prompt for long description
echo -e "${CYAN}${BOLD}► Long Description${RESET}"
echo -e "${YELLOW}  A detailed explanation of the scenario - perhaps some of your learning objectives${RESET}"
read -p "  Enter long description: " description_long
description_long=${description_long:-"this is where the longer description goes"}
echo

# Create the JSX class content
jsx_class="class ${class_name}_shell {
    constructor(input = {}) {
        this.keywords = $keywords_formatted;
        this.icon = maze;
        this.scenario_type = \"$class_name\";
        this.description_short = \"$description_short\",
        this.description_long = \"$description_long\";
        this.resources = [ resData.ssh ];
    };
};"

# Create a temporary file
temp_file=$(mktemp)

# Find the export statement and insert our class before it
export_found=false
while IFS= read -r line; do
    if [[ $line == *"export const scenarioShells"* ]]; then
        # Add our class before the export statement
        echo "$jsx_class" >> "$temp_file"
        echo "" >> "$temp_file"
        export_found=true
    fi
    
    # Write the current line to the temp file
    echo "$line" >> "$temp_file"
    
    # If this is the export statement line, add our entry to the object
    if [[ $export_found == true && $line == *"export const scenarioShells = {"* ]]; then
        # Add our entry as the first item in the object
        echo "    $class_name:             new ${class_name}_shell," >> "$temp_file"
    fi
done < "$target_file"

# If export statement wasn't found, append both class and export
if [[ $export_found == false ]]; then
    echo -e "${RED}Error: Export statement not found in the file.${RESET}"
    rm "$temp_file"
    exit 1
fi

# Backup the original file
cp "$target_file" "${target_file}.bak"

# Replace the original file with our modified version
mv "$temp_file" "$target_file"

cp -r "./construction/$class_name" "../prod/$class_name"
sed -i 's/\(SCENARIO_LIST_ENV=.*\)"Web_Fu"\(.*\)$/\1"Web_Fu","'"$class_name"'"\2/' "$env_file"
npm run build

# Print success message
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║                Catalog Update Complete                 ║${RESET}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════╝${RESET}"
echo
echo -e "${PURPLE}File updated:${RESET} ${BOLD}$target_file${RESET}"
echo -e "${YELLOW}A backup was created at:${RESET} ${target_file}.bak"
echo
echo -e "${CYAN}${BOLD}Added Class:${RESET}"
echo -e "${YELLOW}────────────────────────────────────────────────────────${RESET}"
echo -e "${GREEN}$jsx_class${RESET}"
echo -e "${YELLOW}────────────────────────────────────────────────────────${RESET}"
echo
echo -e "${CYAN}${BOLD}Added to Export:${RESET}"
echo -e "${GREEN}    $class_name:             new ${class_name}_shell,${RESET}"
echo

