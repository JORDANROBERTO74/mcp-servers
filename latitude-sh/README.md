# Latitude.sh MCP Server

A Model Context Protocol (MCP) server that provides access to your latitude.sh projects and files.

## Features

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

## Installation

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

Update an existing project in latitude.sh.

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

All tools return responses in the following format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Formatted response content"
    }
  ]
}
```

## Error Handling

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

1. Check the error messages for troubleshooting hints
2. Verify your API key is correct
3. Test the connection using the `test_connection` tool
4. Check the latitude.sh API documentation for endpoint changes

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
