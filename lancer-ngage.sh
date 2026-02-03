#!/bin/bash
# Script de lancement rapide pour N-Gage (mode développement)

cd "$(dirname "$0")"
source ~/.zshrc
CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri dev
