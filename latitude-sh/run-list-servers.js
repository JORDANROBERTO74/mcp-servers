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

console.log("🖥️ Listing All Servers");
console.log("======================");

// Request data for listing all servers
const listServersData = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "list_servers",
    arguments: {
      limit: 50,
      page: 1,
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
    console.log("📤 Sending list servers request...");
    console.log(
      "API Key configured:",
      process.env.LATITUDE_API_KEY ? "Yes" : "No"
    );

    const response = await sendToMCPServer(listServersData);

    console.log("\n📥 Response received:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n📋 Servers List:");
      console.log(response.result.content[0].text);
    } else if (response.error) {
      console.log("\n❌ Error listing servers:");
      console.log("Error:", response.error);
    } else {
      console.log("\n❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Error listing servers:", error.message);
  }
}

// Run the list
main().catch(console.error);
