# Latitude.sh MCP Server - Usage Guide

This guide shows you how to use the latitude.sh MCP server with practical examples.

## Quick Start

### 1. Installation

```bash
# Clone and install dependencies
cd latitude-sh
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local and add your API key
npm run build
```

### 2. Configuration

Edit your `.env.local` file:

```bash
# Required: Your Latitude.sh API key
LATITUDE_API_KEY=your-api-key-here

# Optional: Base URL for the API
LATITUDE_BASE_URL=https://api.latitude.sh

# Optional: Request timeout in milliseconds
LATITUDE_TIMEOUT=10000
```

### 3. Basic Usage

```bash
# Run the built server
node dist/index.js

# Or run in development mode
npm run dev
```

### 4. Test Connection

The server will automatically test the connection on startup. You should see:

```
Latitude.sh MCP Server running on stdio
✅ Successfully connected to latitude.sh API
```

## Tool Examples

### 1. List All Projects

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_projects",
    "arguments": {
      "limit": 10,
      "status": "active"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 5 projects (Page 1 of 1):\n\n📁 **My React App** (ID: proj_123)\n📝 Description: A modern React application\n👤 Owner: John Doe (john@example.com)\n📅 Created: 1/15/2024\n📅 Updated: 2/20/2024\n🏷️ Status: active\n🔒 Visibility: private\n🏷️ Tags: react, javascript\n⚙️ Framework: React\n💻 Language: JavaScript\n---"
      }
    ]
  }
}
```

### 2. Get Project Details

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_project",
    "arguments": {
      "projectId": "proj_123456789"
    }
  }
}
```

### 3. Search Projects

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_projects",
    "arguments": {
      "query": "machine learning",
      "limit": 5,
      "status": "active"
    }
  }
}
```

### 4. Get Project Files

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_project_files",
    "arguments": {
      "projectId": "proj_123456789"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "📁 src\n📄 package.json (2.1 KB)\n📄 README.md (1.5 KB)\n📁 src/components\n📄 App.js (3.2 KB)\n📄 Header.js (1.8 KB)"
      }
    ]
  }
}
```

### 5. Create Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "create_project",
    "arguments": {
      "name": "My New Project",
      "description": "A new project description",
      "environment": "Development",
      "provisioning_type": "on_demand",
      "billing_type": "Normal",
      "tags": ["javascript", "react"]
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Project created successfully!\n\n📁 **My New Project** (ID: proj_123)\n📝 Description: A new project description\n👤 Owner: John Doe (john@example.com)\n📅 Created: 1/15/2024\n📅 Updated: 1/15/2024\n🏷️ Status: active\n🔒 Visibility: private\n🏷️ Tags: javascript, react\n⚙️ Framework: Development\n---"
      }
    ]
  }
}
```

### 6. Update Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "update_project",
    "arguments": {
      "projectId": "proj_123456789",
      "name": "Updated Project Name",
      "description": "Updated project description",
      "environment": "Production",
      "tags": ["updated", "production"]
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Project updated successfully!\n\n📁 **Updated Project Name** (ID: proj_123456789)\n📝 Description: Updated project description\n👤 Owner: John Doe (john@example.com)\n📅 Created: 1/15/2024\n📅 Updated: 2/20/2024\n🏷️ Status: active\n🔒 Visibility: private\n🏷️ Tags: updated, production\n⚙️ Framework: Production\n---"
      }
    ]
  }
}
```

### 7. Delete Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "delete_project",
    "arguments": {
      "projectId": "proj_123456789",
      "confirm": true
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Project proj_123456789 deleted successfully!"
      }
    ]
  }
}
```

**Error Response (without confirmation):**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "❌ Project deletion cancelled. Please set 'confirm' to true to proceed with deletion."
      }
    ],
    "isError": true
  }
}
```

