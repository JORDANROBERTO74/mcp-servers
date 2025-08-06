import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project update configuration
const projectId = "proj_bBmw0KyKv59VR"; // ID del proyecto prueba-09
const updateData = {
  name: "ultimo-project",
  description: "Proyecto actualizado con nuevo nombre",
};

console.log(`🔄 Updating project ${projectId}...`);
console.log("Update data:", JSON.stringify(updateData, null, 2));

// Spawn the MCP server process
const mcpProcess = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

let output = "";
let errorOutput = "";

// Collect all output
mcpProcess.stdout.on("data", (data) => {
  output += data.toString();
  console.log("STDOUT:", data.toString());
});

mcpProcess.stderr.on("data", (data) => {
  errorOutput += data.toString();
  console.log("STDERR:", data.toString());
});

mcpProcess.on("close", (code) => {
  console.log(`MCP process exited with code ${code}`);
  console.log("Final output:", output);
  console.log("Final error output:", errorOutput);
});

// Wait a moment for the server to start, then send the request
setTimeout(() => {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "update_project",
      arguments: {
        projectId: projectId,
        ...updateData,
      },
    },
  };

  console.log(
    "Sending update request to MCP server:",
    JSON.stringify(request, null, 2)
  );
  mcpProcess.stdin.write(JSON.stringify(request) + "\n");

  // Close stdin after sending the request
  setTimeout(() => {
    mcpProcess.stdin.end();
  }, 1000);
}, 2000);

// Handle process errors
mcpProcess.on("error", (error) => {
  console.error("Failed to start MCP process:", error);
});
