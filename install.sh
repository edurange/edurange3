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
grep -qxF 'export PATH=$PATH:/home/$(whoami)/.local/bin' ~/.bashrc || echo 'export PATH=$PATH:/home/$(whoami)/.local/bin' >>~/.bashrc
source ~/.bashrc

echo -e "${GRN}Installing python3-pip, npm, redis-server,  unzip, postgresql, lib-pq-dev, and wget${NC}"

sudo apt update
# VOLATILE: CHECK NGINX INSTALL - CHECK CERTBOT TOO
sudo apt install -y python3-pip redis-server unzip wget postgresql libpq-dev nginx wget libnss3-tools certbot python3-certbot-nginx
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
cd $curDir

# eduhints is a git submodule; a ZIP download or a clone without --recurse
# leaves it empty and the app fails to import. Fetch it here.
echo -e "${GRN}Fetching git submodules (eduhints)...${NC}"
git submodule update --init --recursive || true

# ML (EDUHints) is required — install both requirement sets.
pip3 install -r requirements/prod_requirements.txt
pip3 install -r requirements/ml_requirements.txt

nvm install 22
nvm use 22
npm install
cd $curDir/node
npm install
cd $curDir/react
npm install
cd $curDir
mkdir scenarios
mkdir scenarios/tmp
mkdir logs

# >>> er3-network-config >>>
# How a new install is reached: one nginx site file (+ an /etc/hosts alias for a
# local name). nginx is touched sparingly -- we manage ONLY
# /etc/nginx/sites-available/edurange (+ its sites-enabled symlink), back up any
# previous copy, validate with `nginx -t` before reloading, and never overwrite
# /etc/nginx/nginx.conf or the distro's default site.

MKCERT_URL="https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64"

_er3_install_site() {   # $1 = prepared site file
  sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
  if [ -e /etc/nginx/sites-available/edurange ]; then
    sudo cp -a /etc/nginx/sites-available/edurange \
      "/etc/nginx/sites-available/edurange.bak.$(date +%s)"
  fi
  sudo cp "$1" /etc/nginx/sites-available/edurange
  sudo ln -sf /etc/nginx/sites-available/edurange /etc/nginx/sites-enabled/edurange
  if sudo nginx -t; then
    sudo service nginx reload
  else
    echo -e "${YLW}nginx config test failed; leaving nginx unchanged.${NC}"
  fi
}

echo -e "${YLW}\n##### Network configuration #####${NC}"
echo -e "  (1) A local name on this machine / LAN  [edurange.local]   (recommended)"
echo -e "  (2) A public domain name                 (production, Let's Encrypt)"

