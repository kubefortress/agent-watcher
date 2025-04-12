# KubeFortress Rules Checker
 
## Overview

KubeFortress Rules Checker is a security tool designed to detect malicious content in AI coding assistant rule files. This web application specifically targets the "Rules File Backdoor" vulnerability, which can be exploited to inject hidden instructions using Unicode character manipulation and other obfuscation techniques.

## Features

- **Unicode Analysis**: Detect hidden and zero-width Unicode characters that may be used to hide malicious instructions
- **Rules File Scanning**: Analyze AI assistant rule files for potential backdoors
- **Local & Remote Scanning**: Upload files or scan directories on your local system 
- **Comprehensive Reports**: Get detailed analysis with highlighted problematic areas and severity ratings
- **Modern Interface**: Clean, intuitive UI designed for security professionals and developers
- **Privacy Focus**: Files are processed client-side when possible; no data is stored server-side

## Vulnerability Context

The "Rules File Backdoor" technique is a supply chain attack vector that enables hackers to silently compromise AI-generated code by injecting hidden malicious instructions into configuration files used by AI coding assistants like Cursor and GitHub Copilot. This tool helps detect such attacks by scanning rule files for suspicious patterns.

## Usage

Visit [checker.kubefortress.io](https://checker.kubefortress.io) to use the web interface, or follow the instructions below to run the tool locally.

## Project Structure

```
/
├── client/              # React frontend application
├── server/              # Express backend API
├── shared/              # Shared utilities and types
├── setup.sh             # Setup script for quick start
├── SECURITY.md          # Security policy
└── README.md            # Project documentation
```

## Local Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/kubefortress/agent-watcher.git
cd agent-watcher

# Run the setup script (installs dependencies and creates needed directories)
./setup.sh

# Start development servers
npm run dev
```

### Manual Setup

```bash
# Install dependencies
npm install

# Create uploads directory for server
mkdir -p server/uploads

# Build the shared module
npm run build:shared

# Start client development server
npm run dev:client

# In another terminal, start server development server
npm run dev:server
```

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client development server
- `npm run dev:server` - Start only the server development server
- `npm run build` - Build all packages for production
- `npm run start` - Run the production server

## Detection Capabilities

The Rules Checker can detect:

1. **Invisible Unicode Characters** - Zero-width spaces, joiners, and other hidden characters
2. **Bidirectional Text Controls** - Characters that can manipulate text display direction
3. **Suspicious Language Patterns** - Phrases and instructions that may indicate backdoor attempts

Each scan provides:
- Highlighted problematic areas with context
- Character-level analysis with Unicode code points
- Overall severity rating
- Recommendations for remediation

## Privacy & Security

We take privacy seriously:

- Files are analyzed in your browser when possible
- No uploaded files are stored after analysis
- No personally identifiable information is collected

See our [Privacy Policy](https://checker.kubefortress.io/privacy) and [Security Policy](SECURITY.md) for more details.

## License

[MIT License](LICENSE)

## Security

If you discover a security issue, please report it according to our [security policy](SECURITY.md).
