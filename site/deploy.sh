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
  pm2 reload tor-full --update-env
  echo "Deployment finished at $(date)"
} >> "$LOGFILE" 2>&1
