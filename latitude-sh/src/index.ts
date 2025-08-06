#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { LatitudeAPIClient } from "./utils/latitude-api.js";
import type {
  LatitudeAPIConfig,
  LatitudeProjectDetails,
  LatitudeProject,
  LatitudeServer,
  LatitudeServerDetails,
} from "./types/latitude.js";
import { getAPIConfig } from "./config.js";

// Schema definitions for tool arguments
const ListProjectsArgsSchema = z.object({
  // Pagination
  "page[size]": z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Number of items to return per page (1-100, default: 20)"),
  "page[number]": z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1)"),

  // Basic filters
  status: z
    .enum(["active", "inactive", "archived"])
    .optional()
    .describe("Filter by project status"),
  owner: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Owner ID must contain only alphanumeric characters, dots, hyphens, and underscores"
    )
    .optional()
    .describe("Filter by owner ID"),

  // Advanced filters
  "filter[name]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by project name"),
  "filter[slug]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by project slug"),
  "filter[description]": z
    .string()
    .min(1)
    .max(500)
    .optional()
    .describe("Filter by project description"),
  "filter[billing_type]": z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("Filter by billing type"),
  "filter[environment]": z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("Filter by environment"),
  "filter[tags]": z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Filter by tags (comma-separated, e.g. 'tag_1,tag_2')"),

  // Extra fields
  "extra_fields[projects]": z
    .string()
    .optional()
    .describe(
      "Extra fields to include (e.g. 'last_renewal_date,next_renewal_date')"
    ),

  // Legacy support (for backward compatibility)
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Legacy: Maximum number of projects to return (1-100)"),
  page: z
    .number()
    .min(1)
    .optional()
    .describe("Legacy: Page number for pagination"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Legacy: Filter by tags array"),
  query: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Legacy: Search query to find projects"),
});

const GetProjectArgsSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to retrieve"),
});

const SearchProjectsArgsSchema = z.object({
  query: z.string().min(1).max(200).describe("Search query to find projects"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Maximum number of projects to return (1-100)"),
  page: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number for pagination"),
  status: z
    .enum(["active", "inactive", "archived"])
    .optional()
    .describe("Filter by project status"),
});

const GetProjectFilesArgsSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to get files for"),
});

const TestConnectionArgsSchema = z.object({});

const GetAvailablePlansArgsSchema = z.object({});

const GetServerCreationFlowArgsSchema = z.object({});

const ValidateServerConfigArgsSchema = z.object({
  project_id: z.string().describe("Project ID to validate"),
  plan: z.string().describe("Plan slug to validate"),
  region: z.string().describe("Region code to validate"),
  operating_system: z.string().optional().describe("OS to validate"),
});

const GetAvailableRegionsArgsSchema = z.object({
  plan: z.string().min(1).describe("Plan slug to check availability for"),
});

const CreateProjectArgsSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Name of the project to create (REQUIRED)"),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("Description of the project (OPTIONAL)"),
  environment: z
    .enum(["Development", "Production", "Staging"])
    .optional()
    .default("Development")
    .describe("Environment type for the project (OPTIONAL)"),
  provisioning_type: z
    .enum(["on_demand", "reserved"])
    .optional()
    .default("reserved")
    .describe("Provisioning type for the project (OPTIONAL)"),
  billing_type: z
    .enum(["Normal", "Enterprise"])
    .optional()
    .default("Normal")
    .describe("Billing type for the project (OPTIONAL)"),
  billing_method: z
    .enum(["Normal", "Enterprise"])
    .optional()
    .default("Normal")
    .describe("Billing method for the project (OPTIONAL)"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Tags for the project (OPTIONAL)"),
});

const UpdateProjectArgsSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to update (REQUIRED)"),
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("New name for the project (OPTIONAL)"),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("New description for the project (OPTIONAL)"),
  environment: z
    .enum(["Development", "Production", "Staging"])
    .optional()
    .describe("New environment type for the project (OPTIONAL)"),
  bandwidth_alert: z
    .any()
    .optional()
    .describe("Bandwidth alert settings for the project (OPTIONAL)"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("New tags for the project (OPTIONAL)"),
});

const DeleteProjectArgsSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to delete (REQUIRED)"),
  confirm: z
    .boolean()
    .optional()
    .default(false)
    .describe("Confirmation flag to prevent accidental deletion (OPTIONAL)"),
});

