#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get projectId from CLI
const projectIdArg = process.argv[2];

if (!projectIdArg) {
  console.error("❌ Error: Project ID is required");
  console.log("Usage: node run-get-project.js <project_id>");
  console.log("Example: node run-get-project.js proj_AbC123xyz");
  process.exit(1);
}

console.log(`🚀 Executing get_project for ${projectIdArg}...`);

// Spawn a new server process for this test
const serverProcess = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

// Capture server output
serverProcess.stdout.on("data", (data) => {
  const output = data.toString().trim();
  if (output) {
    console.log("📤 Response:", output);
    try {
      const response = JSON.parse(output);
      if (response.result && response.result.content) {
        console.log("\n📋 Project Details:");
        console.log(response.result.content[0].text);
      } else if (response.error) {
        console.log("❌ Error:", response.error);
      }
    } catch (e) {
      // Not JSON, just log as is
    }
  }
});

serverProcess.stderr.on("data", (data) => {
  const output = data.toString().trim();
  if (output && !output.includes("Successfully connected")) {
    console.log("📤 Server stderr:", output);
  }
});

// Handle server process events
serverProcess.on("error", (error) => {
  console.error("❌ Server process error:", error);
  process.exit(1);
});

serverProcess.on("exit", (code, signal) => {
  console.log(
    `📴 Server process exited with code ${code} and signal ${signal}`
  );
  process.exit(code || 0);
});

// Send get_project request after a short delay
setTimeout(() => {
  console.log(`📝 Sending get_project request for ${projectIdArg}...`);

  const getProjectMessage =
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_project",
        arguments: {
          projectId: projectIdArg,
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

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, terminating...");
  serverProcess.kill("SIGTERM");
});
