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
import readline from "readline";

// Load environment and check API key
loadEnvironment();
checkAPIKey();

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("🚀 Delete Server");
  console.log("================");
  console.log("");
  console.log(
    "Usage: node run-delete-server.js <server_id> [reason] [--force]"
  );
  console.log("");
  console.log("Arguments:");
  console.log("  server_id   The ID of the server to delete (required)");
  console.log("  reason      Reason for deletion (optional)");
  console.log("  --force     Skip confirmation prompt (optional)");
  console.log("");
  console.log("Examples:");
  console.log("  node run-delete-server.js sv_MDEOaPBWWNwgB");
  console.log(
    "  node run-delete-server.js sv_MDEOaPBWWNwgB 'Server no longer needed'"
  );
  console.log("  node run-delete-server.js sv_MDEOaPBWWNwgB 'Cleanup' --force");
  process.exit(0);
}

// Validate CLI arguments
const [serverId] = validateArgs(
  ["server_id"],
  "node run-delete-server.js <server_id> [reason] [--force]"
);

const reason = process.argv[3] || "Server deletion requested via MCP script";
const isForced = process.argv.includes("--force");

// Helper function to ask for confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  try {
    showHeader("Delete Server", `Server: ${serverId}`);

    console.log(`📤 Server ID: ${serverId}`);
    console.log(`📝 Reason: ${reason}`);
    console.log("API Key configured: Yes");

    // Ask for confirmation unless forced
    if (!isForced) {
      console.log("\n⚠️  WARNING: This action cannot be undone!");
      console.log("The server and all its data will be permanently deleted.");

      const confirmed = await askConfirmation(
        "\nAre you sure you want to delete this server?"
      );

      if (!confirmed) {
        console.log("❌ Server deletion cancelled.");
        process.exit(0);
      }
    }

    console.log("\n📤 Sending delete_server request...");

    const result = await sendToMCPServer("delete_server", {
      server_id: serverId,
      reason: reason,
      confirm: true,
    });

    displayResult(result, "Server Deletion Result");
  } catch (error) {
    handleError(error, "deleting server");
  }
}

main();