### 8. List All Servers

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "list_servers",
    "arguments": {
      "limit": 50,
      "page": 1,
      "status": "running"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 2 servers (Page 1 of 1):\n\n🖥️ **Web Server** (ID: srv_123)\n📝 Description: Production web server\n🏷️ Status: 🟢 running\n🌍 Region: lat-south-1\n💻 Plan: lat-cpu-1\n📊 Specs: 1 CPU, 1 GB RAM, 25 GB SSD\n📅 Created: 1/15/2024\n📅 Updated: 2/20/2024\n🏷️ Tags: web, production\n---\n\n🖥️ **Database Server** (ID: srv_456)\n📝 Description: PostgreSQL database server\n🏷️ Status: 🟢 running\n🌍 Region: lat-south-1\n💻 Plan: lat-cpu-2\n📊 Specs: 2 CPU, 4 GB RAM, 100 GB SSD\n📅 Created: 1/10/2024\n📅 Updated: 2/18/2024\n🏷️ Tags: database, postgresql\n---"
      }
    ]
  }
}
```

### 9. Create Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "create_server",
    "arguments": {
      "name": "My New Server",
      "projectId": "proj_123456789",
      "regionId": "lat-south-1",
      "planId": "lat-cpu-1",
      "description": "A new server for testing",
      "tags": ["test", "development"]
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Server created successfully!\n\n🖥️ **My New Server** (ID: srv_789)\n📝 Description: A new server for testing\n🏷️ Status: 🟡 starting\n🌍 Region: lat-south-1\n💻 Plan: lat-cpu-1\n📊 Specs: 1 CPU, 1 GB RAM, 25 GB SSD\n📅 Created: 1/15/2024\n📅 Updated: 1/15/2024\n🏷️ Tags: test, development\n🌐 IP Address: 192.168.1.100\n🔑 SSH Port: 22\n---"
      }
    ]
  }
}
```

### 10. Get Server Details

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "get_server",
    "arguments": {
      "serverId": "srv_123456789"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🖥️ **Web Server** (ID: srv_123)\n📝 Description: Production web server\n🏷️ Status: 🟢 running\n🌍 Region: lat-south-1\n💻 Plan: lat-cpu-1\n📊 Specs: 1 CPU, 1 GB RAM, 25 GB SSD\n📅 Created: 1/15/2024\n📅 Updated: 2/20/2024\n🏷️ Tags: web, production\n🌐 IP Address: 192.168.1.100\n🔑 SSH Port: 22\n🔧 OS: Ubuntu 22.04 LTS\n💾 Storage: 25 GB SSD\n🌐 Network: Public IP enabled\n---"
      }
    ]
  }
}
```

### 11. Update Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "update_server",
    "arguments": {
      "serverId": "srv_123456789",
      "name": "Updated Server Name",
      "description": "Updated server description",
      "tags": ["updated", "production"]
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Server updated successfully!\n\n🖥️ **Updated Server Name** (ID: srv_123)\n📝 Description: Updated server description\n🏷️ Status: 🟢 running\n🌍 Region: lat-south-1\n💻 Plan: lat-cpu-1\n📊 Specs: 1 CPU, 1 GB RAM, 25 GB SSD\n📅 Created: 1/15/2024\n📅 Updated: 2/20/2024\n🏷️ Tags: updated, production\n🌐 IP Address: 192.168.1.100\n🔑 SSH Port: 22\n---"
      }
    ]
  }
}
```

### 12. Delete Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "delete_server",
    "arguments": {
      "serverId": "srv_123456789",
      "confirm": true
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Server srv_123456789 deleted successfully!"
      }
    ]
  }
}
```

**Error Response (without confirmation):**

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "❌ Server deletion cancelled. Set 'confirm' to true to proceed with deletion."
      }
    ]
  }
}
```

