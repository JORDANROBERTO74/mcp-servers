#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
import { resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, ".env.local") });

console.log("📁 Listing On-Demand Projects Only");
console.log("===================================");

// Check if API key is configured
if (!process.env.LATITUDE_API_KEY) {
  console.error("❌ Error: LATITUDE_API_KEY environment variable is not set");
  console.log("Please set your Latitude.sh API key in the .env.local file");
  process.exit(1);
}

console.log("API Key configured: Yes");

// Alternative approach using the server creation flow tool
async function getOnDemandProjectsViaCreationFlow() {
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

    // Use the server creation flow tool which specifically returns on-demand projects
    const creationFlowMessage =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_server_creation_flow",
          arguments: {},
        },
      }) + "\n";

    serverProcess.stdin.write(creationFlowMessage);
    serverProcess.stdin.end();
  });
}

// Format on-demand projects for display
function formatOnDemandProjects(projects, total, filteredFrom) {
  if (!projects || projects.length === 0) {
    return "No on-demand projects found.";
  }

  let output = `Found ${total} on-demand project(s) (filtered from ${filteredFrom} total projects):\n\n`;

  projects.forEach((project, index) => {
    const attrs = project.attributes;
    output += `${index + 1}. 📁 **${attrs.name}** (ID: ${project.id})\n`;
    output += `   📝 Description: ${attrs.description || "No description"}\n`;
    output += `   🌍 Environment: ${attrs.environment}\n`;
    output += `   💳 Billing: ${attrs.billing_type} (${attrs.billing_method})\n`;
    output += `   📅 Created: ${new Date(attrs.created_at).toLocaleString()}\n`;
    output += `   🏷️ Tags: ${
      attrs.tags.length > 0 ? attrs.tags.join(", ") : "No tags"
    }\n`;
    output += `   📊 Stats: ${attrs.stats.servers} servers, ${attrs.stats.databases} databases\n\n`;
  });

  return output;
}

// Main function
async function main() {
  try {
    console.log("📤 Getting on-demand projects...");

    // Try the server creation flow approach first (more reliable for on-demand projects)
    const creationFlowResponse = await getOnDemandProjectsViaCreationFlow();

    if (creationFlowResponse.result && creationFlowResponse.result.content) {
      console.log("\n📥 Response received:");
      console.log(JSON.stringify(creationFlowResponse, null, 2));

      console.log("\n📋 On-Demand Projects (via Server Creation Flow):");
      console.log("================================================");
      console.log(creationFlowResponse.result.content[0].text);
    } else if (creationFlowResponse.error) {
      console.log("\n❌ Error getting on-demand projects:");
      console.log("Error:", creationFlowResponse.error);
    } else {
      console.log("\n❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Error listing on-demand projects:", error.message);
    console.log(
      "\n💡 Note: This tool shows projects suitable for server creation (on-demand type only)"
    );
    console.log("For all projects, use: node run-list-projects.js");
  }
}

// Run the list
main().catch(console.error);
