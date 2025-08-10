#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
import { resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, ".env.local") });

// Get projectId from CLI
const projectIdArg = process.argv[2];

if (!projectIdArg) {
  console.error("❌ Error: Project ID is required");
  console.log("Usage: node run-get-project.js <project_id>");
  console.log("Example: node run-get-project.js my-project-id");
  process.exit(1);
}

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}

console.log(`📁 Getting Project Details: ${projectIdArg}`);
console.log("=======================================");
console.log("API Key configured: Yes");

// Request data for getting a specific project
const getProjectData = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "get_project",
    arguments: {
      projectId: projectIdArg,
    },
  },
};

// Function to send request to MCP server
async function sendToMCPServer(requestData) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn("node", ["dist/index.js"], {
      cwd: __dirname,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        LATITUDE_API_KEY: process.env.LATITUDE_API_KEY,
      },
    });

    let responseData = "";
    let errorData = "";

    serverProcess.stdout.on("data", (data) => {
      responseData += data.toString();
    });

    serverProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    serverProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ Server process exited with code:", code);
        console.error("Error output:", errorData);
        reject(new Error(`Server process exited with code ${code}`));
        return;
      }

      try {
        const response = JSON.parse(responseData);
        resolve(response);
      } catch (error) {
        console.error("❌ Failed to parse response:", error);
        console.error("Raw response:", responseData);
        reject(error);
      }
    });

    // Send the request
    serverProcess.stdin.write(JSON.stringify(requestData) + "\n");
    serverProcess.stdin.end();
  });
}

// Main function
async function main() {
  try {
    console.log("📤 Sending get project request...");

    const response = await sendToMCPServer(getProjectData);

    console.log("\n📥 Response received:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n📋 Project Details:");
      console.log(response.result.content[0].text);
    } else if (response.error) {
      console.log("\n❌ Error getting project:");
      console.log("Error:", response.error);
    } else {
      console.log("\n❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Error getting project:", error.message);
  }
}

// Run the get project
main().catch(console.error);
