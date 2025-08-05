const { spawn } = require("child_process");
const path = require("path");

// Spawn the MCP server
const serverProcess = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

// Prepare the search request
const searchRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "search_projects",
    arguments: {
      query: "minimal",
      limit: 50,
      page: 1,
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
