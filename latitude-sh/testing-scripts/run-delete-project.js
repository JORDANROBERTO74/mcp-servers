#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
import { resolve } from "path";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, ".env.local") });

// Get projectId from CLI
const projectIdArg = process.argv[2];

if (!projectIdArg) {
  console.error("❌ Error: Project ID is required");
  console.log("Usage: node run-delete-project.js <project_id>");
  console.log("Example: node run-delete-project.js my-project-id");
  process.exit(1);
}

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}

console.log("🗑️ Project Deletion Tool");
console.log("========================");
console.log(`Project ID: ${projectIdArg}`);
console.log("API Key configured: Yes");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Function to get project details first
async function getProjectDetails(projectId) {
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
        reject(new Error(`Failed to get project details: ${errorData}`));
        return;
      }

      try {
        const response = JSON.parse(responseData);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });

    // Send get project request
    const getProjectMessage =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_project",
          arguments: { projectId },
        },
      }) + "\n";

    serverProcess.stdin.write(getProjectMessage);
    serverProcess.stdin.end();
  });
}

// Function to confirm deletion with multiple steps
async function confirmDeletion(projectId) {
  console.log("\n⚠️  WARNING: PROJECT DELETION IS IRREVERSIBLE!");
  console.log("===============================================");
  console.log("This action will permanently delete:");
  console.log("• The project and all its configuration");
  console.log("• All associated servers and resources");
  console.log("• All data and cannot be undone");

  // First confirmation
  const confirm1 = await askQuestion(
    `\n❓ Are you sure you want to delete project ${projectId}? (yes/no): `
  );

  if (confirm1.toLowerCase() !== "yes") {
    console.log("❌ Project deletion cancelled.");
    return false;
  }

  // Second confirmation with project ID
  const confirm2 = await askQuestion(
    `\n❓ Please type the project ID "${projectId}" to confirm: `
  );

  if (confirm2 !== projectId) {
    console.log("❌ Project ID mismatch. Deletion cancelled for safety.");
    return false;
  }

  // Final confirmation
  const confirm3 = await askQuestion(
    "\n❓ Type 'DELETE' in uppercase to proceed with deletion: "
  );

  if (confirm3 !== "DELETE") {
    console.log("❌ Final confirmation failed. Deletion cancelled.");
    return false;
  }

  return true;
}

// Function to send delete request to MCP server
async function sendDeleteRequest(projectId) {
  return new Promise((resolve, reject) => {
    console.log("\n🚀 Sending delete request to MCP server...");

    const serverProcess = spawn("node", ["dist/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: __dirname,
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

    // Send the delete request
    const deleteProjectMessage =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "delete_project",
          arguments: {
            projectId: projectId,
            confirm: true,
          },
        },
      }) + "\n";

    serverProcess.stdin.write(deleteProjectMessage);
    serverProcess.stdin.end();
  });
}

// Main execution
async function main() {
  try {
    console.log("\n📤 Getting project details first...");

    // Get project details to show what will be deleted
    try {
      const projectResponse = await getProjectDetails(projectIdArg);
      if (projectResponse.result && projectResponse.result.content) {
        console.log("\n📋 Project to be deleted:");
        console.log("========================");
        console.log(projectResponse.result.content[0].text);
      }
    } catch (error) {
      console.log(
        "\n⚠️  Could not fetch project details, but proceeding with deletion process..."
      );
    }

    // Confirm deletion with multiple steps
    const confirmed = await confirmDeletion(projectIdArg);

    if (!confirmed) {
      return;
    }

    // Send delete request
    const response = await sendDeleteRequest(projectIdArg);

    console.log("\n📥 Response received:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n📋 Deletion Result:");
      console.log(response.result.content[0].text);
      console.log("\n🎉 Project deletion completed successfully!");
    } else if (response.error) {
      console.log("\n❌ Error deleting project:");
      console.log("Error:", response.error);
    } else {
      console.log("\n❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, terminating...");
  rl.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, terminating...");
  rl.close();
  process.exit(0);
});

// Start the deletion tool
main();
