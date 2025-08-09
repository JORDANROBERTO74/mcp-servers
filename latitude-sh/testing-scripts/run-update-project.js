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
  console.log("Usage: node run-update-project.js <project_id>");
  console.log("Example: node run-update-project.js my-project-id");
  process.exit(1);
}

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}

console.log("🔧 Interactive Project Update Tool");
console.log("===================================");
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

// Function to ask for optional field
async function askOptionalField(
  fieldName,
  description,
  currentValue = null,
  validator = null
) {
  const prompt = currentValue
    ? `📝 ${fieldName} (OPTIONAL) [current: ${currentValue}]: ${description}\n   Leave empty to keep current value, or enter new value\n> `
    : `📝 ${fieldName} (OPTIONAL): ${description}\n   Leave empty to skip\n> `;

  const value = await askQuestion(prompt);

  if (!value) {
    return undefined; // Keep current value or skip
  }

  if (validator && !validator(value)) {
    console.log("❌ Invalid value. Skipping this field.");
    return undefined;
  }

  return value;
}

// Function to ask for enum field
async function askEnumField(fieldName, description, options, currentValue) {
  console.log(`📝 ${fieldName} (OPTIONAL): ${description}`);
  console.log(`   Options: ${options.join(", ")}`);
  console.log(`   Current: ${currentValue || "Not set"}`);

  const value = await askQuestion(
    `   Leave empty to keep current, or enter new value > `
  );

  if (!value) {
    return undefined; // Keep current value
  }

  if (!options.includes(value)) {
    console.log(`❌ Invalid option. Keeping current value: ${currentValue}`);
    return undefined;
  }

  return value;
}

// Function to ask for tags
async function askTags(currentTags = []) {
  console.log(`📝 Tags (OPTIONAL): Enter tags separated by commas`);
  console.log(
    `   Current tags: ${
      currentTags.length > 0 ? currentTags.join(", ") : "No tags"
    }`
  );

  const tagsInput = await askQuestion(
    "   Leave empty to keep current, or enter new tags > "
  );

  if (!tagsInput) {
    return undefined; // Keep current tags
  }

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return tags.length > 0 ? tags : undefined;
}

// Main function to collect project update data
async function collectProjectUpdateData() {
  console.log("\n🎯 Let's update the project!");
  console.log("Leave fields empty to keep current values.\n");

  // Optional fields (we don't know current values, so we ask generically)
  const name = await askOptionalField(
    "Project Name",
    "Enter new name (1-100 characters)"
  );

  const description = await askOptionalField(
    "Description",
    "Enter new description (max 500 characters)"
  );

  const environment = await askEnumField(
    "Environment",
    "Select new environment type",
    ["Development", "Production", "Staging"],
    "Current value"
  );

  const tags = await askTags();

  // Build the project update data (only include fields that were provided)
  const projectData = {
    ...(name && { name }),
    ...(description && { description }),
    ...(environment && { environment }),
    ...(tags && tags.length > 0 && { tags }),
  };

  // Check if any updates were provided
  if (Object.keys(projectData).length === 0) {
    console.log("\n❌ No updates provided. Operation cancelled.");
    rl.close();
    return null;
  }

  console.log("\n📋 Project Update Summary:");
  console.log("==========================");
  if (projectData.name) console.log(`New Name: ${projectData.name}`);
  if (projectData.description)
    console.log(`New Description: ${projectData.description}`);
  if (projectData.environment)
    console.log(`New Environment: ${projectData.environment}`);
  if (projectData.tags) console.log(`New Tags: ${projectData.tags.join(", ")}`);

  const confirm = await askQuestion(
    "\n✅ Proceed with project update? (y/n): "
  );

  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log("❌ Project update cancelled.");
    rl.close();
    return null;
  }

  return projectData;
}

// Function to send request to MCP server
async function sendToMCPServer(projectId, projectData) {
  return new Promise((resolve, reject) => {
    console.log("\n🚀 Sending request to MCP server...");

    // Spawn the server process
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

    // Send the request
    const updateProjectMessage =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "update_project",
          arguments: {
            projectId: projectId,
            ...projectData,
          },
        },
      }) + "\n";

    serverProcess.stdin.write(updateProjectMessage);
    serverProcess.stdin.end();
  });
}

// Main execution
async function main() {
  try {
    const projectData = await collectProjectUpdateData();

    if (!projectData) {
      return;
    }

    const response = await sendToMCPServer(projectIdArg, projectData);

    console.log("\n📥 Response received:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n📋 Updated Project Details:");
      console.log(response.result.content[0].text);
      console.log("\n🎉 Project update completed successfully!");
    } else if (response.error) {
      console.log("\n❌ Error updating project:");
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

// Start the interactive tool
main();
