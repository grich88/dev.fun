#!/bin/bash
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Creating build directory..."
mkdir -p build

echo "Setting up node_modules/.bin in PATH..."
export PATH="$PWD/node_modules/.bin:$PATH"

echo "Running build..."
CI=false react-scripts build 