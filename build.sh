#!/usr/bin/env bash
# ==============================================================================
# IntelliGreen Technologies — Standalone Cloud Build Script (Render / Cloud)
# ==============================================================================
set -o errexit

echo ">>> [1/3] Installing Python Dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> [2/3] Checking Node.js Environment & Compiling Frontend PWA..."
if ! command -v npm &> /dev/null; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo "Loading NVM..."
        . "$HOME/.nvm/nvm.sh"
        nvm install 20
        nvm use 20
    elif [ -s "/usr/local/nvm/nvm.sh" ]; then
        . "/usr/local/nvm/nvm.sh"
        nvm install 20
        nvm use 20
    fi
fi

cd frontend
npm install
npm run build
cd ..

echo ">>> [3/3] Build Succeeded! Standalone React PWA & FastAPI Ready."
