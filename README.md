# MCP Servers Collection

This repository contains a collection of Model Context Protocol (MCP) servers that I develop for various use cases and integrations.

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
