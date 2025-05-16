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
rootPass="sup3rs3cr3t"
curDir=$(pwd)

# Add pip-executables to the path if they aren't already
grep -qxF 'export PATH=$PATH:/home/$(whoami)/.local/bin' ~/.bashrc || echo 'export PATH=$PATH:/home/$(whoami)/.local/bin' >> ~/.bashrc
source ~/.bashrc

echo -e "${GRN}Installing python3-pip, npm, redis-server,  unzip, postgresql, lib-pq-dev, and wget${NC}"

sudo apt update
# VOLATILE: CHECK NGINX INSTALL - CHECK CERTBOT TOO
sudo apt install -y curl python3-pip redis-server unzip wget postgresql libpq-dev nginx wget libnss3-tools certbot python3-certbot-nginx
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
cd $curDir

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

all=$(/sbin/ip -4 -o addr show scope global | awk '{gsub(/\/.*/,"",$4); print $4}')

sudo cp ./docs/nginx.conf.example /etc/nginx/nginx.conf

hostAddress=''

#DEV_FIX Regex this


external_ip=$(dig @resolver4.opendns.com myip.opendns.com +short)


localDomain='edurange.local'
hostAddress='127.0.0.1'
sudo echo "$hostAddress $localDomain" | sudo cat - /etc/hosts > tmp && sudo mv tmp /etc/hosts

wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64
sudo mv mkcert-v1.4.3-linux-amd64 /usr/bin/mkcert
sudo chmod +x /usr/bin/mkcert
mkcert -install
mkcert $localDomain localhost $hostAddress

localCert=$(find ~+ -maxdepth 1 -name "$localDomain*" | grep -v key)
localKey=$(find ~+ -maxdepth 1 -name "$localDomain*" | grep key)

sudo cp ./docs/nginx.site.self_signing.example /etc/nginx/sites-available/default
sudo sed -i "s|listen 80;|listen 443 ssl;\n    ssl_certificate $localCert;\n    ssl_certificate_key $localKey;|g" /etc/nginx/sites-available/default
cat ./docs/nginx.port80Redirect.snippet | sudo tee -a /etc/nginx/sites-available/default
sudo sed -i "s/DOMAIN_TO_BE_REPLACED/${localDomain}/g" /etc/nginx/sites-available/default

# Start and kill firefox so it automatically sets up its initial configuration
firefox &
sleep 3
pkill firefox
# Add the created certificate to your Firefox profile's database. Different browsers and differently set up machines will need different commands (this is for Ubuntu 22.04.4 and Firefox)
firefoxProfile=$(sudo grep -m 1 -Po '(?<=Path=).*' /$HOME/snap/firefox/common/.mozilla/firefox/profiles.ini)
sudo certutil -d sql:$HOME/snap/firefox/common/.mozilla/firefox/${firefoxProfile} -A -t "C,," -n "EDURange" -i $localCert

sudo service nginx reload

dbpass=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-20} | head -n 1)

# Generate secret string for cookie encryption
# TODO: Replace JWT_SECRET_KEY as well
secretKey=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-20} | head -n 1)
secretKeyJWT=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-20} | head -n 1)
cp ./.env.example ./.env
sed -i "s/DBNAME_REPLACEME/${dbname}/g" .env
sed -i "s/DIFFERENT_SECRETKEY/${secretKeyJWT}/" .env
sed -i "s/DB_PASS_REPLACEME/${dbpass}/" .env
sed -i "s/someUser/${flaskUser}/" .env
sed -i "s/somePass/${flaskPass}/" .env
sed -i "s/YOURSECRETKEY/${secretKey}/" .env
sed -i "s/YOUR_URL_HERE/${hostAddress}/" .env
sed -i "s/someRootPass/${rootPass}/" .env


echo -e "${GRN}Downloading and setting up terraform${NC}"

# Updated Terraform to newest release June 4 2022
wget https://releases.hashicorp.com/terraform/1.2.2/terraform_1.2.2_linux_amd64.zip
unzip terraform_1.2.2_linux_amd64.zip
sudo mv terraform /usr/bin/terraform

# Check to see if docker is already installed. If it is, skip this.
if ! [ -x "$(command -v docker)" ];
then
	echo -e "${GRN}Downloading and setting up docker${NC}"
	wget -O docker.sh get.docker.com
	chmod +x docker.sh
	
	echo -e "${GRN}Creating a user group for docker, and adding your account...${NC}"
	sudo groupadd docker
	sudo usermod -aG docker $username

	./docker.sh
else
	echo "Docker already installed. Skipping Docker installation."
fi

# Initialize psql 
sudo -Hiu postgres psql -U postgres -c "alter user postgres with password '"$dbpass"';"
sudo -Hiu postgres psql -U postgres -c "CREATE DATABASE $dbname ;"


# Fix the script dumping us to a different directory after installation
cd $current_directory
# npm run build # DEV_FIX build will be done w/ vite (not webpack) but disabled for now

# Clean up
rm ./terraform_1.2.2_linux_amd64.zip
rm ./docker.sh

echo -e "${GRN}To run the app any time, use: ${NC} npm start"
echo -e "${GRN}You may need to make sure that pip-executables are accessible${NC}"
echo -e "${GRN}If the ${NC} flask ${GRN} or ${NC} celery ${GRN} commands are not recognized, try:"
echo -e "${NC}source ~/.bashrc ${GRN} or ${NC} export PATH=/home/$username/.local/bin:\$PATH ${NC}"

sudo su $USER --login
cd $curDir
