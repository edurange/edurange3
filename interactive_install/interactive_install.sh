#!/bin/bash

#GRN='\033[0;32m'
#YLW='\033[1;33m'
#NC='\033[0m'

#pass_pattern=^[!-/0-9:-@A-Z\[-\`a-z\{-~]{8,16}$
#db_name_pattern=^[a-z][a-z0-9]{7,15}$
#flask_name_pattern=^[a-zA-Z][a-zA-Z0-9]{3,19}$
#flask_pass_pattern=^[!-/0-9:-@A-Z\[-\`a-z\{-~]{6,40}$

# Placeholder default for when we want an invalid string that doesn't 
# match printables or empty patterns. See prompt_and_match as used in 
# the network code; failing_string is used in place of empty or 
# whitespace strings to allow prompt_and_match to detect the enter key. 
# If we use this code elsewhere, consider a design that is more 
# straightforward. I don't expect this implementation to age well.
#failing_string="\a"

source install_header.sh

prompt_and_match() {
	local __result=$1
	local __pattern=$2
	local __prompt=$3
	
	local __initial_value=$(eval echo \$$__result)
	local __user_input=$__initial_value
	
	until [[ $__user_input =~ $__pattern ]]
	do
		echo -e $__prompt
		read __user_input
	done
	
	eval $__result="'$__user_input'"
}

prompt_and_match_silent() {
	local __result=$1
	local __pattern=$2
	local __prompt=$3
	
	local __initial_value=$(eval echo \$$__result)
	local __user_input=$__initial_value
	
	until [[ $__user_input =~ $__pattern ]]
	do
		echo -e $__prompt
		read -s __user_input
	done
	
	eval $__result="'$__user_input'"
}

prompt_and_match dbpass $pass_pattern "${YLW}Database passwords may use any combination of letters, numbers and special characters. 8-16 characters in length.${NC}
${YLW}Please choose a password for the edurange database:${NC}"

prompt_and_match dbname $db_name_pattern "${YLW}Database names must alphanumeric, lower case only, with a letter as the first character. 8-16 characters in length. No whitespace or special characters, and it cannot begin with a numeral.${NC}
${YLW}Please choose a name string for the edurange database:${NC}"

prompt_and_match flaskUser $flask_name_pattern "${YLW}Flask user names must alphanumeric with a letter as the first character. 4-20 characters in length. No whitespace or special characters, and cannot begin with a numeral.${NC}
${YLW}Please choose a username for administrative access to the web interface (Flask):${NC}"

prompt_and_match flaskPass $flask_pass_pattern "${YLW}Flask passwords may use any combination of letters, numbers and special characters. 8-16 characters in length.${NC}
${YLW}Please choose a password for administrative access to the web interface (Flask):${NC}"

prompt_and_match rootPass $pass_pattern "${YLW}Container passwords may use any combination of letters, numbers and special characters. 8-16 characters in length.${NC}
${YLW}Please choose a root password for SSH and administrative access to docker containers:${NC}"


echo -e "${YLW}\n\n##### The following set of prompts are for network configuration #####${NC}\n\n"

hostAddress=''
until [ $hostAddress ]
do
	echo -e "\nWe recommend using your LAN (local) IP for most purposes.\n
If you need the edurange server to be accessible outside your LAN, \n  use your external WAN IP or a DNS hostname.\n
WAN IPs/DNS hostnames will expose your installation to the entire \n  Internet and may require additional network configuration. Use \n  at your own risk; we offer limited support for external \n  configurations. \n"

	promptnumber=''
	prompt_and_match promptnumber ^[1-3Qq]$ "Please select:\n
  (1) Use your local/internal (LAN) IP address (Recommended for general use)\n
  (2) Use your public/external (WAN) IP address (Advanced users only)\n
  (3) Manually enter domain name or IP (Advanced users only)\n
Use ^C to quit the installer without making changes."

	echo $promptnumber

	case $promptnumber in
		1)
			all_ips=$(/sbin/ip -4 -o addr show scope global | awk '{gsub(/\/.*/,"",$4); print $4}')
			option1=$(echo "$all_ips" | sed "1p;d")
			option2=$(echo "$all_ips" | sed "2p;d")
			if [ -z $all_ips ]
			then
				echo -e "\nFailed to automatically detect your network configuration. This is not a fatal error. Your environment may lack the configuration and profiling tools expected by our installer. We're working on expanding support in this regard. In the meantime, please refer to instructions specific to your operating system, network setup or service provider on how to obtain your internal IP. You can then enter it manually using option 3."
				enter_key=$failing_string
				prompt_and_match enter_key ^$ "Press enter to return to the previous menu. Alternatively, use ^C to quit the installer here."
			elif [ -z $option2 ]
			then
				echo -e "\nWe detected the following internal/LAN IP: $option1"
				lanoption=$failing_string
				prompt_and_match lanoption ^1?$ "Select this IP address as the host where edurange will be accessible?\n  (1) Use the internal/LAN IP $option1\nPress enter to return to the previous menu."
				if [ $lanoption == "1" ]
				then
					hostAddress=$option1
				fi
			else
				echo -e "\nWe detected the following internal/LAN IPs:"
				echo -e "  (1) $option1"
				echo -e "  (2) $option2"
				lanoption=$failing_string
				prompt_and_match lanoption ^[12]?$ "Select this internal IP address as the host where edurange will be accessible?\n  (1) Use the internal/LAN IP $option1\n  (2) Use the internal/LAN IP $option2\nPress enter to return to the previous menu."
				if [ $lanoption == "1" ]
				then
					hostAddress=$option1
				elif [ $lanoption == "2" ]
				then
					hostAddress=$option2
				fi
			fi
			;;
		2)
			external_ip=$(dig @resolver4.opendns.com myip.opendns.com +short)
			echo -e "\nWe detected the following external/WAN IP: $external_ip"
			echo -e "ATTENTION: Using an external IP address will expose your edurange installation to the entire internet. Only use this option if you truly need to allow remote connections from outside your local network and understand the consequences."
			wanoption=$failing_string
			prompt_and_match wanoption ^1?$ "Select this external IP address as the host where edurange will be accessible?\n  (1) Use the external/WAN IP $external_ip\nPress enter to return to the previous menu."
			if [ $wanoption == "1" ]
			then
				hostAddress=$external_ip
			fi
			;;
		3)
			echo -e "\nManually enter your hostname below. You can specify a local/LAN IP here if we coudln't automatically detect your network configuration."
			echo -e "ATTENTION: Using an external IP address or domain name will expose your edurange installation to the entire internet. Only use this option if you truly need to allow remote connections from outside your local network and understand the consequences."
			until [ $hostAddress ]
			do
				echo -e "Press enter to return to the previous menu."
				echo -e "Enter an IP or hostname:"
				read address_input
				if [[ $address_input =~ ^$ ]]
				then
					break
				fi
				echo -e "You entered: \"$address_input\". Is this correct? [Y/n]"
				read input_approved
				if [[ $input_approved =~ ^[yY] ]]
				then
					hostAddress=$address_input
				elif [[ $address_input =~ ^$ ]]
				then
					break
				fi
			done
			;;
	esac
done

echo -e "\nedurange install parameters collected as follows:"
echo -e "  \$dbpass: $dbpass"
echo -e "  \$dbname: $dbname"
echo -e "  \$flaskUser: $flaskUser"
echo -e "  \$flaskPass: $flaskPass"
echo -e "  \$rootPass: $rootPass"
echo -e "  \$hostAddress: $hostAddress"

edurange_install_parameters_provided="True"

# source install2.sh