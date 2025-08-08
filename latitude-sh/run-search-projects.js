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
  console.log("🚀 Search Projects");
  console.log("==================");
  console.log("");
  console.log("Usage: node run-search-projects.js <query> [limit] [page]");
  console.log("");
  console.log("Arguments:");
  console.log("  query   Search query to find projects (required)");
  console.log("  limit   Maximum number of results (1-100, default: 50)");
  console.log("  page    Page number for pagination (default: 1)");
  console.log("");
  console.log("Examples:");
  console.log("  node run-search-projects.js react");
  console.log("  node run-search-projects.js web 25");
  console.log("  node run-search-projects.js api 10 2");
  process.exit(0);
}

// Validate CLI arguments
const [query] = validateArgs(
  ["query"],
  "node run-search-projects.js <query> [limit] [page]"
);

const limit = process.argv[3] ? parseInt(process.argv[3]) : 50;
const page = process.argv[4] ? parseInt(process.argv[4]) : 1;

// Validate numeric arguments
if (isNaN(limit) || limit < 1 || limit > 100) {
  console.error("❌ Error: limit must be a number between 1 and 100");
  process.exit(1);
}

if (isNaN(page) || page < 1) {
  console.error("❌ Error: page must be a number greater than 0");
  process.exit(1);
}

async function main() {
  try {
    showHeader(
      "Search Projects",
      `Query: "${query}" | Limit: ${limit} | Page: ${page}`
    );

    console.log("📤 Sending search_projects request...");
    console.log("API Key configured: Yes");

    const result = await sendToMCPServer("search_projects", {
      query: query,
      limit: limit,
      page: page,
    });

    displayResult(result, "Search Results");
  } catch (error) {
    handleError(error, "searching projects");
  }
}

main();