hostAddress=''
while [ -z "$hostAddress" ]; do
  read -r -p "Choose [1]: " mode
  mode=${mode:-1}
  case "$mode" in
    1)
      _ips=$(/sbin/ip -4 -o addr show scope global 2>/dev/null | awk '{gsub(/\/.*/,"",$4); print $4}')
      [ -z "$_ips" ] && _ips=$(hostname -I 2>/dev/null)
      mapfile -t _addrs <<< "$_ips"
      localIp="${_addrs[0]:-127.0.0.1}"
      echo "  Detected addresses: ${_addrs[*]:-none}"
      read -r -p "  Local IP the name resolves to [$localIp]: " _a
      [ -n "$_a" ] && localIp="$_a"

      read -r -p "  Local domain name [edurange.local]: " localDomain
      localDomain=${localDomain:-edurange.local}
      case "$localDomain" in
        *[!A-Za-z0-9.-]*) echo -e "${YLW}Invalid name; using edurange.local.${NC}"; localDomain="edurange.local" ;;
      esac

      # (Re)write exactly ONE /etc/hosts entry for this name. The awk matches the
      # name as the exact 2nd field, so re-runs never leave duplicates.
      _hosts=/tmp/er3.hosts.new
      if ! sudo awk -v n="$localDomain" '($2==n){next} {print}' /etc/hosts > "$_hosts" 2>/dev/null; then
        cp /etc/hosts "$_hosts"
      fi
      echo "$localIp $localDomain # edurange" >> "$_hosts"
      if sudo cp "$_hosts" /etc/hosts; then
        sudo chmod 644 /etc/hosts
        sudo chown root:root /etc/hosts
      else
        echo -e "${YLW}Could not update /etc/hosts.${NC}"
      fi

      # mkcert: install once (download must succeed), then issue a cert for the
      # name + localhost + the IP. Reuse an existing cert on re-runs.
      if ! command -v mkcert >/dev/null 2>&1; then
        if wget -q -O /tmp/mkcert "$MKCERT_URL"; then
          sudo install -m 0755 /tmp/mkcert /usr/bin/mkcert
        else
          echo -e "${YLW}Could not download mkcert; cannot create the TLS certificate.${NC}"
          continue
        fi
      fi
      mkcert -install
      # mkcert names files "<first-name>[+N].pem" / "...-key.pem"; pick the newest.
      localCert=$(ls -t "$PWD"/${localDomain}*.pem 2>/dev/null | grep -v -- '-key\.pem$' | head -1)
      localKey=$(ls -t "$PWD"/${localDomain}*key.pem 2>/dev/null | head -1)
      if [ -z "$localCert" ] || [ -z "$localKey" ]; then
        mkcert "$localDomain" localhost "$localIp" >/dev/null 2>&1
        localCert=$(ls -t "$PWD"/${localDomain}*.pem 2>/dev/null | grep -v -- '-key\.pem$' | head -1)
        localKey=$(ls -t "$PWD"/${localDomain}*key.pem 2>/dev/null | head -1)
      fi
      if [ -z "$localCert" ] || [ -z "$localKey" ]; then
        echo -e "${YLW}mkcert produced no certificate; skipping nginx setup.${NC}"
        continue
      fi

      # Rewrite only the real directive (anchored to line start), never a comment.
      sed "s|^\([[:space:]]*\)listen 80;|\1listen 443 ssl;\n\1ssl_certificate ${localCert};\n\1ssl_certificate_key ${localKey};|" \
        ./docs/nginx.site.self_signing.example > /tmp/er3.site
      cat ./docs/nginx.port80Redirect.snippet >> /tmp/er3.site
      sed -i "s/DOMAIN_TO_BE_REPLACED/${localDomain}/g" /tmp/er3.site
      _er3_install_site /tmp/er3.site

      # best-effort: trust the cert in a local Firefox, if one is present
      if command -v firefox >/dev/null 2>&1 && [ -d "$HOME/snap/firefox/common/.mozilla/firefox" ]; then
        _fp=$(grep -m 1 -Po '(?<=Path=).*' "$HOME/snap/firefox/common/.mozilla/firefox/profiles.ini" 2>/dev/null)
        [ -n "$_fp" ] && sudo certutil -d "sql:$HOME/snap/firefox/common/.mozilla/firefox/${_fp}" -A -t "C,," -n "EDURange" -i "$localCert" || true
      fi

      if getent hosts "$localDomain" >/dev/null 2>&1; then
        echo "  ${localDomain} resolves to $(getent hosts "$localDomain" | awk '{print $1}' | head -1)"
      else
        echo -e "${YLW}Warning: ${localDomain} does not resolve yet.${NC}"
      fi

      hostAddress="$localIp"
      ;;

    2)
      read -r -p "  Public domain name (DNS must point here): " pubDomain
      [ -z "$pubDomain" ] && continue
      if ! getent hosts "$pubDomain" >/dev/null 2>&1; then
        echo -e "${YLW}Warning: '$pubDomain' does not resolve yet — certbot needs DNS pointing here and port 80 reachable.${NC}"
      fi
      # serve HTTP first so certbot can finish its challenge, then certbot adds TLS
      sed "s/DOMAIN_TO_BE_REPLACED/${pubDomain}/g" ./docs/nginx.site.self_signing.example > /tmp/er3.site
      _er3_install_site /tmp/er3.site
      sudo certbot --nginx -d "$pubDomain" --redirect -n --agree-tos --register-unsafely-without-email
      hostAddress="$pubDomain"
      ;;

    *)
      echo "Please enter 1 or 2."
      ;;
  esac
done
# <<< er3-network-config <<<

if [ $# -eq 0 ]; then
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
  sed -i "s/DBNAME_REPLACEME/${dbname}/g" .env
  sed -i "s/DIFFERENT_SECRETKEY/${secretKeyJWT}/" .env
  sed -i "s/DB_PASS_REPLACEME/${dbpass}/" .env
  sed -i "s/someUser/${flaskUser}/" .env
  sed -i "s/somePass/${flaskPass}/" .env
  sed -i "s/YOURSECRETKEY/${secretKey}/" .env
  sed -i "s/YOUR_URL_HERE/${hostAddress}/" .env
  sed -i "s/someRootPass/${rootPass}/" .env

# NOTE: This was for vagrant installations, investigate removing
elif [ $1 = "auto" ]; then
  # Generate secrets/credentials instead of shipping .env.example placeholders.
  dbpass=$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 20)
  dbname="edudb"
  flaskUser="Administrator"
  flaskPass=$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 16)
  rootPass=$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 16)
  secretKey=$(head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)
  secretKeyJWT=$(head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)
  cp ./.env.example ./.env
  sed -i "s/DBNAME_REPLACEME/${dbname}/g" .env
  sed -i "s/DIFFERENT_SECRETKEY/${secretKeyJWT}/" .env
  sed -i "s/DB_PASS_REPLACEME/${dbpass}/" .env
  sed -i "s/someUser/${flaskUser}/" .env
  sed -i "s/somePass/${flaskPass}/" .env
  sed -i "s/YOURSECRETKEY/${secretKey}/" .env
  sed -i "s/YOUR_URL_HERE/localhost/" .env
  sed -i "s/someRootPass/${rootPass}/" .env
  echo -e "${GRN}Generated .env with random secrets. Web login: ${flaskUser} / ${flaskPass}${NC}"
fi

echo -e "${GRN}Downloading and setting up terraform${NC}"

# Updated Terraform to newest release June 4 2022
wget https://releases.hashicorp.com/terraform/1.2.2/terraform_1.2.2_linux_amd64.zip
unzip terraform_1.2.2_linux_amd64.zip
sudo mv terraform /usr/bin/terraform

# Check to see if docker is already installed. If it is, skip this.
if ! [ -x "$(command -v docker)" ]; then
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
