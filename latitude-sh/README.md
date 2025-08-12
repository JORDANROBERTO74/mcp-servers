# Latitude.sh MCP Server

[![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)](https://github.com/jordanroberto74/mcp-servers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.17.0-blue)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)

A comprehensive Model Context Protocol (MCP) server that provides intelligent access to your Latitude.sh infrastructure, including projects, servers, plans, and smart server creation workflows. **Now 100% compatible with Cursor!**

## 🎉 **NEW: Full Cursor Compatibility**

**All 29 tools now work perfectly in Cursor** with clean, intuitive parameter names:

- ✅ **No more validation errors** - All parameters use Cursor-friendly names
- ✅ **Automatic transformation** - Server converts parameters to API format internally
- ✅ **Same functionality** - Maintains 100% compatibility with Latitude.sh API
- ✅ **Better UX** - Cleaner parameter names like `pageSize` instead of `page[size]`

**See [CURSOR_COMPATIBILITY.md](./CURSOR_COMPATIBILITY.md) for complete details.**

## ⚠️ IMPORTANT: How to Use This Server

**This is an MCP server, NOT a standalone application.**

- ✅ **CORRECT**: Use with MCP clients (Claude Desktop, Cursor, etc.) by pointing to `dist/index.js`
- 🔧 **TESTING**: The `run-*.js` scripts are for development/testing only - see [Development Scripts](#-development-scripts)
- 🎯 **Purpose**: The server exposes tools like `list_projects`, `create_server`, etc. to MCP clients

## Table of Contents

- [🚀 Features](#-features)
  - [📁 Project Management](#-project-management)
  - [💰 Plans](#-plans)
  - [🌍 Region Management](#-region-management)
  - [🖥️ Server Management](#-server-management)
  - [🧠 Smart Server Creation](#-smart-server-creation)
  - [🔧 General Tools](#-general-tools)
- [📋 Complete Tool List](#-complete-tool-list-28-tools)
- [🎯 Cursor Compatibility](#-cursor-compatibility)
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

## 🚀 Features

### 📁 Project Management

- **List Projects**: Get all projects with filtering (name, slug, description, billing_type, environment, tags) and pagination
- **Get Project Details**: Retrieve comprehensive project information
- **Search Projects**: Search through names, descriptions, and metadata
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
- **Out-of-Band Access**: Start an out-of-band connection and obtain temporary credentials
- **List OOB Connections**: List all active out-of-band connections for a server
- **Server Actions**: Run power actions on servers (power_on, power_off, reboot)
- **IPMI Access**: Generate IPMI credentials for remote server management
- **Rescue Mode**: Put servers in rescue mode for system recovery and exit rescue mode
- **Deletion Scheduling**: Schedule server deletion at end of billing cycle or cancel scheduled deletion
- **Server Reinstall**: Reinstall servers with custom OS, partitions, SSH keys, and configuration

### 🧠 Smart Server Creation

- **Get Plan**: Get specific plan details with specifications and pricing
- **List Regions**: Check global region availability

### 🔧 General Tools

- **Test Connection**: Verify API connectivity and authentication

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
| `get_plan`                     | Get a specific plan by ID        | ✅ Implemented |
| `list_regions`                 | List all global regions          | ✅ Implemented |
| `get_region`                   | Get a specific global region     | ✅ Implemented |
| `test_connection`              | Test API connection              | ✅ Implemented |
| `get_server_deploy_config`     | Get server deploy config         | ✅ Implemented |
| `update_server_deploy_config`  | Update server deploy config      | ✅ Implemented |
| `lock_server`                  | Lock a server                    | ✅ Implemented |
| `unlock_server`                | Unlock a server                  | ✅ Implemented |
| `list_operating_systems`       | List available operating systems | ✅ Implemented |
| `start_out_of_band_connection` | Start an out-of-band connection  | ✅ Implemented |
| `list_out_of_band_connections` | List out-of-band connections     | ✅ Implemented |
| `run_server_action`            | Run server power actions         | ✅ Implemented |
| `generate_ipmi_credentials`    | Generate IPMI credentials        | ✅ Implemented |
| `enter_rescue_mode`            | Put server in rescue mode        | ✅ Implemented |
| `exit_rescue_mode`             | Exit server rescue mode          | ✅ Implemented |
| `schedule_server_deletion`     | Schedule server deletion         | ✅ Implemented |
| `unschedule_server_deletion`   | Cancel scheduled server deletion | ✅ Implemented |
| `server_reinstall`             | Reinstall server with new config | ✅ Implemented |

## 🎯 **Cursor Compatibility**

### **Parameter Transformation**

The server automatically transforms Cursor-friendly parameter names to the official Latitude.sh API format:

| **Cursor Input**      | **API Format**           |
| --------------------- | ------------------------ |
| `pageSize`            | `page[size]`             |
| `filterName`          | `filter[name]`           |
| `extraFieldsProjects` | `extra_fields[projects]` |

### **Example Usage in Cursor**

```json
{
  "name": "list_projects",
  "arguments": {
    "pageSize": 20,
    "filterEnvironment": "Development",
    "filterTags": "production,web"
  }
}
```

**All 29 tools now work perfectly in Cursor with clean parameter names!**

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

## 🛠️ Development

⚠️ **Development scripts have been removed for a cleaner, more focused approach.**

## 🔧 Tool Schemas

### Project Tools

#### `list_projects`

```json
{
  "pageSize": 20,
  "pageNumber": 1,
  "filterName": "string",
  "filterSlug": "string",
  "filterDescription": "string",
  "filterBillingType": "string",
  "filterEnvironment": "string",
  "filterTags": "tag_1,tag_2",
  "extraFieldsProjects": "last_renewal_date,next_renewal_date"
}
```

#### `create_project`

```json
{
  "name": "My Project", // Required: Project name
  "description": "Description", // Optional: Project description
  "environment": "Development", // Optional: Development, Production, Staging
  "provisioningType": "on_demand", // Optional: on_demand, reserved
  "billing_type": "Normal", // Optional: Normal, Enterprise
  "billing_method": "Normal", // Optional: Normal, Enterprise
  "tags": ["tag1", "tag2"] // Optional: Array of tags
}
```

### Server Tools

#### `list_servers`

```json
{
  "pageSize": 20,
  "pageNumber": 1,
  "filterProject": "proj_123456789",
  "filterRegion": "NYC",
  "filterHostname": "name",
  "filterPlan": "c2-small-x86"
}
```

#### `create_server`

```json
{
  "project": "proj_123456789", // Required: Project ID
  "plan": "plan_2X6KG5mA5yPBM", // Required: Plan ID
  "operatingSystem": "ubuntu_24_04_x64_lts", // Required: OS
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
  "reason": "Server no longer needed", // Optional: Reason for deletion
  "confirm": true // Required: Set to true to confirm deletion
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
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── env.example                 # Environment variables example
├── README.md                   # This file
├── CURSOR_COMPATIBILITY.md     # Cursor compatibility guide
└── USAGE.md                    # Usage guide with examples
```

## 🔗 API Integration

The server integrates with the Latitude.sh API using the following key endpoints:

- `GET /projects` - List projects (supports filter[name], filter[slug], filter[description], filter[billing_type], filter[environment], filter[tags], extra_fields[projects], page[size], page[number])
- `POST /projects` - Create project
- `GET /projects/{id}` - Get project details
- `PATCH /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `GET /servers` - List servers
- `POST /servers` - Create server
- `GET /servers/{id}` - Get server details
- `PATCH /servers/{id}` - Update server
- `DELETE /servers/{id}` - Delete server
- `GET /servers/{id}/deploy_config` - Retrieve deploy configuration
- `PATCH /servers/{id}/deploy_config` - Update deploy configuration
- `POST /servers/{id}/lock` - Lock server
- `POST /servers/{id}/unlock` - Unlock server
- `GET /plans` - List available plans
- `GET /plans/{planId}` - Get a specific plan (includes attributes.regions with pricing)
- `GET /regions` - List global regions
- `GET /regions/{id}` - Get specific global region
- `GET /user/profile` - Test connection
- `POST /servers/{id}/out_of_band_connection` - Start out-of-band connection
- `GET /servers/{id}/out_of_band_connection` - List out-of-band connections
- `POST /servers/{id}/actions` - Run server actions (power_on, power_off, reboot)
- `POST /servers/{id}/remote_access` - Generate IPMI credentials
- `POST /servers/{id}/rescue_mode` - Put server in rescue mode
- `POST /servers/{id}/exit_rescue_mode` - Exit server rescue mode
- `POST /servers/{id}/schedule_deletion` - Schedule server deletion
- `DELETE /servers/{id}/schedule_deletion` - Cancel scheduled server deletion
- `POST /servers/{id}/reinstall` - Reinstall server with new configuration

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

### With Cursor

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

**All tools now work perfectly in Cursor with clean parameter names!**

## 🆘 Support

For issues and questions:

1. **Check Error Messages**: The server provides detailed error information
2. **Verify API Key**: Ensure your API key is correct and has proper permissions
3. **Test Connection**: Use the `test_connection` tool to verify connectivity
4. **Check Documentation**: Review the Latitude.sh API documentation
5. **Check Resources**: Use `list_projects`, `get_plan`, and `list_regions` to verify availability
6. **Cursor Issues**: See [CURSOR_COMPATIBILITY.md](./CURSOR_COMPATIBILITY.md) for parameter help

## 📋 FAQ (Frequently Asked Questions)

### General Usage

**Q: How do I get started with this MCP server?**
A: Follow the installation steps, configure your API key in `.env.local`, build the project with `npm run build`, and run it with `npm run start`.

**Q: What's the difference between this server and the Latitude.sh web interface?**
A: This MCP server provides programmatic access through AI assistants and automation tools, while the web interface is for manual management.

**Q: Can I use this server in production?**
A: Yes, but ensure you follow security best practices, use proper API key management, and implement monitoring.

### Cursor Compatibility

**Q: Do all tools work in Cursor now?**
A: **Yes!** All 29 tools now work perfectly in Cursor with clean parameter names.

**Q: What changed to fix the compatibility issues?**
A: The server now accepts Cursor-friendly parameter names (like `pageSize`) and automatically transforms them to the API format internally.

**Q: Can I still use the old parameter names?**
A: No, you must use the new Cursor-compatible names. See [CURSOR_COMPATIBILITY.md](./CURSOR_COMPATIBILITY.md) for the complete mapping.

### Server Creation

**Q: How do I check if my server configuration is valid before creating?**
A: Use `list_projects` to find on-demand projects, `get_plan` to see plan details, `list_regions` to check region availability, then `create_server` to deploy.

**Q: What's the recommended server creation workflow?**
A: Use `list_projects` to find on-demand projects, `get_plan` to see plan details, `list_regions` to check region availability, then `create_server` to deploy.

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

### v0.5.0 (Current)

- **🎉 Full Cursor Compatibility**: All 29 tools now work perfectly in Cursor
- **🔄 Parameter Transformation**: Automatic conversion from Cursor-friendly names to API format
- **📚 Updated Documentation**: Complete parameter mapping and examples
- **✅ No More Validation Errors**: All tools pass Cursor's parameter validation
- **🚀 Better UX**: Cleaner, more intuitive parameter names

### v0.4.0

- **Updated `update_server` Tool**: Now supports official API parameters (hostname, billing, tags, project)
- **Complete Tool Documentation**: All 28 tools fully documented with examples
- **Enhanced Documentation**: Updated README.md and USAGE.md with accurate schemas
- **Script Consolidation**: Streamlined development workflow
- **Improved Examples**: Real-world usage examples for all tools
- **Simplified Workflow**: Removed `get_server_creation_flow` and `validate_server_config` for direct approach

### v0.3.0

- **Enhanced Plans**: Added `get_plan` with detailed specifications
- **Region Management**: Added `list_regions` and `get_region` tools
- **Improved Error Handling**: Better error messages and validation
- **Updated Scripts**: Streamlined script collection

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