const ListServersArgsSchema = z.object({
  // Pagination
  "page[size]": z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Number of items to return per page (1-100, default: 20)"),
  "page[number]": z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1)"),

  // Basic filters
  status: z
    .enum(["on", "off", "rebooting", "provisioning", "deleted"])
    .optional()
    .describe("Filter by server status"),
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .optional()
    .describe("Filter by project ID"),

  // Advanced filters
  "filter[project]": z
    .string()
    .min(1)
    .optional()
    .describe("Filter by project ID or Slug"),
  "filter[region]": z
    .string()
    .min(1)
    .optional()
    .describe("Filter by region Slug"),
  "filter[hostname]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by server hostname"),
  "filter[created_at_gte]": z
    .string()
    .optional()
    .describe("Filter by created at greater than equal date (ISO format)"),
  "filter[created_at_lte]": z
    .string()
    .optional()
    .describe("Filter by created at less than equal date (ISO format)"),
  "filter[label]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by server label"),
  "filter[status]": z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("Filter by server status"),
  "filter[plan]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by platform/plan name"),
  "filter[gpu]": z.boolean().optional().describe("Filter by GPU existence"),
  "filter[ram][eql]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with RAM size equals (in GB)"),
  "filter[ram][gte]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with RAM size greater than or equal (in GB)"),
  "filter[ram][lte]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with RAM size less than or equal (in GB)"),
  "filter[disk][eql]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with disk size equals (in GB)"),
  "filter[disk][gte]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with disk size greater than or equal (in GB)"),
  "filter[disk][lte]": z
    .number()
    .min(1)
    .optional()
    .describe("Filter servers with disk size less than or equal (in GB)"),
  "filter[tags]": z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Filter by tags (comma-separated, e.g. 'tag_1,tag_2')"),

  // Extra fields
  "extra_fields[servers]": z
    .string()
    .optional()
    .describe("Extra fields to include (e.g. 'credentials')"),

  // Legacy support (for backward compatibility)
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of servers to return (1-100)"),
  page: z.number().min(1).optional().describe("Page number for pagination"),
  region: z.string().min(1).optional().describe("Filter by region slug"),
  plan: z.string().min(1).optional().describe("Filter by plan slug"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Filter by tags"),
});

const CreateServerArgsSchema = z.object({
  project: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to create the server in (REQUIRED)"),
  plan: z
    .string()
    .min(1)
    .describe("The ID of the plan/specification for the server (REQUIRED)"),
  operating_system: z
    .string()
    .min(1)
    .describe("Operating system for the server (REQUIRED)"),
  hostname: z
    .string()
    .min(1)
    .max(100)
    .describe("Hostname for the server (REQUIRED)"),
  site: z
    .string()
    .min(1)
    .describe("The region/site where the server will be deployed (REQUIRED)"),
  sshKeys: z
    .array(z.string().min(1))
    .optional()
    .describe("Array of SSH key IDs to add to the server (OPTIONAL)"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Tags for the server (OPTIONAL)"),
  userData: z
    .string()
    .max(16384)
    .optional()
    .describe("User data script to run on server startup (OPTIONAL)"),
  startupScript: z
    .string()
    .max(16384)
    .optional()
    .describe("Startup script to run on server initialization (OPTIONAL)"),
});

const GetServerArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Server ID must contain only letters, numbers, hyphens, and underscores"
    )
    .describe("The ID of the server to retrieve (REQUIRED)"),
});

const UpdateServerArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Server ID must contain only letters, numbers, hyphens, and underscores"
    )
    .describe("The ID of the server to update (REQUIRED)"),
  hostname: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("New hostname for the server (OPTIONAL)"),
  billing: z
    .enum(["hourly", "monthly", "yearly"])
    .optional()
    .describe(
      "Server billing type: hourly/monthly for on-demand projects, yearly for reserved projects (OPTIONAL)"
    ),
  tags: z
    .array(z.string().min(1))
    .optional()
    .describe("Array of tag IDs to assign to the server (OPTIONAL)"),
  project: z
    .string()
    .min(1)
    .optional()
    .describe("Project ID or slug to move the server to (OPTIONAL)"),
});

const DeleteServerArgsSchema = z.object({
  server_id: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Server ID must contain only letters, numbers, hyphens, and underscores"
    )
    .describe("The server ID (REQUIRED)"),
  reason: z
    .string()
    .max(500)
    .optional()
    .describe("The reason for deleting the server (OPTIONAL)"),
});

