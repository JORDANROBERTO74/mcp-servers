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

// Parse CLI arguments for pagination
const pageSize = process.argv[2] ? parseInt(process.argv[2]) : 20;
const pageNumber = process.argv[3] ? parseInt(process.argv[3]) : 1;

async function main() {
  try {
    showHeader(
      "List Projects",
      `Page ${pageNumber}, showing ${pageSize} projects per page`
    );

    console.log("📤 Sending list_projects request...");
    console.log(`API Key configured: Yes`);

    const result = await sendToMCPServer("list_projects", {
      "page[size]": pageSize,
      "page[number]": pageNumber,
    });

    displayResult(result, "Projects List");
  } catch (error) {
    handleError(error, "listing projects");
  }
}

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("🚀 List Projects");
  console.log("================");
  console.log("");
  console.log("Usage: node run-list-projects.js [page_size] [page_number]");
  console.log("");
  console.log("Arguments:");
  console.log(
    "  page_size    Number of projects per page (1-100, default: 20)"
  );
  console.log("  page_number  Page number to retrieve (default: 1)");
  console.log("");
  console.log("Examples:");
  console.log(
    "  node run-list-projects.js                # List first 20 projects"
  );
  console.log(
    "  node run-list-projects.js 10             # List first 10 projects"
  );
  console.log(
    "  node run-list-projects.js 20 2           # List page 2 with 20 projects"
  );
  process.exit(0);
}

main();
