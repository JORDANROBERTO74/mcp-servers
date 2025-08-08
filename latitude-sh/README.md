# Latitude.sh MCP Server

A comprehensive Model Context Protocol (MCP) server that provides intelligent access to your Latitude.sh infrastructure, including projects, servers, plans, and smart server creation workflows.

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

### 🧠 Smart Server Creation

- **Get Server Creation Flow**: Intelligent workflow with real-time validation
- **Validate Server Config**: Pre-validate configurations before creation
- **Get Available Plans**: List all plans with specifications and pricing
- **Get Available Regions**: Check region availability for specific plans

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

| Script                           | Description                       |
| -------------------------------- | --------------------------------- |
| `run-create-server.js`           | Smart interactive server creation |
| `run-list-projects.js`           | List all projects                 |
| `run-list-projects-on_demand.js` | List only on-demand projects      |
| `run-list-plans.js`              | List all available server plans   |
| `run-list-servers.js`            | List all servers                  |
| `run-get-project.js`             | Get details of a specific project |
| `run-get-server.js`              | Get details of a specific server  |
| `run-create-project.js`          | Create a new project              |
| `run-update-project.js`          | Update an existing project        |
| `run-delete-project.js`          | Delete a project                  |
| `run-delete-server.js`           | Delete a server                   |
| `run-search-projects.js`         | Search projects by query          |

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
  "status": "deploying", // Optional: any string status
  "projectId": "proj_123456789", // Optional: Convenience filter by project ID
  "filter[project]": "proj_123456789", // Optional: Filter by project ID or slug
  "filter[region]": "NYC", // Optional: Filter by region
  "filter[hostname]": "name", // Optional: Filter by hostname
  "filter[plan]": "c2-small-x86" // Optional: Filter by plan
}
```

#### `create_server`

```json
{
  "project": "proj_123456789", // Required: Project ID
  "plan": "c2-small-x86", // Required: Plan slug
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
  "billing": "monthly", // Optional: hourly, monthly, yearly
  "tags": ["tag1", "tag2"], // Optional: Array of tag IDs
  "project": "proj_newProject123" // Optional: Move to different project
}
```

#### `delete_server`

```json
{
  "server_id": "sv_123456789", // Required: Server ID
  "reason": "Server no longer needed", // Optional: Reason for deletion
  "confirm": true // Required: Set to true to confirm deletion
}
```

#### `validate_server_config`

```json
{
  "project_id": "proj_123456789", // Required: Project ID
  "plan": "c2-small-x86", // Required: Plan slug
  "region": "NYC", // Required: Region code
  "operating_system": "ubuntu_24_04_x64_lts" // Optional: OS to validate
}
```

## 📖 Response Format

All tools return responses in the following format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Formatted response content with emojis and structured information"
    }
  ]
}
```

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
5. **Validate Configuration**: Use `validate_server_config` before creating servers

## 📝 Changelog

### v0.4.0 (Current)

- **Updated `update_server` Tool**: Now supports official API parameters (hostname, billing, tags, project)
- **Complete Tool Documentation**: All 17 tools fully documented with examples
- **Enhanced Documentation**: Updated README.md and USAGE.md with accurate schemas
- **Script Consolidation**: Streamlined to 12 essential scripts
- **Improved Examples**: Real-world usage examples for all tools

### v0.3.0

- **Smart Server Creation**: Added intelligent server creation workflow
- **Pre-validation**: Added `validate_server_config` tool
- **Enhanced Plans**: Added `get_available_plans` with detailed specifications
- **Region Availability**: Added `get_available_regions` tool
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