// Define ToolInput type locally
const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Server setup
const server = new Server(
  {
    name: "latitude-sh-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to format project information
function formatProject(
  project: LatitudeProject | LatitudeProjectDetails
): string {
  const attrs = project.attributes;
  const team = attrs.team;

  return `📁 **${attrs.name}** (ID: ${project.id})
📝 Description: ${attrs.description || "No description"}
👤 Team: ${team.name} (${team.slug})
📅 Created: ${
    isValidDate(attrs.created_at)
      ? new Date(attrs.created_at).toLocaleString()
      : "Unknown"
  }
📅 Updated: ${
    isValidDate(attrs.updated_at)
      ? new Date(attrs.updated_at).toLocaleString()
      : "Unknown"
  }
🌍 Environment: ${attrs.environment}
💳 Billing: ${attrs.billing_type} (${attrs.billing_method})
⚙️ Provisioning: ${attrs.provisioning_type}
🏷️ Tags: ${attrs.tags.length > 0 ? attrs.tags.join(", ") : "No tags"}
📊 Stats: ${attrs.stats.servers} servers, ${attrs.stats.databases} databases, ${
    attrs.stats.storages
  } storages
${
  "metadata" in project && project.metadata?.tags
    ? `🏷️ Additional Tags: ${project.metadata.tags.join(", ")}`
    : ""
}
${
  "metadata" in project && project.metadata?.framework
    ? `⚙️ Framework: ${project.metadata.framework}`
    : ""
}
${
  "metadata" in project && project.metadata?.language
    ? `💻 Language: ${project.metadata.language}`
    : ""
}
---`;
}

// Helper function to format project list
function formatProjectList(
  projects: LatitudeProject[],
  total: number,
  page: number,
  limit: number
): string {
  if (projects.length === 0) {
    return "No projects found.";
  }

  const projectDetails = projects.map(formatProject).join("\n\n");
  const totalPages = Math.ceil(total / limit);

  return `Found ${total} projects (Page ${page} of ${totalPages}):\n\n${projectDetails}`;
}

// Helper function to format file list
function formatFileList(files: LatitudeProjectDetails["files"]): string {
  if (!files || files.length === 0) {
    return "No files found for this project.";
  }

  return files
    .map((file) => {
      const size = file.size ? ` (${formatSize(file.size)})` : "";
      const icon = file.type === "directory" ? "📁" : "📄";
      return `${icon} ${file.name}${size}`;
    })
    .join("\n");
}

// Helper function to validate dates
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to format file sizes
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to format server information
function formatServer(server: LatitudeServer | LatitudeServerDetails): string {
  const attrs = server.attributes;
  const statusEmoji = {
    on: "🟢",
    off: "🔴",
    rebooting: "🟡",
    provisioning: "🟡",
    deleted: "🗑️",
  };

  return `🖥️ **${attrs.hostname}** (ID: ${server.id})
📋 Label: ${attrs.label || "N/A"}
🏷️ Status: ${statusEmoji[attrs.status] || "⚪"} ${attrs.status}
💰 Price: $${attrs.price || "N/A"}/hour
🎭 Role: ${attrs.role || "N/A"}
🌍 Region: ${attrs.region?.city || "N/A"}, ${attrs.region?.country || "N/A"}
🏢 Site: ${attrs.region?.site?.name || "N/A"} (${
    attrs.region?.site?.slug || "N/A"
  })
💻 Plan: ${attrs.plan?.name || "N/A"} (${attrs.plan?.billing || "N/A"})
📅 Created: ${
    attrs.created_at && isValidDate(attrs.created_at)
      ? new Date(attrs.created_at).toLocaleString()
      : "Unknown"
  }
🌐 IPv4: ${attrs.primary_ipv4 || "N/A"}
${attrs.primary_ipv6 ? `🌐 IPv6: ${attrs.primary_ipv6}` : ""}
🔒 Locked: ${attrs.locked ? "Yes" : "No"}
🆘 Rescue Allowed: ${attrs.rescue_allowed ? "Yes" : "No"}
📊 IPMI Status: ${attrs.ipmi_status || "N/A"}
${
  attrs.scheduled_deletion_at
    ? `🗑️ Scheduled Deletion: ${new Date(
        attrs.scheduled_deletion_at
      ).toLocaleString()}`
    : ""
}
👥 Team: ${attrs.team?.name || "N/A"} (${attrs.team?.slug || "N/A"})
📁 Project: ${attrs.project?.name || "N/A"} (${attrs.project?.slug || "N/A"})
💿 OS: ${attrs.operating_system?.name || "N/A"} ${
    attrs.operating_system?.version || ""
  }
📦 Distro: ${attrs.operating_system?.distro?.name || "N/A"} (${
    attrs.operating_system?.distro?.series || "N/A"
  })
⚙️ Specs: ${attrs.specs?.cpu || "N/A"}, ${attrs.specs?.ram || "N/A"}, ${
    attrs.specs?.disk || "N/A"
  }, ${attrs.specs?.nic || "N/A"}
${attrs.specs?.gpu ? `🎮 GPU: ${attrs.specs.gpu}` : ""}
🔌 Interfaces: ${
    attrs.interfaces
      ? attrs.interfaces.map((i) => `${i.name} (${i.role})`).join(", ")
      : "N/A"
  }
🏷️ Tags: ${
    attrs.tags && attrs.tags.length > 0 ? attrs.tags.join(", ") : "No tags"
  }
${
  "metadata" in server && server.metadata?.tags
    ? `🏷️ Additional Tags: ${server.metadata.tags.join(", ")}`
    : ""
}
---`;
}

// Helper function to format server list
function formatServerList(
  servers: LatitudeServer[],
  total: number,
  page: number,
  limit: number
): string {
  if (servers.length === 0) {
    return "No servers found.";
  }

  const serverDetails = servers.map(formatServer).join("\n\n");
  const totalPages = Math.ceil(total / limit);

  return `Found ${total} servers (Page ${page} of ${totalPages}):\n\n${serverDetails}`;
}

// Check if environment variables are loaded
try {
  // Initialize API client with environment configuration
  const apiConfig: LatitudeAPIConfig = getAPIConfig();

  const latitudeClient = new LatitudeAPIClient(apiConfig);

  // Tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "list_projects",
          description:
            "List all projects from your latitude.sh account. " +
            "You can filter by status, owner, tags, and paginate results. " +
            "Returns detailed information about each project including name, description, owner, dates, and metadata.",
          inputSchema: zodToJsonSchema(ListProjectsArgsSchema) as ToolInput,
        },
        {
          name: "get_project",
          description:
            "Get detailed information about a specific project by its ID. " +
            "Returns comprehensive project details including files, metadata, collaborators, and settings.",
          inputSchema: zodToJsonSchema(GetProjectArgsSchema) as ToolInput,
        },
        {
          name: "search_projects",
          description:
            "Search for projects using a query string. " +
            "Searches through project names, descriptions, and metadata. " +
            "Supports filtering by status and pagination.",
          inputSchema: zodToJsonSchema(SearchProjectsArgsSchema) as ToolInput,
        },
        {
          name: "get_project_files",
          description:
            "Get the file structure of a specific project. " +
            "Returns a list of files and directories within the project, " +
            "including file sizes and modification dates.",
          inputSchema: zodToJsonSchema(GetProjectFilesArgsSchema) as ToolInput,
        },
        {
          name: "create_project",
          description:
            "Create a new project in latitude.sh. " +
            "Creates a project with the specified name, description, environment, and billing settings. " +
            "Returns detailed information about the newly created project.",
          inputSchema: zodToJsonSchema(CreateProjectArgsSchema) as ToolInput,
        },
        {
          name: "update_project",
          description:
            "Update an existing project in latitude.sh. " +
            "Updates project properties such as name, description, environment, billing settings, and tags. " +
            "Returns detailed information about the updated project.",
          inputSchema: zodToJsonSchema(UpdateProjectArgsSchema) as ToolInput,
        },
        {
          name: "delete_project",
          description:
            "Delete a project from latitude.sh. " +
            "Permanently removes a project and all its associated resources. " +
            "Requires confirmation to prevent accidental deletion. " +
            "Returns confirmation message upon successful deletion.",
          inputSchema: zodToJsonSchema(DeleteProjectArgsSchema) as ToolInput,
        },
        {
          name: "list_servers",
          description:
            "List all servers from your latitude.sh account. " +
            "You can filter by status, project, region, plan, tags, and paginate results. " +
            "Returns detailed information about each server including name, status, region, plan, and specs.",
          inputSchema: zodToJsonSchema(ListServersArgsSchema) as ToolInput,
        },
        {
          name: "create_server",
          description:
            "Create a new server in latitude.sh. " +
            "Creates a server with the specified name, project, region, plan, and optional configuration. " +
            "Returns detailed information about the newly created server including specs and network details.",
          inputSchema: zodToJsonSchema(CreateServerArgsSchema) as ToolInput,
        },
        {
          name: "get_server",
          description:
            "Get detailed information about a specific server in latitude.sh. " +
            "Retrieves comprehensive server details including specs, network information, status, and configuration. " +
            "Returns formatted server information with all available details.",
          inputSchema: zodToJsonSchema(GetServerArgsSchema) as ToolInput,
        },
        {
          name: "update_server",
          description:
            "Update an existing server in latitude.sh. " +
            "Updates server properties such as name, description, tags, and SSH keys. " +
            "Returns the updated server information with all current details.",
          inputSchema: zodToJsonSchema(UpdateServerArgsSchema) as ToolInput,
        },
        {
          name: "delete_server",
          description:
            "Delete a server from latitude.sh. " +
            "Permanently removes the server and all its data. " +
            "Requires confirmation to prevent accidental deletion. " +
            "Returns confirmation message upon successful deletion.",
          inputSchema: zodToJsonSchema(DeleteServerArgsSchema) as ToolInput,
        },
        {
          name: "get_available_plans",
          description:
            "Get all available server plans from latitude.sh. " +
            "Returns a list of all plans with their specifications, pricing, and availability. " +
            "Useful for determining which plans are available before creating a server.",
          inputSchema: zodToJsonSchema(
            GetAvailablePlansArgsSchema
          ) as ToolInput,
        },
        {
          name: "get_available_regions",
          description:
            "Get available regions for a specific server plan. " +
            "Returns a list of regions where the specified plan is available. " +
            "Useful for determining which regions have stock for a particular plan.",
          inputSchema: zodToJsonSchema(
            GetAvailableRegionsArgsSchema
          ) as ToolInput,
        },
        {
          name: "test_connection",
          description:
            "Test the connection to the latitude.sh API. " +
            "Verifies that the API key is valid and the server can communicate with latitude.sh.",
          inputSchema: zodToJsonSchema(TestConnectionArgsSchema) as ToolInput,
        },
        {
          name: "get_server_creation_flow",
          description:
            "Get the complete server creation flow with validation steps. " +
            "Returns available projects (on-demand only), plans with regions, and required steps. " +
            "Use this before attempting to create a server to understand what's available.",
          inputSchema: zodToJsonSchema(
            GetServerCreationFlowArgsSchema
          ) as ToolInput,
        },
        {
          name: "validate_server_config",
          description:
            "Validate a server configuration before creation. " +
            "Checks if project is on-demand, plan exists, region is available, etc. " +
            "Returns validation results and suggestions.",
          inputSchema: zodToJsonSchema(
            ValidateServerConfigArgsSchema
          ) as ToolInput,
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "list_projects": {
          const parsed = ListProjectsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_projects: ${parsed.error}`
            );
          }

          const result = await latitudeClient.getProjects(parsed.data);

          if (!result || !result.projects) {
            throw new Error("Invalid API response: missing projects data");
          }

          const formatted = formatProjectList(
            result.projects,
            result.total,
            result.page,
            result.limit
          );

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "get_project": {
          const parsed = GetProjectArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_project: ${parsed.error}`
            );
          }

          const project = await latitudeClient.getProject(
            parsed.data.projectId
          );
          const formatted = formatProject(project);

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "search_projects": {
          const parsed = SearchProjectsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for search_projects: ${parsed.error}`
            );
          }

          const result = await latitudeClient.searchProjects(
            parsed.data.query,
            {
              limit: parsed.data.limit,
              page: parsed.data.page,
              status: parsed.data.status,
            }
          );

          if (!result || !result.projects) {
            throw new Error("Invalid API response: missing projects data");
          }

          const formatted = formatProjectList(
            result.projects,
            result.total,
            result.page,
            result.limit
          );

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "get_project_files": {
          const parsed = GetProjectFilesArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_project_files: ${parsed.error}`
            );
          }

          const files = await latitudeClient.getProjectFiles(
            parsed.data.projectId
          );
          const formatted = formatFileList(files || []);

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "create_project": {
          const parsed = CreateProjectArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for create_project: ${parsed.error}`
            );
          }

          const project = await latitudeClient.createProject(parsed.data);
          const formatted = formatProject(project);

          return {
            content: [
              {
                type: "text",
                text: `✅ Project created successfully!\n\n${formatted}`,
              },
            ],
          };
        }

        case "update_project": {
          const parsed = UpdateProjectArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for update_project: ${parsed.error}`
            );
          }

          const { projectId, ...updateData } = parsed.data;
          const project = await latitudeClient.updateProject(
            projectId,
            updateData
          );
          const formatted = formatProject(project);

          return {
            content: [
              {
                type: "text",
                text: `✅ Project updated successfully!\n\n${formatted}`,
              },
            ],
          };
        }

        case "delete_project": {
          const parsed = DeleteProjectArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for delete_project: ${parsed.error}`
            );
          }

          const { projectId, confirm } = parsed.data;

          if (!confirm) {
            return {
              content: [
                {
                  type: "text",
                  text: "❌ Project deletion cancelled. Please set 'confirm' to true to proceed with deletion.",
                },
              ],
              isError: true,
            };
          }

          await latitudeClient.deleteProject(projectId);

          return {
            content: [
              {
                type: "text",
                text: `✅ Project ${projectId} deleted successfully!`,
              },
            ],
          };
        }

        case "list_servers": {
          const parsed = ListServersArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_servers: ${parsed.error}`
            );
          }

          const result = await latitudeClient.getServers(parsed.data);

          if (!result || !result.servers) {
            throw new Error("Invalid API response: missing servers data");
          }

          const formatted = formatServerList(
            result.servers,
            result.total,
            result.page,
            result.limit
          );

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "create_server": {
          const parsed = CreateServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for create_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.createServer(parsed.data);
          const formatted = formatServer(server);

          return {
            content: [
              {
                type: "text",
                text: `✅ Server created successfully!\n\n${formatted}`,
              },
            ],
          };
        }

        case "get_server": {
          const parsed = GetServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.getServer(parsed.data.serverId);
          const formatted = formatServer(server);

          return {
            content: [{ type: "text", text: formatted }],
          };
        }

        case "update_server": {
          const parsed = UpdateServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for update_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.updateServer(
            parsed.data.serverId,
            parsed.data
          );
          const formatted = formatServer(server);

          return {
            content: [
              {
                type: "text",
                text: `✅ Server updated successfully!\n\n${formatted}`,
              },
            ],
          };
        }

        case "delete_server": {
          const parsed = DeleteServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for delete_server: ${parsed.error}`
            );
          }

          // Delete the server
          await latitudeClient.deleteServer(parsed.data.server_id);

          // Prepare response message
          let responseMessage = `✅ Server ${parsed.data.server_id} deleted successfully!`;

          if (parsed.data.reason) {
            responseMessage += `\n📝 Reason: ${parsed.data.reason}`;
          }

          return {
            content: [
              {
                type: "text",
                text: responseMessage,
              },
            ],
          };
        }

        case "get_available_plans": {
          const parsed = GetAvailablePlansArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_available_plans: ${parsed.error}`
            );
          }

          const plans = await latitudeClient.getAvailablePlans();

          let plansText = "📋 Available Plans:\n";
          plans.forEach((plan, index) => {
            plansText += `\n${index + 1}. **${plan.attributes.name}**\n`;
            plansText += `   ID: ${plan.id}\n`;
            plansText += `   Slug: ${plan.attributes.slug}\n`;
            plansText += `   Features: ${plan.attributes.features.join(
              ", "
            )}\n`;

            // Add specs information
            if (plan.attributes.specs) {
              const specs = plan.attributes.specs;
              plansText += `   CPU: ${specs.cpu.cores} cores ${specs.cpu.type} @ ${specs.cpu.clock}GHz\n`;
              plansText += `   Memory: ${specs.memory.total}GB\n`;
              if (specs.drives.length > 0) {
                plansText += `   Storage: ${specs.drives
                  .map((d) => `${d.count}x ${d.size} ${d.type}`)
                  .join(", ")}\n`;
              }
              if (specs.nics.length > 0) {
                plansText += `   Network: ${specs.nics
                  .map((n) => `${n.count}x ${n.type}`)
                  .join(", ")}\n`;
              }
            }

            // Add pricing from first available region
            if (plan.attributes.regions.length > 0) {
              const firstRegion = plan.attributes.regions[0];
              plansText += `   Pricing (USD): $${firstRegion.pricing.USD.hour}/hr, $${firstRegion.pricing.USD.month}/mo\n`;
            }

            // Add detailed region information
            if (plan.attributes.regions.length > 0) {
              plansText += `   Regions:\n`;
              plan.attributes.regions.forEach((region) => {
                const stockIcon =
                  region.stock_level === "high"
                    ? "🟢"
                    : region.stock_level === "medium"
                    ? "🟡"
                    : region.stock_level === "low"
                    ? "🟠"
                    : "🔴";

                plansText += `     ${stockIcon} ${region.name} (${region.stock_level})\n`;

                if (region.locations.in_stock.length > 0) {
                  plansText += `       📍 In stock: ${region.locations.in_stock.join(
                    ", "
                  )}\n`;
                }

                if (
                  region.locations.available.length >
                  region.locations.in_stock.length
                ) {
                  const availableOnly = region.locations.available.filter(
                    (loc) => !region.locations.in_stock.includes(loc)
                  );
                  if (availableOnly.length > 0) {
                    plansText += `       ⏳ Available: ${availableOnly.join(
                      ", "
                    )}\n`;
                  }
                }

                if (region.deploys_instantly.length > 0) {
                  plansText += `       ⚡ Instant deploy: ${region.deploys_instantly.join(
                    ", "
                  )}\n`;
                }
              });
            }

            plansText += "---\n";
          });

          return {
            content: [
              {
                type: "text",
                text: plansText,
              },
            ],
          };
        }

        case "get_available_regions": {
          const parsed = GetAvailableRegionsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_available_regions: ${parsed.error}`
            );
          }

          const regions = await latitudeClient.getAvailableRegions(
            parsed.data.plan
          );

          let regionsText = `🌍 Available Regions for plan ${parsed.data.plan}:\n`;
          regions.forEach((region, index) => {
            regionsText += `\n${index + 1}. **${region.name}**\n`;
            regionsText += `   ID: ${region.id}\n`;
            regionsText += `   Slug: ${region.slug}\n`;
            regionsText += `   Location: ${region.city}, ${region.country}\n`;
            regionsText += "---\n";
          });

          return {
            content: [
              {
                type: "text",
                text: regionsText,
              },
            ],
          };
        }

        case "test_connection": {
          const parsed = TestConnectionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for test_connection: ${parsed.error}`
            );
          }

          await latitudeClient.testConnection();

          return {
            content: [
              {
                type: "text",
                text: "✅ Successfully connected to latitude.sh API",
              },
            ],
          };
        }

        case "get_server_creation_flow": {
          const parsed = GetServerCreationFlowArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_server_creation_flow: ${parsed.error}`
            );
          }

          // Get available projects (on-demand only)
          const allProjects = await latitudeClient.getProjects({});
          const onDemandProjects = allProjects.projects.filter(
            (project: any) =>
              project.attributes.provisioning_type === "on_demand"
          );

          // Get available plans
          const plans = await latitudeClient.getAvailablePlans();

          // Get common regions mapping
          const regionMappings: { [key: string]: string[] } = {
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
          };

          let flowText = "🚀 **SERVER CREATION FLOW**\n\n";

          flowText += "📋 **STEP 1: Select Project (on-demand only)**\n";
          if (onDemandProjects.length === 0) {
            flowText +=
              "❌ No on-demand projects available. You need to create a project with provisioning_type='on_demand' first.\n\n";
          } else {
            flowText += `✅ Found ${onDemandProjects.length} on-demand project(s):\n`;
            onDemandProjects
              .slice(0, 5)
              .forEach((project: any, index: number) => {
                flowText += `   ${index + 1}. ${project.attributes.name} (${
                  project.id
                })\n`;
              });
            if (onDemandProjects.length > 5) {
              flowText += `   ... and ${onDemandProjects.length - 5} more\n`;
            }
            flowText += "\n";
          }

          flowText += "💻 **STEP 2: Choose Plan**\n";
          flowText += `✅ Found ${plans.length} available plans\n`;
          flowText += "Popular options:\n";
          const popularPlans = plans.filter((p) =>
            [
              "c2-small-x86",
              "c2-medium-x86",
              "c3-small-x86",
              "m3-large-x86",
            ].includes(p.attributes.slug)
          );
          popularPlans.forEach((plan, index) => {
            const regions = regionMappings[plan.attributes.slug] || [
              "Multiple regions",
            ];
            flowText += `   ${index + 1}. ${plan.attributes.slug} - ${
              plan.attributes.name
            }\n`;
            flowText += `      CPU: ${plan.attributes.specs.cpu.cores} cores ${plan.attributes.specs.cpu.type}\n`;
            flowText += `      Memory: ${plan.attributes.specs.memory.total}GB\n`;
            flowText += `      Regions: ${regions.slice(0, 4).join(", ")}${
              regions.length > 4 ? "..." : ""
            }\n`;
          });
          flowText += "\n";

          flowText += "🌍 **STEP 3: Select Region**\n";
          flowText +=
            "Region availability depends on the selected plan. Common regions:\n";
          flowText += "   • US: NYC, LAX, DAL, CHI, MIA2\n";
          flowText += "   • LATAM: SAO, SAO2, MEX2, BGT, SAN3\n";
          flowText += "   • APAC: TYO3, SYD, SGP\n";
          flowText += "   • EU: LON, FRA, AMS\n\n";

          flowText += "🖥️ **STEP 4: Choose Operating System**\n";
          flowText += "Recommended: ubuntu_24_04_x64_lts (most compatible)\n";
          flowText += "Other options: centos_8_x64, debian_12_x64, etc.\n\n";

          flowText += "🏷️ **STEP 5: Set Hostname**\n";
          flowText += "Unique name to identify your server\n\n";

          flowText += "⚙️ **OPTIONAL CONFIGURATION**\n";
          flowText += "   • SSH Keys: For secure access\n";
          flowText += "   • Tags: For organization\n";
          flowText += "   • User Data: Initialization script\n";
          flowText += "   • Startup Script: Post-boot configuration\n";
          flowText += "   • Billing Type: hourly, monthly, yearly\n\n";

          flowText += "✅ **VALIDATION CHECKLIST**\n";
          flowText += "Before creating a server, ensure:\n";
          flowText += "   1. Project has provisioning_type='on_demand'\n";
          flowText += "   2. Plan is available in your desired region\n";
          flowText += "   3. Operating system is supported\n";
          flowText += "   4. Hostname is unique\n\n";

          flowText += "💡 **TIPS**\n";
          flowText +=
            "   • Use 'validate_server_config' tool before creation\n";
          flowText += "   • Start with c2-small-x86 for testing\n";
          flowText += "   • Choose region closest to your users\n";
          flowText += "   • Use hourly billing for temporary servers\n";

          return {
            content: [
              {
                type: "text",
                text: flowText,
              },
            ],
          };
        }

        case "validate_server_config": {
          const parsed = ValidateServerConfigArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for validate_server_config: ${parsed.error}`
            );
          }

          let validationText = "🔍 **SERVER CONFIGURATION VALIDATION**\n\n";
          let isValid = true;
          const issues = [];
          const warnings = [];

          try {
            // Validate project
            validationText += "📁 **PROJECT VALIDATION**\n";
            const projects = await latitudeClient.getProjects({});
            const project = projects.projects.find(
              (p: any) => p.id === parsed.data.project_id
            );

            if (!project) {
              issues.push("Project not found");
              validationText += `❌ Project ${parsed.data.project_id} not found\n`;
              isValid = false;
            } else if (project.attributes.provisioning_type !== "on_demand") {
              issues.push("Project is not on-demand");
              validationText += `❌ Project is '${project.attributes.provisioning_type}', must be 'on_demand'\n`;
              isValid = false;
            } else {
              validationText += `✅ Project ${project.attributes.name} is valid (on-demand)\n`;
            }

            // Validate plan
            validationText += "\n💻 **PLAN VALIDATION**\n";
            const plans = await latitudeClient.getAvailablePlans();
            const plan = plans.find(
              (p) => p.attributes.slug === parsed.data.plan
            );

            if (!plan) {
              issues.push("Plan not found");
              validationText += `❌ Plan '${parsed.data.plan}' not found\n`;
              isValid = false;
            } else {
              validationText += `✅ Plan ${plan.attributes.name} is available\n`;
              validationText += `   CPU: ${plan.attributes.specs.cpu.cores} cores ${plan.attributes.specs.cpu.type}\n`;
              validationText += `   Memory: ${plan.attributes.specs.memory.total}GB\n`;
            }

            // Validate region
            validationText += "\n🌍 **REGION VALIDATION**\n";
            if (plan) {
              const planRegions = plan.attributes.regions;
              const regionAvailable = planRegions.some(
                (region) =>
                  region.locations.available.includes(parsed.data.region) ||
                  region.locations.in_stock.includes(parsed.data.region)
              );

              if (!regionAvailable) {
                issues.push("Region not available for this plan");
                validationText += `❌ Region '${parsed.data.region}' not available for plan '${parsed.data.plan}'\n`;
                isValid = false;
              } else {
                const inStock = planRegions.some((region) =>
                  region.locations.in_stock.includes(parsed.data.region)
                );
                if (inStock) {
                  validationText += `✅ Region '${parsed.data.region}' is in stock\n`;
                } else {
                  validationText += `⚠️ Region '${parsed.data.region}' is available but may have limited stock\n`;
                  warnings.push("Region may have limited stock");
                }
              }
            }

            // Validate OS
            if (parsed.data.operating_system) {
              validationText += "\n🖥️ **OPERATING SYSTEM VALIDATION**\n";
              const commonOS = [
                "ubuntu_24_04_x64_lts",
                "ubuntu_22_04_x64_lts",
                "centos_8_x64",
                "debian_12_x64",
                "rocky_9_x64",
              ];
              if (commonOS.includes(parsed.data.operating_system)) {
                validationText += `✅ Operating system '${parsed.data.operating_system}' is supported\n`;
              } else {
                validationText += `⚠️ Operating system '${parsed.data.operating_system}' may not be supported\n`;
                warnings.push("Uncommon operating system");
              }
            }
          } catch (error) {
            issues.push("API error during validation");
            validationText += `❌ Error during validation: ${
              error instanceof Error ? error.message : String(error)
            }\n`;
            isValid = false;
          }

          // Summary
          validationText += "\n📋 **VALIDATION SUMMARY**\n";
          if (isValid && issues.length === 0) {
            validationText +=
              "✅ Configuration is valid and ready for server creation\n";
          } else {
            validationText += `❌ Configuration has ${issues.length} issue(s) that must be fixed\n`;
            issues.forEach((issue) => (validationText += `   • ${issue}\n`));
          }

          if (warnings.length > 0) {
            validationText += `⚠️ ${warnings.length} warning(s):\n`;
            warnings.forEach(
              (warning) => (validationText += `   • ${warning}\n`)
            );
          }

          if (!isValid) {
            validationText += "\n💡 **SUGGESTIONS**\n";
            validationText +=
              "   • Use 'get_server_creation_flow' to see available options\n";
            validationText +=
              "   • Use 'list_projects' to find on-demand projects\n";
            validationText +=
              "   • Use 'get_available_plans' to see all plans\n";
          }

          return {
            content: [
              {
                type: "text",
                text: validationText,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  // Start server
  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Latitude.sh MCP Server running on stdio");

    // Test connection on startup
    try {
      await latitudeClient.testConnection();
      console.error("✅ Successfully connected to latitude.sh API");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // Sanitize any potential API key exposure
      const sanitizedMessage = errorMessage
        .replace(/Bearer [a-zA-Z0-9]+/g, "Bearer ***")
        .replace(/api[_-]?key[=:]\s*[a-zA-Z0-9]+/gi, "api_key=***")
        .replace(/lat_[a-zA-Z0-9]+/g, "lat_***");
      console.error("❌ Error testing connection:", sanitizedMessage);
    }
  }

  runServer().catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Fatal error running server:", errorMessage);

    // Provide helpful error messages for common issues
    if (errorMessage.includes("API key")) {
      console.error("💡 Tip: Check your LATITUDE_API_KEY environment variable");
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      console.error("💡 Tip: Check your internet connection and API endpoint");
    }

    process.exit(1);
  });
} catch (error) {
  console.error(
    "❌ Configuration error:",
    error instanceof Error ? error.message : String(error)
  );
  console.error("");
  console.error("📋 Setup Instructions:");
  console.error("1. Copy env.example to .env.local");
  console.error("2. Add your Latitude.sh API key to .env.local");
  console.error("3. Run the server again");
  console.error("");
  console.error("Example .env.local file:");
  console.error("LATITUDE_API_KEY=your-api-key-here");
  console.error("LATITUDE_BASE_URL=https://api.latitude.sh");
  console.error("LATITUDE_TIMEOUT=10000");
  process.exit(1);
}
