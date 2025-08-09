# Testing Scripts

⚠️ **These are testing/development scripts, NOT the actual MCP server.**

## Purpose

These scripts are used for:

- **Development testing** of the Latitude.sh API integration
- **Manual debugging** of API calls
- **Example usage** during development

## How they work

Each script:

1. Spawns the MCP server (`../dist/index.js`)
2. Sends a JSON-RPC request to it
3. Displays the response

## Usage

```bash
# Make sure the server is built first
cd ..
npm run build

# Then run any test script
cd testing-scripts
node run-list-projects.js
node run-create-server.js
# etc...
```

## Important Notes

- ✅ **For production**: Use the MCP server directly (`dist/index.js`) with an MCP client
- ❌ **Don't use these scripts** for actual application integration
- 🔧 **These are development tools only**

## Available Scripts

| Script                   | Description             |
| ------------------------ | ----------------------- |
| `run-list-projects.js`   | List all projects       |
| `run-get-project.js`     | Get project details     |
| `run-search-projects.js` | Search projects         |
| `run-create-project.js`  | Create new project      |
| `run-update-project.js`  | Update existing project |
| `run-delete-project.js`  | Delete project          |
| `run-list-servers.js`    | List all servers        |
| `run-create-server.js`   | Create new server       |
| `run-get-server.js`      | Get server details      |
| `run-delete-server.js`   | Delete server           |
| `run-list-plans.js`      | List available plans    |
