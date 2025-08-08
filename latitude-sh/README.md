# Latitude.sh MCP Server

<<<<<<< Updated upstream
A Model Context Protocol (MCP) server that provides access to your latitude.sh projects and files.

## Features
=======
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/your-username/mcp-servers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.17.0-blue)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)

A comprehensive Model Context Protocol (MCP) server that provides intelligent access to your Latitude.sh infrastructure, including projects, servers, plans, and smart server creation workflows.

## Table of Contents

- [🚀 Features](#-features)
  - [📁 Project Management](#-project-management)
  - [💰 Plans](#-plans)
  - [🌍 Region Management](#-region-management)
  - [🖥️ Server Management](#-server-management)
  - [🧠 Smart Server Creation](#-smart-server-creation)
  - [🔧 General Tools](#-general-tools)
- [📋 Complete Tool List](#-complete-tool-list-23-tools)
- [🚀 Smart Server Creation Script](#-smart-server-creation-script)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏃 Running the Server](#-running-the-server)
- [🛠️ Available Scripts](#️-available-scripts-12-scripts)
- [🔧 Tool Schemas](#-tool-schemas)
- [📖 Response Format](#-response-format)
- [🚨 Error Handling](#-error-handling)
- [🏗️ Development](#️-development)
- [🔗 API Integration](#-api-integration)
- [🔒 Security Considerations](#-security-considerations)
- [🎯 Integration Examples](#-integration-examples)
- [🆘 Support](#-support)
- [📝 Changelog](#-changelog)
- [📄 License](#-license)

## 🚀 Features
>>>>>>> Stashed changes

### Project Management

- 🔍 **List Projects**: Get all projects from your latitude.sh account with filtering and pagination
- 📁 **Get Project Details**: Retrieve comprehensive information about specific projects
- 🔎 **Search Projects**: Search through project names, descriptions, and metadata
- 📂 **Get Project Files**: View the file structure of projects
- ➕ **Create Projects**: Create new projects with custom settings and metadata
- ✏️ **Update Projects**: Update existing projects with new settings and metadata
- 🗑️ **Delete Projects**: Permanently delete projects with confirmation

### Server Management

- 🖥️ **List Servers**: Get all servers with filtering by status, project, region, and plan
- ➕ **Create Servers**: Create new servers with custom specifications and configuration
- 📋 **Get Server Details**: Retrieve comprehensive server information including specs and network details
- ✏️ **Update Servers**: Update server properties like name, description, tags, and SSH keys
- 🗑️ **Delete Servers**: Permanently delete servers with confirmation protection

### General

- 🔗 **Test Connection**: Verify API connectivity and authentication

<<<<<<< Updated upstream
## Installation
=======
### 🖥️ Server Management

- **List Servers**: Get all servers with filtering by status, project, region, plan
- **Create Servers**: Create servers with specifications and configuration
- **Get Server Details**: Retrieve comprehensive server information
- **Update Servers**: Modify hostname, billing, tags, and project
- **Delete Servers**: Remove servers with confirmation protection
- **Deploy Config**: Get/Update server deploy configuration (OS, RAID, SSH keys, user data, partitions)
- **Lock/Unlock**: Prevent or allow server modifications and actions

### 🧠 Smart Server Creation

- **Get Server Creation Flow**: Intelligent workflow with real-time validation
- **Validate Server Config**: Pre-validate configurations before creation
- **Get Available Plans**: List all plans with specifications and pricing
- **Get Available Regions**: Check region availability for specific plans (argumento `plan` acepta `plan_id` o `slug`)

### 🔧 General Tools

- **Test Connection**: Verify API connectivity and authentication

## 📋 Complete Tool List (23 Tools)

| Tool                          | Description                   | Status         |
| ----------------------------- | ----------------------------- | -------------- |
| `list_projects`               | List projects with filtering  | ✅ Implemented |
| `get_project`                 | Get detailed project info     | ✅ Implemented |
| `search_projects`             | Search projects by query      | ✅ Implemented |
| `create_project`              | Create new project            | ✅ Implemented |
| `update_project`              | Update existing project       | ✅ Implemented |
| `delete_project`              | Delete project                | ✅ Implemented |
| `list_servers`                | List servers with filtering   | ✅ Implemented |
| `create_server`               | Create new server             | ✅ Implemented |
| `get_server`                  | Get detailed server info      | ✅ Implemented |
| `update_server`               | Update existing server        | ✅ Implemented |
| `delete_server`               | Delete server                 | ✅ Implemented |
| `get_available_plans`         | List all available plans      | ✅ Implemented |
| `get_plan`                    | Get a specific plan by ID     | ✅ Implemented |
| `get_available_regions`       | Get regions for specific plan | ✅ Implemented |
| `list_regions`                | List all global regions       | ✅ Implemented |
| `get_region`                  | Get a specific global region  | ✅ Implemented |
| `get_server_creation_flow`    | Smart creation workflow       | ✅ Implemented |
| `validate_server_config`      | Pre-validate server config    | ✅ Implemented |
| `test_connection`             | Test API connection           | ✅ Implemented |
| `get_server_deploy_config`    | Get server deploy config      | ✅ Implemented |
| `update_server_deploy_config` | Update server deploy config   | ✅ Implemented |
| `lock_server`                 | Lock a server                 | ✅ Implemented |
| `unlock_server`               | Unlock a server               | ✅ Implemented |

## 🚀 Smart Server Creation Script

### `run-create-server.js`

**Intelligent server creation with MCP-powered validation:**

- 🔍 **Pre-validation**: Validates configuration before creating expensive resources
- 📊 **Real-time data**: Always uses current plans, regions, and availability from Latitude.sh API
- 🎯 **Guided workflow**: Step-by-step process with helpful explanations and recommendations
- 🛡️ **Error prevention**: Catches configuration issues before they cause failed deployments
- 🧠 **MCP-powered**: Uses centralized logic for consistent behavior across all interfaces
- ⚡ **Smart defaults**: Recommends optimal configurations based on current availability

**Usage:**

```bash
node run-create-server.js
```

**Features:**

- Interactive project selection (on-demand projects only)
- Plan selection with real-time specifications and regional availability
- Comprehensive configuration validation before server creation
- Optional configurations: SSH keys, tags, user data, startup scripts
- Billing can be changed after creation via `update_server` (hourly, monthly, yearly)
- Detailed server creation confirmation with all specifications

## 📦 Installation

1. **Clone and install dependencies:**
>>>>>>> Stashed changes

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:

   ```bash
   # Copy the example environment file
   cp env.example .env.local

   # Edit .env.local and add your Latitude.sh API key
   # Get your API key from: https://latitude.sh/account/api-keys
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Environment Variables

The server uses environment variables for configuration. Create a `.env.local` file with the following variables:

```bash
# Required: Your Latitude.sh API key
LATITUDE_API_KEY=your-api-key-here

# Optional: Base URL for the API (default: https://api.latitude.sh)
LATITUDE_BASE_URL=https://api.latitude.sh

# Optional: Request timeout in milliseconds (default: 10000)
LATITUDE_TIMEOUT=10000

# Optional: Environment (default: development)
NODE_ENV=development
```

### Running the Server

```bash
# Run the built server
node dist/index.js

# Or run in development mode
npm run dev
```

### Getting Your API Key

1. Go to [Latitude.sh](https://latitude.sh)
2. Sign in to your account
3. Navigate to Account Settings → API Keys
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Available Tools

### 1. `list_projects`

List all projects from your latitude.sh account with optional filtering.

**Parameters:**

- `limit` (optional): Maximum number of projects to return (default: 50)
- `page` (optional): Page number for pagination (default: 1)
- `status` (optional): Filter by project status (`active`, `inactive`, `archived`)
- `owner` (optional): Filter by owner ID
- `tags` (optional): Filter by tags array

**Example:**

```json
{
  "limit": 10,
  "status": "active",
  "tags": ["javascript", "react"]
}
```

### 2. `get_project`

Get detailed information about a specific project by its ID.

**Parameters:**

- `projectId` (required): The ID of the project to retrieve

**Example:**

```json
{
  "projectId": "proj_123456789"
}
```

### 3. `search_projects`

Search for projects using a query string.

**Parameters:**

- `query` (required): Search query to find projects
- `limit` (optional): Maximum number of projects to return (default: 50)
- `page` (optional): Page number for pagination (default: 1)
- `status` (optional): Filter by project status

**Example:**

```json
{
  "query": "machine learning",
  "limit": 20,
  "status": "active"
}
```

### 4. `get_project_files`

Get the file structure of a specific project.

**Parameters:**

- `projectId` (required): The ID of the project to get files for

**Example:**

```json
{
  "projectId": "proj_123456789"
}
```

### 5. `create_project`

Create a new project in latitude.sh.

**Parameters:**

- `name` (required): Name of the project to create
- `description` (optional): Description of the project
- `environment` (optional): Environment type (`Development`, `Production`, `Staging`)
- `provisioning_type` (optional): Provisioning type (`on_demand`, `reserved`)
- `billing_type` (optional): Billing type (`Normal`, `Enterprise`)
- `billing_method` (optional): Billing method (`Normal`, `Enterprise`)
- `tags` (optional): Array of tags for the project

**Example:**

```json
{
  "name": "My New Project",
  "description": "A modern web application",
  "environment": "Development",
  "provisioning_type": "on_demand",
  "billing_type": "Normal",
  "tags": ["javascript", "react"]
}
```

### 6. `update_project`

<<<<<<< Updated upstream
Update an existing project in latitude.sh.
=======
All scripts now use standardized patterns with consistent error handling, environment loading, and help documentation.

| Script | Description | Status | Help Available |
| ------ | ----------- | ------ | -------------- |

| `run-create-server.js` | Smart interactive server creation | ✅ Enhanced | Interactive |
| `run-list-projects.js` | List all projects with pagination | ✅ Standardized | `--help` |
| `run-list-projects-on_demand.js` | List only on-demand projects | 🔧 Legacy | Basic |
| `run-list-plans.js` | List all available server plans | 🔧 Complex | Built-in |
| `run-list-servers.js` | List servers with filtering | ✅ Standardized | `--help` |
| `run-get-project.js` | Get details of a specific project | ✅ Standardized | `--help` |
| `run-get-server.js` | Get details of a specific server | ✅ Standardized | `--help` |
| `run-create-project.js` | Create a new project | 🔧 Interactive | Interactive |
| `run-update-project.js` | Update an existing project | 🔧 Legacy | Basic |
| `run-delete-project.js` | Delete a project | 🔧 Legacy | Basic |
| `run-delete-server.js` | Delete a server with confirmation | ✅ Standardized | `--help` |
| `run-search-projects.js` | Search projects by query | ✅ Standardized | `--help` |

### Script Features

**✅ Standardized Scripts Include:**

- Consistent error handling and helpful error messages
- Automatic environment variable loading from `.env.local`
- API key validation with clear error messages
- `--help` flag support with usage examples
- Input validation with clear error messages
- Timeout handling and graceful process management
- Formatted output with consistent styling

**🔧 Legacy Scripts:**

- Functional but use older patterns
- May have inconsistent error handling
- Limited help documentation

**Usage Examples:**

```bash
# Get help for any standardized script
node run-list-projects.js --help
node run-get-project.js --help
node run-delete-server.js --help

# Use with parameters
node run-list-projects.js 10 2              # Page 2, 10 items
node run-list-servers.js 20 1 proj_123      # Filter by project
node run-delete-server.js sv_123 "reason" --force  # Force deletion
```
>>>>>>> Stashed changes

**Parameters:**

- `projectId` (required): The ID of the project to update
- `name` (optional): New name for the project
- `description` (optional): New description for the project
- `environment` (optional): New environment type (`Development`, `Production`, `Staging`)
- `provisioning_type` (optional): New provisioning type (`on_demand`, `reserved`)
- `billing_type` (optional): New billing type (`Normal`, `Enterprise`)
- `billing_method` (optional): New billing method (`Normal`, `Enterprise`)
- `tags` (optional): New array of tags for the project

**Example:**

```json
{
  "projectId": "proj_123456789",
  "name": "Updated Project Name",
  "description": "Updated project description",
  "environment": "Production",
  "tags": ["updated", "production"]
}
```

### 7. `delete_project`

Delete a project from latitude.sh.

**Parameters:**

- `projectId` (required): The ID of the project to delete
- `confirm` (optional): Confirmation flag to prevent accidental deletion (default: false)

**Example:**

```json
{
  "projectId": "proj_123456789",
  "confirm": true
}
```

**Important:** This action is irreversible. The project and all its associated resources will be permanently deleted.

### 8. `list_servers`

List all servers from your latitude.sh account with optional filtering.

**Parameters:**

- `limit` (optional): Maximum number of servers to return (default: 50)
- `page` (optional): Page number for pagination (default: 1)
- `status` (optional): Filter by server status (`running`, `stopped`, `starting`, `stopping`, `error`, `deleted`)
- `projectId` (optional): Filter by project ID
- `region` (optional): Filter by region slug
- `plan` (optional): Filter by plan slug
- `tags` (optional): Filter by tags array

**Example:**

```json
{
  "limit": 10,
  "status": "running",
  "projectId": "proj_123456789",
  "tags": ["web", "production"]
}
```

### 9. `create_server`

Create a new server in latitude.sh.

**Parameters:**

- `name` (required): Name of the server to create
- `projectId` (required): The ID of the project to create the server in
- `regionId` (required): The ID of the region where the server will be deployed
- `planId` (required): The ID of the plan/specification for the server
- `description` (optional): Description of the server
- `sshKeys` (optional): Array of SSH key IDs to add to the server
- `tags` (optional): Tags for the server
- `userData` (optional): User data script to run on server startup
- `startupScript` (optional): Startup script to run on server initialization

**Example:**

```json
{
  "name": "Production Web Server",
  "projectId": "proj_123456789",
  "regionId": "lat-south-1",
  "planId": "lat-cpu-2",
  "description": "High-performance web server",
  "tags": ["web", "production"],
  "userData": "#!/bin/bash\napt-get update\napt-get install -y nginx"
}
```

### 10. `get_server`

Get detailed information about a specific server.

**Parameters:**

- `serverId` (required): The ID of the server to retrieve

**Example:**

```json
{
  "serverId": "srv_123456789"
}
```

### 11. `update_server`

Update an existing server in latitude.sh.

**Parameters:**

- `serverId` (required): The ID of the server to update
- `name` (optional): New name for the server
- `description` (optional): New description for the server
- `tags` (optional): New tags for the server
- `sshKeys` (optional): New array of SSH key IDs for the server

**Example:**

```json
{
  "serverId": "srv_123456789",
  "name": "Updated Server Name",
  "description": "Updated server description",
  "tags": ["updated", "production"]
}
```

### 12. `delete_server`

Delete a server from latitude.sh.

**Parameters:**

- `serverId` (required): The ID of the server to delete
- `confirm` (required): Confirmation flag to prevent accidental deletion (must be true)

**Example:**

```json
{
  "serverId": "srv_123456789",
  "confirm": true
}
```

**Important:** This action is irreversible. The server and all its data will be permanently deleted.

### 13. `test_connection`

Test the connection to the latitude.sh API.

**Parameters:** None

**Example:**

```json
{}
```

## Response Format

- Excepto `test_connection`, todos los tools retornan el cuerpo en formato JSON con estructura completa tipo API:

```json
{
<<<<<<< Updated upstream
  "content": [
    {
      "type": "text",
      "text": "Formatted response content"
    }
  ]
}
```

## Error Handling
=======
  "data": {},
  "meta": {}
}
```

- Este JSON se entrega dentro de `content[0].text` como string para clientes MCP. Ejemplo `list_projects`:

```json
{
  "data": [{ "id": "proj_...", "type": "projects", "attributes": {} }],
  "meta": { "total": 10, "page": 1, "limit": 20 }
}
```

- `test_connection` devuelve texto plano de éxito.

## 🚨 Error Handling
>>>>>>> Stashed changes

The server provides detailed error messages for various scenarios:

- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Project not found
- **500+ Server Error**: Latitude.sh API server error
- **Network Errors**: Connection issues
- **Validation Errors**: Invalid parameters

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript

### Development Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes
npm run watch

# Run in development mode
npm run dev



### Project Structure

```

latitude-sh/
├── src/
│ ├── types/
│ │ └── latitude.ts # TypeScript type definitions
│ ├── utils/
│ │ └── latitude-api.ts # API client implementation
│ └── index.ts # Main server file
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── README.md # This file
├── USAGE.md # Usage guide
├── example-config.json # Example configuration
├── test-server.js # Test script
└── LICENSE # MIT License

```

## API Integration

The server integrates with the latitude.sh API using the following endpoints:

- `GET /projects` - List projects
- `GET /projects/{id}` - Get project details
- `GET /user/profile` - Test connection

### Authentication

The server uses Bearer token authentication with your latitude.sh API key.

### Rate Limiting

The server respects latitude.sh API rate limits and includes appropriate error handling for rate limit responses.

## Security Considerations

- API keys are passed as command-line arguments (consider using environment variables in production)
- All API requests are made over HTTPS
- Input validation is performed using Zod schemas
- Error messages are sanitized to prevent information leakage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

<<<<<<< Updated upstream
1. Check the error messages for troubleshooting hints
2. Verify your API key is correct
3. Test the connection using the `test_connection` tool
4. Check the latitude.sh API documentation for endpoint changes
=======
1. **Check Error Messages**: The server provides detailed error information
2. **Verify API Key**: Ensure your API key is correct and has proper permissions
3. **Test Connection**: Use the `test_connection` tool to verify connectivity
4. **Check Documentation**: Review the Latitude.sh API documentation
5. **Validate Configuration**: Use `validate_server_config` before creating servers

## 📋 FAQ (Frequently Asked Questions)

### General Usage

**Q: How do I get started with this MCP server?**
A: Follow the installation steps, configure your API key in `.env.local`, build the project with `npm run build`, and run it with `npm run start`.

**Q: What's the difference between this server and the Latitude.sh web interface?**
A: This MCP server provides programmatic access through AI assistants and automation tools, while the web interface is for manual management.

**Q: Can I use this server in production?**
A: Yes, but ensure you follow security best practices, use proper API key management, and implement monitoring.

### Server Creation

**Q: Why should I use `validate_server_config` before creating servers?**
A: Validation prevents expensive failed deployments by checking project type, plan availability, and region stock before creation.

**Q: What's the smart server creation flow?**
A: It's an intelligent workflow that guides you through project selection, plan choice, region availability, and configuration validation.

**Q: Can I create servers in reserved projects?**
A: No, server creation is only supported for on-demand projects. Reserved projects require different provisioning workflows.

### API and Authentication

**Q: Where do I get my Latitude.sh API key?**
A: Go to [Latitude.sh Account Settings → API Keys](https://latitude.sh/account/api-keys) to create a new API key.

**Q: Why am I getting "Unauthorized" errors?**
A: Check that your API key is correct, properly formatted in `.env.local`, and has the necessary permissions for the operations you're trying to perform.

**Q: What permissions does my API key need?**
A: Your API key needs read/write permissions for projects and servers. Admin permissions may be required for certain operations.

### Troubleshooting

**Q: The server creation is failing. What should I check?**
A: 1) Validate your config first, 2) Ensure the project is on-demand, 3) Check region availability, 4) Verify plan exists, 5) Ensure hostname is unique.

**Q: How do I debug connection issues?**
A: Use the `test_connection` tool first, check your internet connection, verify the API endpoint, and review error messages for specific guidance.

**Q: Can I run multiple operations simultaneously?**
A: Yes, but be mindful of API rate limits. The server handles concurrent requests, but too many simultaneous operations may hit rate limits.

### Advanced Usage

**Q: How do I integrate this with CI/CD pipelines?**
A: Use the provided utility scripts or create custom automation using the MCP protocol. See the integration examples in USAGE.md.

**Q: Can I extend this server with custom tools?**
A: Yes, the server is built with TypeScript and follows MCP patterns. You can add new tools by extending the tool handlers in `src/index.ts`.

**Q: How do I handle errors gracefully in my automation?**
A: Always check response `isError` flags, implement retry logic for rate limits, and use validation tools before expensive operations.

## 📝 Changelog

### v0.4.0
>>>>>>> Stashed changes

## Changelog

### v0.2.0

- **Server Management CRUD Operations**
  - List servers with filtering and pagination
  - Create servers with custom specifications
  - Get detailed server information
  - Update server properties and configuration
  - Delete servers with confirmation protection
- Enhanced error handling for server operations
- Improved response formatting with emojis and status indicators

### v0.1.0

- Initial release
- Basic project listing and details
- Search functionality
- File structure access
- Project creation with custom settings
- Project update functionality
- Project deletion with confirmation
- Connection testing
```
