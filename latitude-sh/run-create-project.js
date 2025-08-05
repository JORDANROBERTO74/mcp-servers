import { spawn } from "child_process";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function askQuestion(question, defaultValue = "") {
  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${question} [default: ${defaultValue}]: `
      : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Helper function to ask for selection
function askSelection(question, options, defaultValue = "") {
  return new Promise((resolve) => {
    console.log(`\n${question}`);
    options.forEach((option, index) => {
      const marker = option === defaultValue ? " [default]" : "";
      console.log(`  ${index + 1}. ${option}${marker}`);
    });

    const prompt = defaultValue
      ? `Select option [default: ${defaultValue}]: `
      : "Select option: ";
    rl.question(prompt, (answer) => {
      const selection = answer.trim();
      if (!selection && defaultValue) {
        resolve(defaultValue);
      } else {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < options.length) {
          resolve(options[index]);
        } else {
          console.log("❌ Invalid selection. Please try again.");
          resolve(askSelection(question, options, defaultValue));
        }
      }
    });
  });
}

// Main function
async function createProject() {
  console.log("🚀 Dynamic Project Creation Tool");
  console.log("=====================================\n");

  try {
    // Get project details
    const name = await askQuestion("📝 Project Name (REQUIRED)", "");
    if (!name) {
      console.log("❌ Project name is required!");
      rl.close();
      return;
    }

    const description = await askQuestion("📝 Description (OPTIONAL)", "");

    const environment = await askSelection(
      "🌍 Environment Type (OPTIONAL)",
      ["Development", "Production", "Staging"],
      "Development"
    );

    const provisioningType = await askSelection(
      "⚙️ Provisioning Type (OPTIONAL)",
      ["reserved", "on_demand"],
      "reserved"
    );

    // Build project configuration
    const projectConfig = {
      name,
      ...(description && { description }),
      environment,
      provisioning_type: provisioningType,
    };

    // Show summary
    console.log("\n📋 Project Data Summary:");
    console.log("=========================");
    console.log(`Name: ${projectConfig.name}`);
    console.log(
      `Description: ${projectConfig.description || "No description"}`
    );
    console.log(`Environment: ${projectConfig.environment}`);
    console.log(`Provisioning Type: ${projectConfig.provisioning_type}`);

    // Confirm creation
    const proceed = await askQuestion(
      "\n✅ Proceed with project creation? (y/n)",
      "y"
    );
    if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
      console.log("❌ Project creation cancelled.");
      rl.close();
      return;
    }

    // Create MCP server process
    console.log("\n🚀 Sending request to MCP server...");
    const mcpProcess = spawn("node", ["dist/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: __dirname,
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
      console.log("\n📋 Server Response:");

      try {
        const response = JSON.parse(output);
        if (response.result?.content?.[0]?.text) {
          console.log(response.result.content[0].text);
        } else {
          console.log("❌ Unexpected response format");
          console.log("Raw response:", output);
        }
      } catch (error) {
        console.log("❌ Error parsing response");
        console.log("Raw output:", output);
      }

      if (code !== 0) {
        console.log(`❌ Server process exited with code ${code}`);
      }

      rl.close();
    });

    // Wait for server to start, then send request
    setTimeout(() => {
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "create_project",
          arguments: projectConfig,
        },
      };

      mcpProcess.stdin.write(JSON.stringify(request) + "\n");

      // Close stdin after sending request
      setTimeout(() => {
        mcpProcess.stdin.end();
      }, 1000);
    }, 2000);
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
  }
}

// Start the application
createProject();
