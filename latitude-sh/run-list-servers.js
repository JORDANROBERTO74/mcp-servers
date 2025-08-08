#!/usr/bin/env node

import {
  loadEnvironment,
  sendToMCPServer,
  checkAPIKey,
  displayResult,
  handleError,
  showHeader,
} from "./script-helpers.js";

// Load environment and check API key
loadEnvironment();
checkAPIKey();

// Parse CLI arguments for pagination and filtering
const pageSize = process.argv[2] ? parseInt(process.argv[2]) : 50;
const pageNumber = process.argv[3] ? parseInt(process.argv[3]) : 1;
const projectId = process.argv[4]; // Optional project filter
const status = process.argv[5]; // Optional status filter

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("🚀 List Servers");
  console.log("===============");
  console.log("");
  console.log(
    "Usage: node run-list-servers.js [page_size] [page_number] [project_id] [status]"
  );
  console.log("");
  console.log("Arguments:");
  console.log("  page_size    Number of servers per page (1-100, default: 50)");
  console.log("  page_number  Page number to retrieve (default: 1)");
  console.log("  project_id   Filter by project ID (optional)");
  console.log("  status       Filter by server status (optional)");
  console.log("");
  console.log("Examples:");
  console.log(
    "  node run-list-servers.js                              # List first 50 servers"
  );
  console.log(
    "  node run-list-servers.js 20                           # List first 20 servers"
  );
  console.log(
    "  node run-list-servers.js 20 2                         # List page 2 with 20 servers"
  );
  console.log(
    "  node run-list-servers.js 20 1 proj_123456789          # List servers for specific project"
  );
  console.log(
    "  node run-list-servers.js 20 1 '' on                   # List only running servers"
  );
  process.exit(0);
}

// Validate numeric arguments
if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
  console.error("❌ Error: page_size must be a number between 1 and 100");
  process.exit(1);
}

if (isNaN(pageNumber) || pageNumber < 1) {
  console.error("❌ Error: page_number must be a number greater than 0");
  process.exit(1);
}

async function main() {
  try {
    const filters = [];
    if (projectId) filters.push(`Project: ${projectId}`);
    if (status) filters.push(`Status: ${status}`);

    const description = `Page ${pageNumber}, showing ${pageSize} servers per page${
      filters.length > 0 ? ` | Filters: ${filters.join(", ")}` : ""
    }`;
    showHeader("List Servers", description);

    console.log("📤 Sending list_servers request...");
    console.log("API Key configured: Yes");

    // Build arguments object
    const args = {
      "page[size]": pageSize,
      "page[number]": pageNumber,
    };

    if (projectId) {
      args.projectId = projectId;
    }

    if (status) {
      args.status = status;
    }

    const result = await sendToMCPServer("list_servers", args);

    displayResult(result, "Servers List");
  } catch (error) {
    handleError(error, "listing servers");
  }
}

main();
