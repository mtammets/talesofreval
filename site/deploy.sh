#!/bin/bash

set -euo pipefail

APP_ROOT="/data01/virt72693/domeenid/www.talesofreval.ee/tor-full-stack"
LOGFILE="/data01/virt72693/domeenid/www.talesofreval.ee/deploy.log"

{
  echo "Starting deployment at $(date)"
  cd "$APP_ROOT"
  npm install --omit=dev
  npm ci --prefix frontend
  CI=false npm run build --prefix frontend
  node backend/scripts/syncRuntimeSiteSettings.js
  pm2 update
  if pm2 describe tor-full >/dev/null 2>&1; then
    pm2 restart tor-full --update-env
  else
    pm2 start ecosystem.config.js --only tor-full --update-env
  fi
  pm2 save
  echo "Deployment finished at $(date)"
} >> "$LOGFILE" 2>&1
