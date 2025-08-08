#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Spawn the MCP server
const serverProcess = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

// Read query from CLI
const query = process.argv[2];
const limit = process.argv[3] ? Number(process.argv[3]) : 50;
const page = process.argv[4] ? Number(process.argv[4]) : 1;

if (!query) {
  console.error("❌ Error: Search query is required");
  console.log("Usage: node run-search-projects.js <query> [limit] [page]");
  console.log("Example: node run-search-projects.js react 25 1");
  process.exit(1);
}

// Prepare the search request
const searchRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "search_projects",
    arguments: {
      query,
      limit,
      page,
    },
  },
};

// Send the request to the server
serverProcess.stdin.write(JSON.stringify(searchRequest) + "\n");

let responseData = "";

serverProcess.stdout.on("data", (data) => {
  responseData += data.toString();

  // Check if we have a complete JSON response
  try {
    const response = JSON.parse(responseData);
    if (response.result) {
      console.log("Search Results:");
      console.log(response.result.content[0].text);
      serverProcess.kill();
    }
  } catch (e) {
    // Incomplete JSON, continue reading
  }
});

serverProcess.stderr.on("data", (data) => {
  console.error("Server Error:", data.toString());
});

serverProcess.on("close", (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
  }
});

// Handle errors
serverProcess.on("error", (error) => {
  console.error("Failed to start server:", error);
});
