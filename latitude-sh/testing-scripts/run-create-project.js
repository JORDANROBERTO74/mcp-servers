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

console.log("🚀 Interactive Project Creation Tool");
console.log("=====================================");

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}
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

// Function to ask for required field
async function askRequiredField(fieldName, description, validator = null) {
  while (true) {
    const value = await askQuestion(
      `📝 ${fieldName} (REQUIRED): ${description}\n> `
    );

    if (!value) {
      console.log("❌ This field is required. Please provide a value.");
      continue;
    }

    if (validator && !validator(value)) {
      console.log("❌ Invalid value. Please try again.");
      continue;
    }

    return value;
  }
}

// Function to ask for optional field
async function askOptionalField(
  fieldName,
  description,
  defaultValue = null,
  validator = null
) {
  const value = await askQuestion(
    `📝 ${fieldName} (OPTIONAL)${
      defaultValue ? ` [default: ${defaultValue}]` : ""
    }: ${description}\n> `
  );

  if (!value) {
    return defaultValue;
  }

  if (validator && !validator(value)) {
    console.log("❌ Invalid value. Using default.");
    return defaultValue;
  }

  return value;
}

// Function to ask for enum field
async function askEnumField(fieldName, description, options, defaultValue) {
  console.log(`📝 ${fieldName} (OPTIONAL): ${description}`);
  console.log(`   Options: ${options.join(", ")}`);

  const value = await askQuestion(`   [default: ${defaultValue}] > `);

  if (!value) {
    return defaultValue;
  }

  if (!options.includes(value)) {
    console.log(`❌ Invalid option. Using default: ${defaultValue}`);
    return defaultValue;
  }

  return value;
}

// Function to ask for tags
async function askTags() {
  const tagsInput = await askQuestion(
    "📝 Tags (OPTIONAL): Enter tags separated by commas\n> "
  );

  if (!tagsInput) {
    return undefined;
  }

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return tags.length > 0 ? tags : undefined;
}

// Main function to collect project data
async function collectProjectData() {
  console.log("\n🎯 Let's create a new project!");
  console.log("Please provide the following information:\n");

  // Required fields
  const name = await askRequiredField(
    "Project Name",
    "Enter the name of the project (1-100 characters)"
  );

  // Optional fields
  const description = await askOptionalField(
    "Description",
    "Enter project description (max 500 characters)"
  );

  const environment = await askEnumField(
    "Environment",
    "Select environment type",
    ["Development", "Production", "Staging"],
    "Development"
  );

  const provisioningType = await askEnumField(
    "Provisioning Type",
    "Select provisioning type",
    ["on_demand", "reserved"],
    "on_demand"
  );

  const billingType = await askEnumField(
    "Billing Type",
    "Select billing type",
    ["Normal", "Enterprise"],
    "Normal"
  );

  const billingMethod = await askEnumField(
    "Billing Method",
    "Select billing method",
    ["Normal", "Enterprise"],
    "Normal"
  );

  const tags = await askTags();

  // Build the project data
  const projectData = {
    name,
    ...(description && { description }),
    environment,
    provisioning_type: provisioningType,
    billing_type: billingType,
    billing_method: billingMethod,
    ...(tags && tags.length > 0 && { tags }),
  };

  console.log("\n📋 Project Data Summary:");
  console.log("=========================");
  console.log(`Name: ${projectData.name}`);
  console.log(`Description: ${projectData.description || "None"}`);
  console.log(`Environment: ${projectData.environment}`);
  console.log(`Provisioning Type: ${projectData.provisioning_type}`);
  console.log(`Billing Type: ${projectData.billing_type}`);
  console.log(`Billing Method: ${projectData.billing_method}`);
  console.log(
    `Tags: ${projectData.tags ? projectData.tags.join(", ") : "None"}`
  );

  const confirm = await askQuestion(
    "\n✅ Proceed with project creation? (y/n): "
  );

  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log("❌ Project creation cancelled.");
    rl.close();
    return null;
  }

  return projectData;
}

// Function to send request to MCP server
async function sendToMCPServer(projectData) {
  return new Promise((resolve, reject) => {
    console.log("\n🚀 Sending request to MCP server...");

    // Spawn the server process
    const serverProcess = spawn("node", ["dist/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: __dirname,
    });

    let response = null;

    // Capture server output
    serverProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        try {
          const parsed = JSON.parse(output);
          if (parsed.result && parsed.result.content) {
            response = parsed.result.content[0].text;
            console.log("\n📋 Server Response:");
            console.log(response);
          } else if (parsed.error) {
            response = `Error: ${parsed.error}`;
            console.log("\n❌ Server Error:");
            console.log(response);
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

    serverProcess.on("error", (error) => {
      reject(error);
    });

    serverProcess.on("exit", (code, signal) => {
      if (code === 0) {
        resolve(response);
      } else {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Send the request after a short delay
    setTimeout(() => {
      const createProjectMessage =
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "create_project",
            arguments: projectData,
          },
        }) + "\n";

      serverProcess.stdin.write(createProjectMessage);

      // Terminate after response
      setTimeout(() => {
        serverProcess.kill("SIGTERM");
      }, 3000);
    }, 2000);
  });
}

// Main execution
async function main() {
  try {
    const projectData = await collectProjectData();

    if (!projectData) {
      return;
    }

    const result = await sendToMCPServer(projectData);

    if (result && !result.includes("Error:")) {
      console.log("\n🎉 Project creation completed successfully!");
    } else {
      console.log(
        "\n❌ Project creation failed. Check the error message above."
      );
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
