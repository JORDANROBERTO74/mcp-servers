import { spawn } from "child_process";
import readline from "readline";

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
    console.log("Using new MCP tools for intelligent server creation\n");

    // Step 1: Get the complete server creation flow
    console.log("📋 Step 1: Getting server creation flow...");
    const flowResult = await sendToMCPServer("get_server_creation_flow");
    console.log("\n" + flowResult.content[0].text);

    // Step 2: Interactive configuration
    console.log("\n🎯 Step 2: Configure your server");
    console.log("================================");

    // Get available projects (JSON)
    console.log("\n📁 Getting available projects...");
    const projectsResult = await sendToMCPServer("list_projects", {
      "extra_fields[projects]": "stats",
    });

    let validProjects = [];
    try {
      const payload = JSON.parse(projectsResult.content[0].text);
      const projects = Array.isArray(payload.data) ? payload.data : [];
      validProjects = projects.filter(
        (p) => p?.metadata?.provisioning_type === "on_demand"
      );
    } catch (_e) {
      console.log(
        "❌ Failed to parse projects JSON. Please try again or list projects manually."
      );
      validProjects = [];
    }

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

    // Get available plans (IDs)
    console.log("\n💻 Getting available plans...");
    const plansResult = await sendToMCPServer("get_available_plans");
    let plansPayload;
    try {
      plansPayload = JSON.parse(plansResult.content[0].text);
    } catch (e) {
      console.log(
        "❌ Failed to parse plans payload. Falling back to manual entry."
      );
      plansPayload = { data: [] };
    }
    const plans = Array.isArray(plansPayload.data) ? plansPayload.data : [];
    const planOptions = plans.map((p) => {
      const name =
        (p.attributes && (p.attributes.name || p.attributes.slug)) || p.id;
      return `${name} (ID: ${p.id})`;
    });
    const selectedPlanOption = await askSelection(
      "Select plan:",
      planOptions.length > 0 ? planOptions : ["Enter custom plan ID"],
      true
    );
    const planIdMatch = String(selectedPlanOption).match(/\(ID: ([^)]+)\)/);
    const selectedPlanId = planIdMatch
      ? planIdMatch[1]
      : await askQuestion("Enter plan ID (e.g., plan_2X6KG5mA5yPBM): ");

    // Select region (fetch based on plan ID)
    console.log("\n🌍 Getting available regions for the selected plan...");
    const regionsResult = await sendToMCPServer("get_available_regions", {
      plan: selectedPlanId,
    });
    let regionsPayload;
    try {
      regionsPayload = JSON.parse(regionsResult.content[0].text);
    } catch (e) {
      console.log(
        "❌ Failed to parse regions payload. Falling back to manual entry."
      );
      regionsPayload = { data: [] };
    }
    const regionsData = Array.isArray(regionsPayload.data)
      ? regionsPayload.data
      : [];
    const regionCodes = new Set();
    for (const r of regionsData) {
      if (r.locations && Array.isArray(r.locations.in_stock)) {
        r.locations.in_stock.forEach((code) => regionCodes.add(code));
      }
      if (r.locations && Array.isArray(r.locations.available)) {
        r.locations.available.forEach((code) => regionCodes.add(code));
      }
    }
    const regionOptions = Array.from(regionCodes);
    const selectedRegion = await askSelection(
      "Select region:",
      regionOptions.length > 0 ? regionOptions : ["Enter custom region code"],
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
      plan: selectedPlanId,
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

    // Billing can be changed later with update_server; skipped here

    // Step 5: Final confirmation and creation
    console.log("\n📋 Step 5: Final configuration summary");
    console.log("====================================");
    console.log(`Project: ${selectedProject.name} (${selectedProject.id})`);
    console.log(`Plan ID: ${selectedPlanId}`);
    console.log(`Region: ${selectedRegion}`);
    console.log(`OS: ${selectedOS}`);
    console.log(`Hostname: ${hostname}`);
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
      plan: selectedPlanId,
      operating_system: selectedOS,
      hostname: hostname,
      site: selectedRegion,
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
