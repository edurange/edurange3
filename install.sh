#!/bin/bash

GRN='\033[0;32m'
YLW='\033[1;33m'
NC='\033[0m'
username=$(whoami)
current_directory=$(pwd)
dbpass="passwordfoo"
dbname="namefoo"
flaskUser="Administrator"
flaskPass="flaskpass"
secretKey="not-so-secret"
hostAddress="localhost"
rootPass="change-me"
curDir=$(pwd)


# Add pip-executables to the path if they aren't already
grep -qxF 'export PATH=$PATH:/Users/$(whoami)/.local/bin' ~/.bash_profile || echo 'export PATH=$PATH:/Users/$(whoami)/.local/bin' >> ~/.bash_profile
source ~/.bash_profile

echo -e "${GRN}Installing python, npm, redis-server, unzip, postgresql, lib-pq-dev, and nginx${NC}"

brew update

brew install python3 npm, redis unzip pkg-config krb5 postgresql libpq nginx certbot

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
cd $curDir

python3 -m venv .venv
source .venv/bin/activate

pip3 install -r py_flask/config/requirements_prod.txt
pip3 uninstall --yes pyjwt
pip3 install pyjwt==2.8.0

nvm install 21
nvm use 21
npm install
cd $curDir/node
npm install
cd $curDir/react
npm install
cd $curDir
mkdir scenarios
mkdir scenarios/tmp
mkdir logs

echo -e "${YLW}\n\n##### The following set of prompts are for network configuration #####${NC}\n\n"
echo -e "We recommend using your LAN (local) IP for most purposes.\n
If you need the edurange server to be accessible outside your LAN, \n  use your WAN IP or a DNS hostname.\n
WAN IPs/DNS hostnames will expose your installation to the entire \n  Internet and may require additional network configuration.\n
Use at your own risk; we offer limited support for external \n  configurations. \n"

echo -e "${GRN}Please select one of the following options for networking configuration:${NC}"
echo -e "  (1) Use your internal ip address (Recommended for Developer Instances)"
echo -e "  (2) Use your public extern ip address (Advanced)"
echo -e "  (3) Enter your public domain name (For production installations)"

# Gather potential IP/Address Options:

#wlo1=$(ifconfig wlo1 | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '{print $2}')
#eth0=$(ifconfig eth0 | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '{print $2}')
#enp1s0=$(ifconfig enp1s0 | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '{print $2}')
#wlan0=$(ifconfig wlan0 | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '{print $2}')

all=$(ifconfig | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '{print $2}')

#echo "($all)"
#echo "($wlo1)"
#echo "($enp1s0)"
#echo "($eth0)"
#echo "($wlan0)"

sudo mkdir /Library/Logs/nginx/

sudo touch /Library/Logs/nginx/access.log
sudo touch /Library/Logs/nginx/error.log

sudo cp ./docs/nginx.conf.example /opt/homebrew/etc/nginx/nginx.conf

hostAddress=''

#DEV_FIX Regex this
promptnumber=0

external_ip=$(dig @resolver4.opendns.com myip.opendns.com +short)

echo "$hostAddress"

while [ -z "$hostAddress" ]
do 
  #echo "READING PROMPT NUM"
  read promptnumber

  if [ $promptnumber -eq 1 ]; then
    #echo -e "Your ip is one of these \n$all"
    option1=$(echo "$all" | sed "1p;d")
    option2=$(echo "$all" | sed "2p;d")
    echo "  Please select one of the following Local IP Addresses we detected:"
    echo "  (1) $option1"
    echo "  (2) $option2"

    while [ -z "$hostAddress" ]
    do
      read optnumber
      if [ $optnumber -eq 1 ]; then
        hostAddress="$option1"
      elif [ $optnumber -eq 2 ]; then
        hostAddress="$option2"
      fi
    done
    
    localDomain=''
    while [ -z "$localDomain" ]
    do
      echo " Please enter the domain you would like to use for your local installation (Ex: edurange.dev)"
    	read domainSelection
     	localDomain="$domainSelection"
    done

    sudo echo "$hostAddress $localDomain" | sudo cat - /etc/hosts > tmp && sudo mv tmp /etc/hosts
    
    brew install mkcert
    brew install nss
    mkcert -install
    mkcert $localDomain localhost $hostAddress
    
    localCert=$(find ~+ -maxdepth 1 -name "$localDomain*" | grep -v key)
    localKey=$(find ~+ -maxdepth 1 -name "$localDomain*" | grep key)

    sudo cp ./docs/nginx.conf.example /opt/homebrew/etc/nginx/nginx.conf
    sudo sed -i "" "s|listen 80;|listen 443 ssl;\n    ssl_certificate $localCert;\n    ssl_certificate_key $localKey;|g" /opt/homebrew/etc/nginx/nginx.conf
    cat ./docs/nginx.port80Redirect.snippet | sudo tee -a /opt/homebrew/etc/nginx/nginx.conf
    sudo sed -i "" "s/DOMAIN_TO_BE_REPLACED/${localDomain}/g" /opt/homebrew/etc/nginx/nginx.conf
    sudo nginx -s reload
    
  elif [ $promptnumber -eq 2 ]; then
    #echo $external_ip
    hostAddress="$external_ip"
    #echo "$hostAddress CHANGED"
  
  elif [ $promptnumber -eq 3 ]; then
    # TODO certbot cannot be used for generation here, because the site must be running
    # If certs are pre-existing, we can do the nginx config replacement for the user, but that's about it
    #
    echo "Once installation is complete, you will need to adjust your own nginx configs, see docs for help"
    sudo cp ./docs/nginx.site.prod.example /opt/homebrew/etc/nginx/nginx.conf
    echo "Enter domain name: "
    read hostAddress
  fi
