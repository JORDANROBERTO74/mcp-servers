import { spawn } from "child_process";
import readline from "readline";
import { loadEnvironment, checkAPIKey } from "./script-helpers.js";

// Load environment and check API key
loadEnvironment();
checkAPIKey();

// Helper function to ask questions
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Helper function to ask for selection from a list
function askSelection(prompt, options, allowCustom = false) {
  return new Promise(async (resolve) => {
    console.log(`\n${prompt}`);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    if (allowCustom) {
      console.log(`${options.length + 1}. Enter custom value`);
    }

    while (true) {
      const answer = await askQuestion(
        `\nSelect option (1-${options.length}${
          allowCustom ? ` or ${options.length + 1}` : ""
        }): `
      );
      const selection = parseInt(answer);

      if (selection >= 1 && selection <= options.length) {
        resolve(options[selection - 1]);
        break;
      } else if (allowCustom && selection === options.length + 1) {
        const customValue = await askQuestion("Enter custom value: ");
        if (customValue) {
          resolve(customValue);
          break;
        }
      } else {
        console.log("❌ Invalid selection. Please try again.");
      }
    }
  });
}

// Helper function to ask for confirmation
function askConfirmation(question) {
  return new Promise(async (resolve) => {
    while (true) {
      const answer = await askQuestion(`${question} (y/n): `);
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        resolve(true);
        break;
      } else if (
        answer.toLowerCase() === "n" ||
        answer.toLowerCase() === "no"
      ) {
        resolve(false);
        break;
      } else {
        console.log("❌ Please answer y/n");
      }
    }
  });
}

