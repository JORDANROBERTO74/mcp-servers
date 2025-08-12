# Latitude.sh MCP Server

[![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)](https://github.com/jordanroberto74/mcp-servers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.17.0-blue)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)

A comprehensive Model Context Protocol (MCP) server that provides intelligent access to your Latitude.sh infrastructure, including projects, servers, plans, regions, operating systems, and advanced server management capabilities.

## ⚠️ IMPORTANT: How to Use This Server

**This is an MCP server, NOT a standalone application.**

- ✅ **CORRECT**: Use with MCP clients (Claude Desktop, Cursor, etc.) by pointing to `dist/index.js`
- ❌ **INCORRECT**: Do NOT use the `run-*.js` scripts - they are only for testing/development
- 🎯 **Purpose**: The server exposes tools like `list_projects`, `create_server`, etc. to MCP clients

## Table of Contents

- [🚀 Features](#-features)
  - [📁 Project Management](#-project-management)
  - [💰 Plans](#-plans)
  - [🌍 Region Management](#-region-management)
  - [🖥️ Server Management](#-server-management)
  - [🧠 Smart Server Creation](#-smart-server-creation)
  - [🔧 General Tools](#-general-tools)
  - [🔒 Server Security](#-server-security)
  - [🔄 Server Operations](#-server-operations)
  - [🌐 Out of Band Access](#-out-of-band-access)
- [📋 Complete Tool List](#-complete-tool-list-29-tools)
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

### 📁 Project Management

- **List Projects**: Get all projects with filtering (name, slug, description, billing_type, environment, tags) and pagination
- **Get Project Details**: Retrieve comprehensive project information
- **Create Projects**: Create new projects with custom configurations
- **Update Projects**: Modify existing project settings
- **Delete Projects**: Remove projects with confirmation protection

### 💰 Plans

- **List Plans**: List all available server plans with specifications and pricing
- **Get Plan Details**: Get a specific plan by ID with regions and pricing

### 🌍 Region Management

- **List Regions**: List all global regions with facility and country
- **Get Region Details**: Retrieve detailed information for a specific region by ID

### 🖥️ Server Management

- **List Servers**: Get all servers with filtering by status, project, region, plan
- **Create Servers**: Create servers with specifications and configuration
- **Get Server Details**: Retrieve comprehensive server information
- **Update Servers**: Modify hostname, billing, tags, and project
- **Delete Servers**: Remove servers with confirmation protection
- **Deploy Config**: Get/Update server deploy configuration (OS, RAID, SSH keys, user data, partitions)
- **Lock/Unlock**: Prevent or allow server modifications and actions

### 🧠 Smart Server Creation

- **Interactive Scripts**: Command-line scripts for guided server and project creation
- **Validation Workflows**: Pre-validation and error prevention in creation processes

### 🔒 Server Security

- **Lock Server**: Prevent server modifications and actions
- **Unlock Server**: Allow server modifications and actions

### 🔄 Server Operations

- **Power Actions**: Power on, power off, and reboot servers
- **Rescue Mode**: Enter and exit rescue mode for system recovery
- **Server Reinstall**: Reinstall servers with new configurations
- **Schedule Deletion**: Schedule server deletion at billing cycle end
- **IPMI Access**: Generate IPMI credentials for remote access

### 🌐 Out of Band Access

- **Start OOB Connection**: Create secure out-of-band connections
- **List OOB Connections**: View active out-of-band connections

### 🔧 General Tools

- **Test Connection**: Verify API connectivity and authentication
- **List Operating Systems**: Get available operating systems for deployment

## 📋 Complete Tool List (29 Tools)

| Tool                           | Description                      | Status         |
| ------------------------------ | -------------------------------- | -------------- |
| `list_projects`                | List projects with filtering     | ✅ Implemented |
| `get_project`                  | Get detailed project info        | ✅ Implemented |
| `create_project`               | Create new project               | ✅ Implemented |
| `update_project`               | Update existing project          | ✅ Implemented |
| `delete_project`               | Delete project                   | ✅ Implemented |
| `list_servers`                 | List servers with filtering      | ✅ Implemented |
| `create_server`                | Create new server                | ✅ Implemented |
| `get_server`                   | Get detailed server info         | ✅ Implemented |
| `update_server`                | Update existing server           | ✅ Implemented |
| `delete_server`                | Delete server                    | ✅ Implemented |
| `list_plans`                   | List all available plans         | ✅ Implemented |
| `get_plan`                     | Get a specific plan by ID        | ✅ Implemented |
| `list_regions`                 | List all global regions          | ✅ Implemented |
| `get_region`                   | Get a specific global region     | ✅ Implemented |
| `get_server_deploy_config`     | Get server deploy config         | ✅ Implemented |
| `update_server_deploy_config`  | Update server deploy config      | ✅ Implemented |
| `lock_server`                  | Lock a server                    | ✅ Implemented |
| `unlock_server`                | Unlock a server                  | ✅ Implemented |
| `list_operating_systems`       | List available operating systems | ✅ Implemented |
| `start_out_of_band_connection` | Start OOB connection             | ✅ Implemented |
| `list_out_of_band_connections` | List active OOB connections      | ✅ Implemented |
| `run_server_action`            | Run power actions on server      | ✅ Implemented |
| `generate_ipmi_credentials`    | Generate IPMI credentials        | ✅ Implemented |
| `enter_rescue_mode`            | Enter server rescue mode         | ✅ Implemented |
| `exit_rescue_mode`             | Exit server rescue mode          | ✅ Implemented |
| `schedule_server_deletion`     | Schedule server deletion         | ✅ Implemented |
| `unschedule_server_deletion`   | Cancel scheduled deletion        | ✅ Implemented |
| `server_reinstall`             | Reinstall server                 | ✅ Implemented |
| `test_connection`              | Test API connection              | ✅ Implemented |

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
- Detailed server creation confirmation with all specifications

## 📦 Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd latitude-sh
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example environment file
   cp env.example .env.local

   # Edit .env.local and add your Latitude.sh API key
   # Get your API key from: https://latitude.sh/account/api-keys
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required: Your Latitude.sh API key
# You may provide either the raw token (recommended) or the full value with "Bearer " prefix.
# The server will automatically add the prefix if it's missing.
LATITUDE_API_KEY=your-api-key-here

# Optional: Base URL for the API (default: https://api.latitude.sh)
LATITUDE_BASE_URL=https://api.latitude.sh

# Optional: Request timeout in milliseconds (default: 10000)
LATITUDE_TIMEOUT=10000

# Optional: Environment (default: development)
NODE_ENV=development
```

### Getting Your API Key

1. Go to [Latitude.sh](https://latitude.sh)
2. Sign in to your account
3. Navigate to Account Settings → API Keys
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## 🏃 Running the Server

```bash
# Run the built server
node dist/index.js

# Or use npm scripts
npm run start
```

## 🛠️ Available Scripts (12 Scripts)

| Script                           | Description                                   | Usage Example                                     |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| `run-create-server.js`           | Smart interactive server creation             | `node run-create-server.js`                       |
| `run-create-project.js`          | Interactive project creation                  | `node run-create-project.js`                      |
| `run-list-projects.js`           | List all projects with pagination             | `node run-list-projects.js`                       |
| `run-list-projects-on_demand.js` | List only on-demand projects                  | `node run-list-projects-on_demand.js`             |
| `run-list-servers.js`            | List all servers with filtering               | `node run-list-servers.js`                        |
| `run-list-plans.js`              | List all available server plans               | `node run-list-plans.js`                          |
| `run-get-project.js`             | Get details of a specific project             | `node run-get-project.js my-project-id`           |
| `run-get-server.js`              | Get details of a specific server              | `node run-get-server.js my-server-id`             |
| `run-update-project.js`          | Interactive project update tool               | `node run-update-project.js my-project-id`        |
| `run-search-projects.js`         | Search projects by query                      | `node run-search-projects.js "react" 25 1`        |
| `run-delete-project.js`          | Delete a project with multi-step confirmation | `node run-delete-project.js my-project-id`        |
| `run-delete-server.js`           | Delete a server with confirmation             | `node run-delete-server.js my-server-id "reason"` |

## 🔧 Tool Schemas

### Project Tools

#### `list_projects`

```json
{
  "page[size]": 20,
  "page[number]": 1,
  "filter[name]": "string",
  "filter[slug]": "string",
  "filter[description]": "string",
  "filter[billing_type]": "string",
  "filter[environment]": "string",
  "filter[tags]": "tag_1,tag_2",
  "extra_fields[projects]": "last_renewal_date,next_renewal_date"
}
```

#### `create_project`

```json
{
  "name": "My Project", // Required: Project name
  "description": "Description", // Optional: Project description
  "environment": "Development", // Optional: Development, Production, Staging
  "provisioning_type": "on_demand", // Optional: on_demand, reserved
  "billing_type": "Normal", // Optional: Normal, Enterprise
  "billing_method": "Normal", // Optional: Normal, Enterprise
  "tags": ["tag1", "tag2"] // Optional: Array of tags
}
```

### Server Tools

#### `list_servers`

```json
{
  "page[size]": 20,
  "page[number]": 1,
  "status": "running",
  "projectId": "proj_123456789",
  "filter[project]": "proj_123456789",
  "filter[region]": "NYC",
  "filter[hostname]": "name",
  "filter[plan]": "c2-small-x86"
}
```

#### `create_server`

```json
{
  "project": "proj_123456789", // Required: Project ID
  "plan": "plan_2X6KG5mA5yPBM", // Required: Plan ID
  "operating_system": "ubuntu_24_04_x64_lts", // Required: OS
  "hostname": "my-server", // Required: Server hostname
  "site": "NYC", // Required: Region code
  "sshKeys": ["ssh_key_123"], // Optional: SSH key IDs
  "tags": ["web", "production"], // Optional: Tags
  "userData": "#!/bin/bash\necho hello", // Optional: User data script
  "startupScript": "systemctl start nginx" // Optional: Startup script
}
```

#### `update_server`

```json
{
  "serverId": "sv_123456789", // Required: Server ID
  "hostname": "new-hostname", // Optional: New hostname
  "billing": "monthly", // Optional: Billing model (hourly, monthly, yearly)
  "project": "proj_987654321", // Optional: Move server to another project ID
  "tags": ["tag1", "tag2"] // Optional: Array of tags
}
```

#### `delete_server`

```json
{
  "serverId": "sv_123456789", // Required: Server ID
  "reason": "Server no longer needed" // Optional: Reason for deletion
}
```

### Server Security & Operations

#### `lock_server` / `unlock_server`

```json
{
  "serverId": "sv_123456789" // Required: Server ID
}
```

#### `run_server_action`

```json
{
  "serverId": "sv_123456789", // Required: Server ID
  "action": "power_on" // Required: power_on, power_off, or reboot
}
```

#### `enter_rescue_mode` / `exit_rescue_mode`

```json
{
  "serverId": "sv_123456789" // Required: Server ID
}
```

#### `server_reinstall`

```json
{
  "serverId": "sv_123456789", // Required: Server ID
  "operating_system": "ubuntu_24_04_x64_lts", // Optional: New OS
  "hostname": "new-hostname", // Optional: New hostname
  "sshKeys": ["ssh_key_123"], // Optional: SSH key IDs
  "userData": "#!/bin/bash\necho hello", // Optional: User data script
  "raid": "raid-1", // Optional: RAID configuration
  "partitions": [
    // Optional: Partition configuration
    {
      "path": "/",
      "size_in_gb": 300,
      "filesystem_type": "ext4"
    }
  ]
}
```

#### `schedule_server_deletion` / `unschedule_server_deletion`

```json
{
  "serverId": "sv_123456789" // Required: Server ID
}
```

### Out of Band Access

#### `start_out_of_band_connection`

```json
{
  "serverId": "sv_123456789", // Required: Server ID
  "sshKeyId": "ssh_key_123" // Optional: SSH key ID for authentication
}
```

#### `generate_ipmi_credentials`

```json
{
  "serverId": "sv_123456789" // Required: Server ID
}
```

### Infrastructure Tools

#### `list_plans`

```json
{
  "filterName": "c2-small", // Optional: Filter by plan name
  "filterSlug": "c2-small-x86", // Optional: Filter by plan slug
  "filterLocation": "NYC", // Optional: Filter by location
  "filterGpu": true, // Optional: Filter by GPU availability
  "filterRamGte": 32, // Optional: Filter by minimum RAM (GB)
  "filterDiskGte": 500 // Optional: Filter by minimum disk size (GB)
}
```

#### `list_regions`

```json
{
  "pageSize": 20, // Optional: Number of items per page
  "pageNumber": 1 // Optional: Page number (starts at 1)
}
```

#### `list_operating_systems`

Returns the catalogue of operating systems available for server deployment. Supports optional pagination.

```json
{
  "pageSize": 20,
  "pageNumber": 1
}
```

## 📖 Response Format

- Except for `test_connection`, all tools return a JSON body using a complete API-style structure:

```json
{
  "data": {},
  "meta": {}
}
```

- This JSON payload is returned inside `content[0].text` as a string for MCP clients. Example for `list_projects`:

```json
{
  "data": [{ "id": "proj_...", "type": "projects", "attributes": {} }],
  "meta": { "total": 10, "page": 1, "limit": 20 }
}
```

- `test_connection` returns plain-text success.

## 🚨 Error Handling

The server provides detailed error messages for various scenarios:

- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limiting
- **500+ Server Error**: Latitude.sh API server error
- **Network Errors**: Connection issues
- **Validation Errors**: Invalid parameters

## 🏗️ Development

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

# Build and watch for changes
npm run build -- --watch
```

### Project Structure

```
latitude-sh/
├── src/
│   ├── types/
│   │   └── latitude.ts          # TypeScript type definitions
│   ├── utils/
│   │   └── latitude-api.ts      # API client implementation
│   ├── config.ts                # Configuration management
│   └── index.ts                 # Main server file
├── run-*.js                     # Utility scripts
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── env.example                 # Environment variables example
├── README.md                   # This file
└── USAGE.md                    # Usage guide with examples
```

## 🔗 API Integration

The server integrates with the Latitude.sh API using the following key endpoints:

### Project Management

- `GET /projects` - List projects (supports filter[name], filter[slug], filter[description], filter[billing_type], filter[environment], filter[tags], extra_fields[projects], page[size], page[number])
- `POST /projects` - Create project
- `GET /projects/{id}` - Get project details
- `PATCH /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Server Management

- `GET /servers` - List servers
- `POST /servers` - Create server
- `GET /servers/{id}` - Get server details
- `PATCH /servers/{id}` - Update server
- `DELETE /servers/{id}` - Delete server
- `GET /servers/{id}/deploy_config` - Retrieve deploy configuration
- `PATCH /servers/{id}/deploy_config` - Update deploy configuration

### Server Security & Operations

- `POST /servers/{id}/lock` - Lock server
- `POST /servers/{id}/unlock` - Unlock server
- `POST /servers/{id}/actions` - Run power actions (power_on, power_off, reboot)
- `POST /servers/{id}/rescue` - Enter rescue mode
- `DELETE /servers/{id}/rescue` - Exit rescue mode
- `POST /servers/{id}/reinstall` - Reinstall server
- `POST /servers/{id}/schedule_deletion` - Schedule server deletion
- `DELETE /servers/{id}/schedule_deletion` - Cancel scheduled deletion

### Out of Band Access

- `POST /servers/{id}/out_of_band` - Start OOB connection
- `GET /servers/{id}/out_of_band` - List OOB connections
- `POST /servers/{id}/ipmi` - Generate IPMI credentials

### Infrastructure

- `GET /plans` - List available plans
- `GET /plans/{planId}` - Get a specific plan (includes attributes.regions with pricing)
- `GET /regions` - List global regions
- `GET /regions/{id}` - Get specific global region
- `GET /operating-systems` - List available operating systems
- `GET /user/profile` - Test connection

### Authentication

The server uses Bearer token authentication with your Latitude.sh API key. You can provide the key with or without the `Bearer ` prefix; the server will normalize it.

### Rate Limiting

The server respects Latitude.sh API rate limits and includes appropriate error handling for rate limit responses.

## 🔒 Security Considerations

- ✅ API keys are loaded from environment variables
- ✅ All API requests are made over HTTPS
- ✅ Input validation is performed using Zod schemas
- ✅ Error messages are sanitized to prevent information leakage
- ✅ API keys are masked in error logs

## 🎯 Integration Examples

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "latitude-sh": {
      "command": "node",
      "args": ["/path/to/latitude-sh/dist/index.js"],
      "env": {
        "LATITUDE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### With Other MCP Clients

```json
{
  "mcpServers": {
    "latitude-sh": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "LATITUDE_API_KEY": "your-api-key-here",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🆘 Support

For issues and questions:

1. **Check Error Messages**: The server provides detailed error information
2. **Verify API Key**: Ensure your API key is correct and has proper permissions
3. **Test Connection**: Use the `test_connection` tool to verify connectivity
4. **Check Documentation**: Review the Latitude.sh API documentation
5. **Validate Configuration**: Use interactive scripts for guided server creation

## 📋 FAQ (Frequently Asked Questions)

### General Usage

**Q: How do I get started with this MCP server?**
A: Follow the installation steps, configure your API key in `.env.local`, build the project with `npm run build`, and run it with `npm run start`.

**Q: What's the difference between this server and the Latitude.sh web interface?**
A: This MCP server provides programmatic access through AI assistants and automation tools, while the web interface is for manual management.

**Q: Can I use this server in production?**
A: Yes, but ensure you follow security best practices, use proper API key management, and implement monitoring.

### Server Creation & Management

**Q: Why should I use the interactive scripts for server creation?**
A: Interactive scripts provide guided workflows that prevent expensive failed deployments by checking project type, plan availability, and region stock before creation.

**Q: What's the smart server creation flow?**
A: It's an intelligent workflow that guides you through project selection, plan choice, region availability, and configuration validation.

**Q: Can I create servers in reserved projects?**
A: No, server creation is only supported for on-demand projects. Reserved projects require different provisioning workflows.

**Q: What server operations can I perform?**
A: You can perform power actions (on/off/reboot), enter/exit rescue mode, reinstall servers, and schedule/unschedule deletions.

**Q: How do I secure my servers?**
A: Use the `lock_server` tool to prevent modifications and actions, and `unlock_server` when you need to make changes.

**Q: What is Out of Band (OOB) access?**
A: OOB access provides secure remote access to servers even when the main network is down, useful for troubleshooting and recovery.

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

### v0.5.0 (Current)

- **Expanded Tool Set**: Added 5 new tools for comprehensive server management
- **Advanced Server Operations**: Power actions, rescue mode, server reinstall, and scheduled deletion
- **Out of Band Access**: OOB connections and IPMI credentials generation
- **Enhanced Security**: Server locking/unlocking capabilities
- **Complete API Coverage**: Now supports 29 tools covering all major Latitude.sh API endpoints
- **Updated Documentation**: Comprehensive documentation for all new tools and features

### v0.4.0

- **Updated `update_server` Tool**: Now supports official API parameters (hostname, billing, tags, project)
- **Complete Tool Documentation**: All 24 tools fully documented with examples
- **Enhanced Documentation**: Updated README.md and USAGE.md with accurate schemas
- **Script Consolidation**: Streamlined to 12 essential scripts
- **Improved Examples**: Real-world usage examples for all tools

### v0.3.0

- **Smart Server Creation**: Added intelligent server creation workflow
- **Interactive Scripts**: Added guided server creation workflows
- **Enhanced Plans**: Added `list_plans` with detailed specifications
- **Region Availability**: Added `list_regions` tool
- **Improved Error Handling**: Better error messages and validation
- **Updated Scripts**: Streamlined script collection with smart creation

### v0.2.0

- **Server Management**: Complete CRUD operations for servers
- **Enhanced Filtering**: Advanced filtering for projects and servers
- **Pagination Support**: Proper pagination for large result sets
- **Improved Formatting**: Better response formatting with emojis

### v0.1.0

- **Initial Release**: Basic project management functionality
- **Project CRUD**: Create, read, update, delete projects
- **Search Functionality**: Project search capabilities
- **File Structure**: Access to project files
- **Connection Testing**: API connectivity verification

## 📄 License

MIT License - see LICENSE file for details.
