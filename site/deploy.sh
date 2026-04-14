#!/bin/bash

# Navigate to the project directory
cd /data01/virt72693/domeenid/www.talesofreval.ee/tor-full-stack || exit

# Log file
LOGFILE="/data01/virt72693/domeenid/www.talesofreval.ee/deploy.log"

# Pull the latest changes from the repository
echo "Starting deployment at $(date)" >> $LOGFILE
git pull origin master >> $LOGFILE 2>&1

# Build the application
cd /data01/virt72693/domeenid/www.talesofreval.ee/tor-full-stack/frontend || exit
npm run build

# Add additional deployment tasks here
# For example, you might need to restart your server or perform build steps
# sudo systemctl restart nginx >> $LOGFILE 2>&1
