#!/bin/bash
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Creating build directory..."
mkdir -p build

echo "Setting up environment..."
export CI=false
export NODE_OPTIONS="--max_old_space_size=2048"

echo "Running build with node..."
node ./node_modules/react-scripts/bin/react-scripts.js build 