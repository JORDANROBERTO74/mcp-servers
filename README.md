# MCP Servers Collection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)

This repository contains a collection of Model Context Protocol (MCP) servers that I develop for various use cases and integrations.

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Project Structure](#project-structure)
- [Available Servers](#available-servers)
  - [Latitude.sh Infrastructure Server](#latitudesh-infrastructure-server)
  - [Weather Server](#weather-server)
- [Global Prerequisites](#global-prerequisites)
- [Development](#development)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)
- [Resources](#resources)
- [Author](#author)

## What is MCP?

The Model Context Protocol (MCP) is a protocol that enables AI assistants to connect to external data sources and tools. MCP servers provide structured access to various APIs, databases, and services, allowing AI models to retrieve and manipulate data in a standardized way.

## Project Structure

```
mcp-servers/
├── weather/          # Weather data MCP server
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md         # This file
```

## Available Servers

### Weather Server

- **Location**: `weather/`
- **Description**: MCP server for retrieving weather information and forecasts
- **Features**: Real-time weather data, forecasts, and location-based weather services

## Global Prerequisites

Before working with any MCP server in this collection, ensure you have:

### System Requirements

- **Node.js**: Version 18.0.0 or higher (recommended: LTS version)
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **TypeScript**: Version 5.0.0 or higher (for development)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Development Tools

- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript extensions
- **Terminal**: Command line interface for running scripts

### MCP Client

To use these servers, you'll need an MCP-compatible client such as:

- **Claude Desktop**: Official Anthropic client
- **Custom MCP Client**: Built using the MCP SDK
- **CLI Tools**: Command-line MCP clients

## Development

Each MCP server in this collection is developed as a standalone Node.js/TypeScript project with its own dependencies and configuration.

### Architecture

All servers follow a consistent architecture:

```
server-name/
├── src/                 # TypeScript source code
│   ├── index.ts        # Main server entry point
│   ├── types/          # Type definitions
│   └── utils/          # Utility functions
├── dist/               # Compiled JavaScript
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md           # Server-specific documentation
└── USAGE.md           # Usage examples (where applicable)
```

### Adding a New Server

1. Create a new directory for your server
2. Initialize a new Node.js project
3. Install MCP dependencies
4. Implement your server logic
5. Add documentation in the server's README.md

## Contributing

This is a personal collection of MCP servers. Feel free to fork and adapt these servers for your own projects.

### Contribution Guidelines

If you'd like to contribute improvements:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-improvement`
3. **Follow the existing code style** and architecture patterns
4. **Add tests** for new functionality where applicable
5. **Update documentation** including README.md and USAGE.md files
6. **Submit a pull request** with a clear description of changes

### Code Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow the existing linting rules
- **Documentation**: Document all public APIs and complex logic
- **Testing**: Add tests for new features (when applicable)

## FAQ

### General Questions

**Q: What is the Model Context Protocol (MCP)?**
A: MCP is a protocol that enables AI assistants to connect to external data sources and tools in a standardized way. It allows AI models to retrieve and manipulate data from various APIs and services.

**Q: Which MCP clients are compatible with these servers?**
A: These servers work with any MCP-compatible client, including Claude Desktop, custom clients built with the MCP SDK, and command-line tools.

**Q: Can I use these servers in production?**
A: Yes, but ensure you follow security best practices, use proper API key management, and implement appropriate error handling and monitoring.

### Technical Questions

**Q: Why do I need Node.js 18 or higher?**
A: These servers use modern JavaScript features and the latest MCP SDK, which requires Node.js 18+ for optimal performance and security.

**Q: How do I troubleshoot connection issues?**
A: Check your API keys, network connectivity, and refer to the specific server's troubleshooting section in its README.md or USAGE.md file.

**Q: Can I modify these servers for my own use?**
A: Absolutely! These servers are open source under the MIT license. Fork, modify, and adapt them as needed.

### Server-Specific Questions

**Q: Does the Latitude.sh server support all API features?**
A: The server implements 23 tools covering the most commonly used Latitude.sh API endpoints. Check the tool list in `latitude-sh/README.md` for complete coverage.

**Q: Is the Weather server limited to the US?**
A: Yes, the Weather server uses the National Weather Service API, which only provides data for United States territories.

## License

This project is open source and available under the MIT License.

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