### 13. Test Connection

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "tools/call",
  "params": {
    "name": "test_connection",
    "arguments": {}
  }
}
```

## Integration Examples

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "latitude-sh": {
      "command": "node",
      "args": ["/path/to/latitude-sh/dist/index.js", "your-api-key-here"]
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
      "args": ["dist/index.js", "your-api-key-here"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Error Handling

### Common Errors

1. **Invalid API Key:**

   ```
   Error: Unauthorized: Invalid API key
   ```

2. **Project Not Found:**

   ```
   Error: Project not found
   ```

3. **Network Issues:**
   ```
   Error: Failed to connect to latitude.sh API
   ```

### Troubleshooting

1. **Check API Key:**

   ```bash
   # Test your API key
   curl -H "Authorization: Bearer your-api-key" \
        https://api.latitude.sh/user/profile
   ```

2. **Verify Network:**

   ```bash
   # Test API connectivity
   curl https://api.latitude.sh/health
   ```

3. **Check Server Logs:**
   ```bash
   # Run with verbose output
   node dist/index.js your-api-key 2>&1 | tee server.log
   ```

## Advanced Usage

### Filtering Projects

```json
{
  "name": "list_projects",
  "arguments": {
    "limit": 20,
    "page": 2,
    "status": "active",
    "tags": ["javascript", "react"],
    "owner": "user_123"
  }
}
```

### Pagination

```json
{
  "name": "list_projects",
  "arguments": {
    "limit": 10,
    "page": 1
  }
}
```

### Search with Filters

```json
{
  "name": "search_projects",
  "arguments": {
    "query": "machine learning",
    "limit": 15,
    "status": "active"
  }
}
```

### Creating Projects

```json
{
  "name": "create_project",
  "arguments": {
    "name": "My React App",
    "description": "A modern React application with TypeScript",
    "environment": "Development",
    "provisioning_type": "on_demand",
    "billing_type": "Normal",
    "tags": ["react", "typescript", "frontend"]
  }
}
```

### Updating Projects

```json
{
  "name": "update_project",
  "arguments": {
    "projectId": "proj_123456789",
    "name": "Updated React App",
    "description": "Updated description with new features",
    "environment": "Production",
    "tags": ["react", "typescript", "production"]
  }
}
```

### Deleting Projects

```json
{
  "name": "delete_project",
  "arguments": {
    "projectId": "proj_123456789",
    "confirm": true
  }
}
```

### Listing Servers

```json
{
  "name": "list_servers",
  "arguments": {
    "limit": 20,
    "page": 1,
    "status": "running",
    "projectId": "proj_123456789",
    "region": "lat-south-1",
    "plan": "lat-cpu-1",
    "tags": ["web", "production"]
  }
}
```

### Creating Servers

```json
{
  "name": "create_server",
  "arguments": {
    "name": "Production Web Server",
    "projectId": "proj_123456789",
    "regionId": "lat-south-1",
    "planId": "lat-cpu-2",
    "description": "High-performance web server for production",
    "sshKeys": ["ssh_key_123", "ssh_key_456"],
    "tags": ["web", "production", "nginx"],
    "userData": "#!/bin/bash\napt-get update\napt-get install -y nginx",
    "startupScript": "systemctl start nginx"
  }
}
```

### Updating Servers

```json
{
  "name": "update_server",
  "arguments": {
    "serverId": "srv_123456789",
    "name": "Updated Production Server",
    "description": "Updated description with new features",
    "tags": ["web", "production", "updated"],
    "sshKeys": ["ssh_key_789"]
  }
}
```

### Deleting Servers

```json
{
  "name": "delete_server",
  "arguments": {
    "serverId": "srv_123456789",
    "confirm": true
  }
}
```

## Security Best Practices

1. **Environment Variables:**

   ```bash
   export LATITUDE_API_KEY="your-api-key"
   node dist/index.js $LATITUDE_API_KEY
   ```

2. **API Key Rotation:**

   - Regularly rotate your API keys
   - Use different keys for different environments

3. **Access Control:**
   - Only grant necessary permissions
   - Monitor API usage

## Performance Tips

1. **Use Pagination:** Limit results to avoid large responses
2. **Cache Results:** Implement caching for frequently accessed data
3. **Error Handling:** Always handle potential API errors gracefully

## Support

For issues and questions:

1. Check the error messages for specific details
2. Verify your API key is correct and has proper permissions
3. Test the connection using the `test_connection` tool
4. Review the latitude.sh API documentation for endpoint changes
