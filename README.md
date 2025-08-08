# MCP Servers Collection

This repository contains a collection of Model Context Protocol (MCP) servers that I develop for various use cases and integrations.

## What is MCP?

The Model Context Protocol (MCP) is a protocol that enables AI assistants to connect to external data sources and tools. MCP servers provide structured access to various APIs, databases, and services, allowing AI models to retrieve and manipulate data in a standardized way.

## Project Structure

```
mcp-servers/
├── latitude-sh/      # Latitude.sh infrastructure MCP server
│   ├── src/          # TypeScript source code
│   ├── dist/         # Compiled JavaScript
│   ├── run-*.js      # 12 utility scripts
│   ├── README.md     # Server documentation
│   └── USAGE.md      # Usage guide with examples
├── weather/          # Weather data MCP server
│   ├── src/          # TypeScript source code
│   ├── build/        # Compiled JavaScript
│   ├── package.json
│   └── README.md
└── README.md         # This file
```

## Available Servers

### Latitude.sh Infrastructure Server

- **Location**: `latitude-sh/`
- **Description**: Comprehensive MCP server for Latitude.sh infrastructure management
- **Features**:
  - 19 MCP tools for complete infrastructure control
  - Project management (CRUD operations)
  - Server lifecycle management
  - Smart server creation with validation
  - Plan and region availability checking
  - 12 utility scripts for direct CLI usage
- **Version**: v0.1.0
- **API Integration**: Latitude.sh REST API

### Weather Server

- **Location**: `weather/`
- **Description**: MCP server for retrieving weather information and forecasts
- **Features**: Real-time weather data, forecasts, and location-based weather services
- **Version**: v1.0.0
- **API Integration**: National Weather Service (NWS) API

## Development

Each MCP server in this collection is developed as a standalone Node.js/TypeScript project with its own dependencies and configuration.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Adding a New Server

1. Create a new directory for your server
2. Initialize a new Node.js project
3. Install MCP dependencies
4. Implement your server logic
5. Add documentation in the server's README.md

## Contributing

This is a personal collection of MCP servers. Feel free to fork and adapt these servers for your own projects.

## License

This project is open source and available under the MIT License.

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