done


if [ $# -eq 0 ];
then
	echo -e "${YLW}Please enter your database password:${NC}"
	read dbpass
	echo -e "${YLW}Please enter your database name ALL LOWERCASE:${NC}"
	read dbname
	echo -e "${YLW}Please enter your Flask (web interface) username NO SYMBOLS:${NC}"
	read flaskUser
	echo -e "${YLW}Please enter your Flask (web interface) password:${NC}"
	read flaskPass
	echo -e "${YLW}Please enter your root password for all containers:${NC}"
	read rootPass
	# Generate secret string for cookie encryption
  # TODO: Replace JWT_SECRET_KEY as well
	secretKey=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-20} | head -n 1)
  secretKeyJWT=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-20} | head -n 1)
	cp ./.env.example ./.env
  sed -i '' -e "s/DBNAME_REPLACEME/${dbname}/g" \
          -e "s/DIFFERENT_SECRETKEY/${secretKeyJWT}/" \
          -e "s/DB_PASS_REPLACEME/${dbpass}/" \
          -e "s/someUser/${flaskUser}/" \
          -e "s/somePass/${flaskPass}/" \
          -e "s/YOURSECRETKEY/${secretKey}/" \
          -e "s/YOUR_URL_HERE/${hostAddress}/" \
          -e "s/someRootPass/${rootPass}/" .env

# NOTE: This was for vagrant installations, investigate removing  
elif [ $1 = "auto" ];
then
	cp ./.env.example ./.env
fi

echo -e "${GRN}Downloading and setting up terraform${NC}"

# Updated Terraform to newest release June 4 2022
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Check to see if docker is already installed. If it is, skip this.
if ! [ -x "$(command -v docker)" ];
then
	echo -e "${GRN}Downloading and setting up docker${NC}"
	curl -O https://desktop.docker.com/mac/main/amd64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-amd64&_gl=1*1gt6gz7*_ga*MTMwMTA0OTAyMy4xNzE5NTExMTMx*_ga_XJWPQMJYHQ*MTcxOTUxMTEzMS4xLjEuMTcxOTUxMzMxMS42MC4wLjA.
  sudo hdiutil attach Docker.dmg
  sudo /Volumes/Docker/Docker.app/Contents/MacOS/install
  sudo hdiutil detach /Volumes/Docker

else
	echo "Docker already installed. Skipping Docker installation."
fi

mkdir ~/postgres_data
initdb ~/postgres_data
pg_ctl -D ~/postgres_data   
createuser postgres

# Start PostgreSQL service
brew services start postgresql

# Initialize psql 
sudo -Hiu postgres psql -U postgres -c "alter user postgres with password '"$dbpass"';"
sudo -Hiu postgres psql -U postgres -c "CREATE DATABASE $dbname ;"


# Fix the script dumping us to a different directory after installation
cd $current_directory
# npm run build # DEV_FIX build will be done w/ vite (not webpack) but disabled for now

# Clean up
rm ./Docker.dmg

echo -e "${GRN}To run the app any time, use: ${NC} npm start"
echo -e "${GRN}You may need to make sure that pip-executables are accessible${NC}"
echo -e "${GRN}If the ${NC} flask ${GRN} or ${NC} celery ${GRN} commands are not recognized, try:"
echo -e "${NC}source ~/.bash_profile ${GRN} or ${NC} export PATH=/home/$username/.local/bin:\$PATH ${NC}"
echo -e "${GRN}Before starting remember to run: ${NC}source .venv/bin/activate"
echo -e "${GRN}Before starting remember to run: ${NC}pg_ctl -D ~/postgres_data start"
echo -e "${GRN}Before closing remember to run: ${NC}brew services stop postgresql"

sudo su $USER --login
cd $curDir
