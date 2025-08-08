#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync } from "fs";

// Load environment variables from .env.local
try {
  const envPath = new URL(".env.local", import.meta.url);
  const envContent = readFileSync(envPath, "utf8");

  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (value && !value.startsWith("#")) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, "");
      }
    }
  });
} catch (error) {
  console.log("⚠️ Warning: Could not load .env.local file");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get server ID and reason from command line arguments
const serverId = process.argv[2];
const reason = process.argv[3] || "Server deletion requested via MCP server";

if (!serverId) {
  console.error("❌ Error: Server ID is required");
  console.log("Usage: node run-delete-server.js <server_id> [reason]");
  console.log("Example: node run-delete-server.js sv_MDEOaPBWWNwgB");
  console.log(
    "Example: node run-delete-server.js sv_MDEOaPBWWNwgB 'Server no longer needed'"
  );
  process.exit(1);
}

console.log("🗑️ Deleting Server");
console.log("==================");
console.log(`📤 Server ID: ${serverId}`);
console.log(`📝 Reason: ${reason}`);
console.log("📤 Sending delete server request...");

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}

console.log("API Key configured: Yes");

// Request data for deleting a server
const deleteServerData = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "delete_server",
    arguments: {
      server_id: serverId,
      reason: reason,
      confirm: true,
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

// Main execution
async function main() {
  try {
    console.log("\n📤 Sending request to MCP server...");

    const response = await sendToMCPServer(deleteServerData);

    console.log("\n📥 Response received:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n📋 Server Deletion Result:");
      console.log(response.result.content[0].text);
    } else {
      console.log("\n❌ Unexpected response format");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
