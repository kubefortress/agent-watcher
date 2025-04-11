#!/bin/bash

# Setup script for KubeFortress Rules Checker

echo "Setting up KubeFortress Rules Checker..."

# Create uploads directory for server temporary file storage
mkdir -p server/uploads

# Install dependencies
echo "Installing dependencies..."
npm install

# Build shared module first
echo "Building shared module..."
npm run build:shared

echo "Setup complete! You can now run the development server with: npm run dev"
echo "This will start both the client and server in development mode."
