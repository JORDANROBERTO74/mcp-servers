#!/usr/bin/env node

import {
  loadEnvironment,
  sendToMCPServer,
  checkAPIKey,
  displayResult,
  handleError,
  showHeader,
  validateArgs,
} from "./script-helpers.js";

// Load environment and check API key
loadEnvironment();
checkAPIKey();

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("🚀 Get Server Details");
  console.log("=====================");
  console.log("");
  console.log("Usage: node run-get-server.js <server_id>");
  console.log("");
  console.log("Arguments:");
  console.log("  server_id   The ID of the server to retrieve (required)");
  console.log("");
  console.log("Examples:");
  console.log("  node run-get-server.js sv_AbC123xyz");
  console.log("  node run-get-server.js sv_MDEOaPBWWNwgB");
  process.exit(0);
}

// Validate CLI arguments
const [serverId] = validateArgs(
  ["server_id"],
  "node run-get-server.js <server_id>"
);

async function main() {
  try {
    showHeader("Get Server Details", `Retrieving server: ${serverId}`);

    console.log("📤 Sending get_server request...");
    console.log("API Key configured: Yes");

    const result = await sendToMCPServer("get_server", {
      serverId: serverId,
    });

    displayResult(result, "Server Details");
  } catch (error) {
    handleError(error, "retrieving server details");
  }
}

main();
