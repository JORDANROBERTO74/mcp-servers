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

// Function to get available plans
async function getAvailablePlans() {
  try {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_available_plans",
        arguments: {},
      },
    };

    console.log("🔍 Fetching available plans from Latitude.sh API...");
    const response = await sendToMCPServer(request);

    if (response.result && response.result.content) {
      const plansText = response.result.content[0].text;
      return plansText;
    } else {
      console.log("❌ Failed to fetch plans");
      console.log("🔍 Response:", response);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching plans:", error.message);
    return null;
  }
}

// Function to parse region details from the text
function parseRegionDetails(regionsText) {
  if (!regionsText) return null;

  const regions = [];
  const regionLines = regionsText.split("\n");

  let currentRegion = null;

  regionLines.forEach((line) => {
    const trimmedLine = line.trim();

    // Check if it's a region header (starts with emoji and region name)
    if (trimmedLine.match(/^[🟢🟡🟠🔴]\s+(.+?)\s+\((\w+)\)$/)) {
      if (currentRegion) {
        regions.push(currentRegion);
      }

      const match = trimmedLine.match(/^([🟢🟡🟠🔴])\s+(.+?)\s+\((\w+)\)$/);
      currentRegion = {
        icon: match[1],
        name: match[2].trim(),
        stock_level: match[3],
        in_stock: [],
        available: [],
        instant_deploy: [],
      };
    }
    // Parse location details
    else if (currentRegion && trimmedLine.startsWith("📍 In stock:")) {
      const locations = trimmedLine.replace("📍 In stock:", "").trim();
      if (locations) {
        currentRegion.in_stock = locations
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    } else if (currentRegion && trimmedLine.startsWith("⏳ Available:")) {
      const locations = trimmedLine.replace("⏳ Available:", "").trim();
      if (locations) {
        currentRegion.available = locations
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    } else if (currentRegion && trimmedLine.startsWith("⚡ Instant deploy:")) {
      const oses = trimmedLine.replace("⚡ Instant deploy:", "").trim();
      if (oses) {
        currentRegion.instant_deploy = oses
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    }
  });

  // Add the last region
  if (currentRegion) {
    regions.push(currentRegion);
  }

  return regions.length > 0 ? regions : null;
}

// Function to parse and display plans with enhanced formatting
function parsePlansAndDisplay(plansText) {
  console.log("\n" + "=".repeat(70));
  console.log("💻 AVAILABLE PLANS SUMMARY");
  console.log("=".repeat(70));

  // Parse the new format that includes detailed plan information with regions
  const planRegex =
    /(\d+)\.\s+\*\*([^*]+)\*\*\n\s+ID:\s+([^\n]+)\n\s+Slug:\s+([^\n]+)\n\s+Features:\s+([^\n]+)\n\s+CPU:\s+([^\n]+)\n\s+Memory:\s+([^\n]+)\n\s+Storage:\s+([^\n]+)\n\s+Network:\s+([^\n]+)\n\s+Pricing \(USD\):\s+([^\n]+)\n\s+Regions:\n([\s\S]*?)(?=\n---)/g;

  const plans = [];
  let match;

  while ((match = planRegex.exec(plansText)) !== null) {
    const plan = {
      number: match[1].trim(),
      name: match[2].trim(),
      id: match[3].trim(),
      slug: match[4].trim(),
      features: match[5].trim(),
      cpu: match[6].trim(),
      memory: match[7].trim(),
      storage: match[8].trim(),
      network: match[9].trim(),
      pricing: match[10].trim(),
      regions: match[11] ? parseRegionDetails(match[11].trim()) : null,
    };
    plans.push(plan);
  }

  if (plans.length === 0) {
    console.log("❌ No plans found in the response");
    console.log("📄 Raw response:");
    console.log(plansText);
    return false;
  }

  console.log(`📊 Total plans available: ${plans.length}`);

  // Group plans by category based on slug
  const planCategories = {
    compute: [],
    storage: [],
    memory: [],
    gpu: [],
    other: [],
  };

  plans.forEach((plan) => {
    const slug = plan.slug.toLowerCase();
    if (slug.includes("c1-") || slug.includes("c2-") || slug.includes("c3-")) {
      planCategories.compute.push(plan);
    } else if (slug.includes("s2-") || slug.includes("s3-")) {
      planCategories.storage.push(plan);
    } else if (slug.includes("m3-") || slug.includes("m4-")) {
      planCategories.memory.push(plan);
    } else if (slug.includes("f4-") || slug.includes("gpu")) {
      planCategories.gpu.push(plan);
    } else {
      planCategories.other.push(plan);
    }
  });

  // Display plans by category
  const categories = [
    {
      name: "Compute Optimized",
      key: "compute",
      emoji: "🚀",
      description: "Balanced CPU and memory for general workloads",
    },
    {
      name: "Storage Optimized",
      key: "storage",
      emoji: "💾",
      description: "High storage capacity for data-intensive applications",
    },
    {
      name: "Memory Optimized",
      key: "memory",
      emoji: "🧠",
      description: "High memory for memory-intensive applications",
    },
    {
      name: "GPU/AI Optimized",
      key: "gpu",
      emoji: "🎮",
      description: "GPU acceleration for AI/ML and compute-intensive tasks",
    },
    {
      name: "Other Plans",
      key: "other",
      emoji: "⚙️",
      description: "Specialized or custom configurations",
    },
  ];

  categories.forEach((category) => {
    const categoryPlans = planCategories[category.key];
    if (categoryPlans.length > 0) {
      console.log(
        `\n${category.emoji} **${category.name}** (${categoryPlans.length} plans)`
      );
      console.log(`   📝 ${category.description}`);
      console.log("   " + "-".repeat(60));

      categoryPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. 💻 **${plan.name}** (${plan.slug})`);
        console.log(`      🆔 ID: ${plan.id}`);
        console.log(`      🔧 Features: ${plan.features}`);

        console.log(`      🖥️ CPU: ${plan.cpu}`);
        console.log(`      🧠 Memory: ${plan.memory}`);
        console.log(`      💾 Storage: ${plan.storage}`);
        console.log(`      🌐 Network: ${plan.network}`);
        console.log(`      💰 Pricing: ${plan.pricing}`);

        // Get regions from the hardcoded mapping as fallback
        const availableRegions = getRegionsForPlan(plan.slug);
        if (availableRegions.length > 0) {
          console.log(
            `      🌍 Regions: ${availableRegions.slice(0, 8).join(", ")}${
              availableRegions.length > 8
                ? ` (+${availableRegions.length - 8} more)`
                : ""
            }`
          );
        } else {
          console.log(
            `      🌍 Regions: Check with Latitude.sh for availability`
          );
        }

        if (index < categoryPlans.length - 1) {
          console.log("");
        }
      });
    }
  });

  console.log("\n" + "=".repeat(70));
  console.log("💡 USAGE TIPS");
  console.log("=".repeat(70));
  console.log("🚀 Use these plan slugs with run-create-server.js");
  console.log("📋 Copy the Slug (e.g., 'c2-small-x86') for server creation");
  console.log("🌍 Different plans have different regional availability");
  console.log("💰 Plan pricing varies by region and billing type");

  console.log("\n" + "=".repeat(70));
  console.log("📋 QUICK REFERENCE");
  console.log("=".repeat(70));
  console.log("Popular plan slugs for quick copy-paste:");

  const popularPlans = plans.filter((p) =>
    [
      "c2-small-x86",
      "c2-medium-x86",
      "c3-small-x86",
      "s2-small-x86",
      "m3-large-x86",
    ].includes(p.slug)
  );

  if (popularPlans.length > 0) {
    popularPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.slug} - ${plan.name}`);
    });
  } else {
    // Fallback to show first few plans if popular ones not found
    plans.slice(0, 5).forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.slug} - ${plan.name}`);
    });
  }

  return true;
}

// Function to get regions for a specific plan (same logic as in run-create-server.js)
function getRegionsForPlan(planSlug) {
  const regionMappings = {
    "c2-small-x86": [
      "MIA2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "c2-medium-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "c2-large-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "c1-tiny-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "c3-small-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "c3-large-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "s2-small-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "s3-large-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "m3-large-x86": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "m4-metal-medium": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "m4-metal-large": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "f4-metal-small": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "f4-metal-medium": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
    "f4-metal-large": [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "LAX2",
      "SAO",
      "SAO2",
      "SYD",
      "SAN3",
      "TYO3",
      "MEX2",
      "BGT",
    ],
  };

  return (
    regionMappings[planSlug] || [
      "MIA2",
      "NYC",
      "LAX",
      "DAL",
      "CHI",
      "AMS",
      "LON",
      "FRA",
      "FRA2",
      "LAX2",
      "LON2",
      "MEX2",
      "SAN3",
      "SAO",
      "SAO2",
      "SGP",
      "SYD",
      "SYD2",
      "TYO3",
    ]
  );
}

// Main function
async function main() {
  console.log("💻 LATITUDE.SH PLANS LISTER");
  console.log("============================");
  console.log("📋 This tool lists all available server plans");
  console.log("🚀 Use the plan slugs with run-create-server.js\n");

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

    // Get available plans
    const plansText = await getAvailablePlans();

    if (!plansText) {
      console.log("❌ Failed to fetch plans");
      process.exit(1);
    }

    // Parse and display plans
    const success = parsePlansAndDisplay(plansText);

    if (success) {
      console.log("\n✅ Successfully listed available plans!");
    } else {
      console.log("\n❌ Failed to parse plans");
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
