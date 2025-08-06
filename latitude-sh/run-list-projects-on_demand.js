#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to send request to MCP server
async function sendToMCPServer(requestData) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn("node", ["dist/index.js"], {
      cwd: __dirname,
      stdio: ["pipe", "pipe", "pipe"],
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
    serverProcess.stdin.write(JSON.stringify(requestData) + "\n");
    serverProcess.stdin.end();
  });
}

// Function to test connection
async function testConnection() {
  try {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "test_connection",
        arguments: {},
      },
    };

    const response = await sendToMCPServer(request);

    if (response.result && response.result.content) {
      console.log("✅ " + response.result.content[0].text);
      return true;
    } else {
      console.log("❌ Connection test failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing connection:", error.message);
    return false;
  }
}

// Function to list and filter on-demand projects
async function listOnDemandProjects() {
  try {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "list_projects",
        arguments: {
          limit: 50,
          page: 1,
        },
      },
    };

    console.log("🔍 Fetching projects from Latitude.sh API...");
    const response = await sendToMCPServer(request);

    if (response.result && response.result.content) {
      const projectText = response.result.content[0].text;

      // Extract project information using regex for the actual formatted response
      const projectRegex =
        /📁\s+\*\*([^*]+)\*\*\s+\(ID:\s+([^)]+)\)[\s\S]*?📝\s+Description:\s+([^\n]+)[\s\S]*?👤\s+Team:\s+([^\n]+)[\s\S]*?📅\s+Created:\s+([^\n]+)[\s\S]*?📅\s+Updated:\s+([^\n]+)[\s\S]*?🌍\s+Environment:\s+([^\n]+)[\s\S]*?💳\s+Billing:\s+([^\n]+)[\s\S]*?⚙️\s+Provisioning:\s+([^\n]+)[\s\S]*?🏷️\s+Tags:\s+([^\n]+)[\s\S]*?📊\s+Stats:\s+([^\n]+)/g;

      const onDemandProjects = [];
      let match;
      let totalProjects = 0;

      while ((match = projectRegex.exec(projectText)) !== null) {
        totalProjects++;
        const project = {
          name: match[1].trim(),
          id: match[2].trim(),
          description: match[3].trim(),
          team: match[4].trim(),
          created: match[5].trim(),
          updated: match[6].trim(),
          environment: match[7].trim(),
          billing: match[8].trim(),
          provisioningType: match[9].trim(),
          tags: match[10].trim(),
          stats: match[11].trim(),
        };

        // Only include projects with provisioning_type "on_demand"
        if (project.provisioningType === "on_demand") {
          onDemandProjects.push(project);
        }
      }

      console.log("\n" + "=".repeat(60));
      console.log("🚀 ON-DEMAND PROJECTS SUMMARY");
      console.log("=".repeat(60));
      console.log(`📊 Total projects found: ${totalProjects}`);
      console.log(`🎯 On-demand projects: ${onDemandProjects.length}`);
      console.log(
        `🔄 Filtered ratio: ${onDemandProjects.length}/${totalProjects}`
      );

      if (onDemandProjects.length === 0) {
        console.log(
          "\n❌ No projects with provisioning_type 'on_demand' found."
        );
        console.log(
          "💡 On-demand projects are required for dynamic server creation."
        );
        console.log(
          "🔧 Consider creating a project with provisioning_type 'on_demand' in your Latitude.sh dashboard."
        );
        return false;
      }

      console.log("\n" + "=".repeat(60));
      console.log("📋 ON-DEMAND PROJECTS DETAILS");
      console.log("=".repeat(60));

      onDemandProjects.forEach((project, index) => {
        console.log(`\n${index + 1}. 📁 **${project.name}**`);
        console.log(`   🆔 ID: ${project.id}`);
        console.log(`   📝 Description: ${project.description}`);
        console.log(`   👤 Team: ${project.team}`);
        console.log(`   🌍 Environment: ${project.environment}`);
        console.log(`   💳 Billing: ${project.billing}`);
        console.log(`   ⚙️ Provisioning Type: ${project.provisioningType}`);
        console.log(`   🏷️ Tags: ${project.tags}`);
        console.log(`   📊 Stats: ${project.stats}`);
        console.log(`   📅 Created: ${project.created}`);
        console.log(`   📅 Updated: ${project.updated}`);

        // Add visual separator between projects
        if (index < onDemandProjects.length - 1) {
          console.log("   " + "-".repeat(50));
        }
      });

      console.log("\n" + "=".repeat(60));
      console.log("💡 USAGE TIPS");
      console.log("=".repeat(60));
      console.log("🚀 These projects can be used with run-create-server.js");
      console.log("📋 Copy the Project ID to use in server creation");
      console.log("🔧 On-demand projects support dynamic server provisioning");

      return true;
    } else {
      console.log("❌ Failed to fetch projects");
      console.log("🔍 Response:", response);
      return false;
    }
  } catch (error) {
    console.error("❌ Error listing projects:", error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log("🎯 ON-DEMAND PROJECTS LISTER");
  console.log("============================");
  console.log(
    "📋 This tool lists only projects with provisioning_type 'on_demand'"
  );
  console.log("🚀 These projects can be used for dynamic server creation\n");

  try {
    // Test connection first
    console.log("🔗 Testing connection to Latitude.sh API...");
    const connectionOk = await testConnection();

    if (!connectionOk) {
      console.log("❌ Cannot proceed without API connection");
      console.log(
        "🔧 Please check your API credentials and network connection"
      );
      process.exit(1);
    }

    // List on-demand projects
    const success = await listOnDemandProjects();

    if (success) {
      console.log("\n✅ Successfully listed on-demand projects!");
    } else {
      console.log("\n❌ Failed to list on-demand projects");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, exiting gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, exiting gracefully...");
  process.exit(0);
});

// Run the script
main();
