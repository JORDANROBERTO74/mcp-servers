#!/usr/bin/env node

<<<<<<< Updated upstream
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Executing get_project for Project-test0...");

// Spawn a new server process for this test
const serverProcess = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});
=======
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
  console.log("🚀 Get Project Details");
  console.log("======================");
  console.log("");
  console.log("Usage: node run-get-project.js <project_id>");
  console.log("");
  console.log("Arguments:");
  console.log("  project_id   The ID of the project to retrieve (required)");
  console.log("");
  console.log("Examples:");
  console.log("  node run-get-project.js proj_AbC123xyz");
  console.log("  node run-get-project.js proj_MDEOaPE110wgB");
  process.exit(0);
}

// Validate CLI arguments
const [projectId] = validateArgs(
  ["project_id"],
  "node run-get-project.js <project_id>"
);
>>>>>>> Stashed changes

async function main() {
  try {
    showHeader("Get Project Details", `Retrieving project: ${projectId}`);

    console.log("📤 Sending get_project request...");
    console.log("API Key configured: Yes");

    const result = await sendToMCPServer("get_project", {
      projectId: projectId,
    });

<<<<<<< Updated upstream
// Send get_project request after a short delay
setTimeout(() => {
  console.log("📝 Sending get_project request for Project-test0...");

  const getProjectMessage =
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_project",
        arguments: {
          projectId: "proj_M3BeabomE0Lnb",
        },
      },
    }) + "\n";

  serverProcess.stdin.write(getProjectMessage);

  // Terminate after response
  setTimeout(() => {
    console.log("🛑 Terminating...");
    serverProcess.kill("SIGTERM");
  }, 3000);
}, 2000);

// Handle process termination
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, terminating...");
  serverProcess.kill("SIGTERM");
});
=======
    displayResult(result, "Project Details");
  } catch (error) {
    handleError(error, "retrieving project details");
  }
}
>>>>>>> Stashed changes

main();