// Function to communicate with MCP server
function sendToMCPServer(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn("node", ["dist/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    mcpProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`MCP process exited with code ${code}: ${errorOutput}`)
        );
        return;
      }

      try {
        // Find JSON response in output
        const lines = output.split("\n");
        let jsonResponse = null;

        for (const line of lines) {
          if (
            line.trim().startsWith('{"result":') ||
            line.trim().startsWith('{"error":')
          ) {
            jsonResponse = JSON.parse(line.trim());
            break;
          }
        }

        if (!jsonResponse) {
          reject(new Error("No valid JSON response found"));
          return;
        }

        if (jsonResponse.error) {
          reject(new Error(jsonResponse.error.message || "MCP server error"));
          return;
        }

        resolve(jsonResponse.result);
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error.message}`));
      }
    });

    // Send request
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: method,
        arguments: params,
      },
    };

    mcpProcess.stdin.write(JSON.stringify(request) + "\n");
    mcpProcess.stdin.end();
  });
}

// Main function to create server using the smart approach
async function createServerSmart() {
  try {
    console.log("🚀 SMART SERVER CREATION");
    console.log("========================");
    console.log("Using MCP tools for intelligent server creation");
    console.log("API Key configured: Yes\n");

    // Step 1: Get the complete server creation flow
    console.log("📋 Step 1: Getting server creation flow...");
    const flowResult = await sendToMCPServer("get_server_creation_flow");
    console.log("\n" + flowResult.content[0].text);

    // Step 2: Interactive configuration
    console.log("\n🎯 Step 2: Configure your server");
    console.log("================================");

    // Get available projects
    console.log("\n📁 Getting available projects...");
    const projectsResult = await sendToMCPServer("list_projects", {
      "extra_fields[projects]": "stats",
    });

    // Parse projects and filter on-demand
    const projectLines = projectsResult.content[0].text.split("\n");
    const onDemandProjects = [];
    let currentProject = null;

    for (const line of projectLines) {
      // Look for project headers like "📁 **projct-08** (ID: proj_MDEOaPE110wgB)"
      const projectMatch = line.match(/📁 \*\*(.*?)\*\* \(ID: (proj_[^)]+)\)/);
      if (projectMatch) {
        if (currentProject) onDemandProjects.push(currentProject);
        currentProject = {
          id: projectMatch[2],
          name: projectMatch[1],
          provisioning: "",
        };
      } else if (line.includes("⚙️ Provisioning:") && currentProject) {
        currentProject.provisioning = line.split("⚙️ Provisioning: ")[1].trim();
      }
    }
    if (currentProject) onDemandProjects.push(currentProject);

    const validProjects = onDemandProjects.filter(
      (p) => p.provisioning === "on_demand"
    );

    if (validProjects.length === 0) {
      console.log(
        "❌ No on-demand projects found. Please create an on-demand project first."
      );
      return;
    }

    // Select project
    const projectOptions = validProjects.map((p) => `${p.name} (${p.id})`);
    const selectedProjectOption = await askSelection(
      "Select project:",
      projectOptions
    );
    const selectedProject = validProjects.find((p) =>
      selectedProjectOption.includes(p.id)
    );

    // Get available plans
    console.log("\n💻 Getting available plans...");
    const plansResult = await sendToMCPServer("get_available_plans");

    // Parse popular plans
    const popularPlans = [
      "c2-small-x86",
      "c2-medium-x86",
      "c3-small-x86",
      "m3-large-x86",
    ];
    const selectedPlan = await askSelection("Select plan:", popularPlans, true);

    // Select region
    const commonRegions = [
      "MIA2",
      "NYC",
      "LAX",
      "SAO",
      "SAO2",
      "TYO3",
      "SYD",
      "CHI",
      "DAL",
    ];
    const selectedRegion = await askSelection(
      "Select region:",
      commonRegions,
      true
    );

    // Select OS
    const commonOS = [
      "ubuntu_24_04_x64_lts",
      "ubuntu_22_04_x64_lts",
      "centos_8_x64",
      "debian_12_x64",
      "rocky_9_x64",
    ];
    const selectedOS = await askSelection(
      "Select operating system:",
      commonOS,
      true
    );

    // Get hostname
    const hostname = await askQuestion("Enter hostname for your server: ");

    // Step 3: Validate configuration
    console.log("\n🔍 Step 3: Validating configuration...");
    const validationResult = await sendToMCPServer("validate_server_config", {
      project_id: selectedProject.id,
      plan: selectedPlan,
      region: selectedRegion,
      operating_system: selectedOS,
    });

    console.log("\n" + validationResult.content[0].text);

    // Check if validation passed
    const validationText = validationResult.content[0].text;
    if (
      validationText.includes("❌ Configuration has") ||
      validationText.includes("API error")
    ) {
      console.log(
        "\n❌ Configuration validation failed. Please fix the issues and try again."
      );
      return;
    }

    // Step 4: Optional configurations
    console.log("\n⚙️ Step 4: Optional configurations");
    console.log("=================================");

    let sshKeys = [];
    if (await askConfirmation("Add SSH keys?")) {
      while (true) {
        const sshKey = await askQuestion(
          "Enter SSH key (or press Enter to finish): "
        );
        if (!sshKey) break;
        sshKeys.push(sshKey);
      }
    }

    let tags = [];
    if (await askConfirmation("Add tags?")) {
      while (true) {
        const tag = await askQuestion(
          "Enter tag (format: key=value, or press Enter to finish): "
        );
        if (!tag) break;
        tags.push(tag);
      }
    }

    let userData = "";
    if (await askConfirmation("Add user data script?")) {
      userData = await askQuestion(
        "Enter user data (base64 encoded or plain text): "
      );
    }

    let startupScript = "";
    if (await askConfirmation("Add startup script?")) {
      startupScript = await askQuestion("Enter startup script: ");
    }

    const billingOptions = ["hourly", "monthly", "yearly"];
    const billingType = await askSelection(
      "Select billing type:",
      billingOptions
    );

    // Step 5: Final confirmation and creation
    console.log("\n📋 Step 5: Final configuration summary");
    console.log("====================================");
    console.log(`Project: ${selectedProject.name} (${selectedProject.id})`);
    console.log(`Plan: ${selectedPlan}`);
    console.log(`Region: ${selectedRegion}`);
    console.log(`OS: ${selectedOS}`);
    console.log(`Hostname: ${hostname}`);
    console.log(`Billing: ${billingType}`);
    if (sshKeys.length > 0) console.log(`SSH Keys: ${sshKeys.length} key(s)`);
    if (tags.length > 0) console.log(`Tags: ${tags.join(", ")}`);
    if (userData) console.log(`User Data: Yes`);
    if (startupScript) console.log(`Startup Script: Yes`);

    if (!(await askConfirmation("\nProceed with server creation?"))) {
      console.log("❌ Server creation cancelled.");
      return;
    }

    // Create server
    console.log("\n🚀 Step 6: Creating server...");

    const serverConfig = {
      project: selectedProject.id,
      plan: selectedPlan,
      operating_system: selectedOS,
      hostname: hostname,
      site: selectedRegion,
      billing_type: billingType.toLowerCase(),
      ...(sshKeys.length > 0 && { sshKeys }),
      ...(tags.length > 0 && { tags }),
      ...(userData && { userData }),
      ...(startupScript && { startupScript }),
    };

    const createResult = await sendToMCPServer("create_server", serverConfig);

    console.log("\n📥 Response received:");
    if (createResult && createResult.content) {
      console.log(createResult.content[0].text);
    } else if (createResult.error) {
      console.log("❌ Error creating server:");
      console.log("Error:", createResult.error);
    } else {
      console.log("❌ Unexpected response format");
      console.log(JSON.stringify(createResult, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the smart server creation
createServerSmart();

export { createServerSmart };
