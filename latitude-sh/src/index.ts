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
  owner: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Owner ID must contain only alphanumeric characters, dots, hyphens, and underscores"
    )
    .optional()
    .describe("Filter by owner ID"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Filter by tags"),
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
    .default("on_demand")
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
  provisioning_type: z
    .enum(["on_demand", "reserved"])
    .optional()
    .describe("New provisioning type for the project (OPTIONAL)"),
  billing_type: z
    .enum(["Normal", "Enterprise"])
    .optional()
    .describe("New billing type for the project (OPTIONAL)"),
  billing_method: z
    .enum(["Normal", "Enterprise"])
    .optional()
    .describe("New billing method for the project (OPTIONAL)"),
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
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Maximum number of servers to return (1-100)"),
  page: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number for pagination"),
  status: z
    .enum(["running", "stopped", "starting", "stopping", "error", "deleted"])
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
  region: z.string().min(1).optional().describe("Filter by region slug"),
  plan: z.string().min(1).optional().describe("Filter by plan slug"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("Filter by tags"),
});

const CreateServerArgsSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Name of the server to create (REQUIRED)"),
  projectId: z
    .string()
    .min(1)
    .regex(
      /^proj_[a-zA-Z0-9]+$/,
      "Project ID must be in format 'proj_123456789'"
    )
    .describe("The ID of the project to create the server in (REQUIRED)"),
  regionId: z
    .string()
    .min(1)
    .describe(
      "The ID of the region where the server will be deployed (REQUIRED)"
    ),
  planId: z
    .string()
    .min(1)
    .describe("The ID of the plan/specification for the server (REQUIRED)"),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("Description of the server (OPTIONAL)"),
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
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("New name for the server (OPTIONAL)"),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("New description for the server (OPTIONAL)"),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .describe("New tags for the server (OPTIONAL)"),
  sshKeys: z
    .array(z.string().min(1))
    .optional()
    .describe("New array of SSH key IDs for the server (OPTIONAL)"),
});

const DeleteServerArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Server ID must contain only letters, numbers, hyphens, and underscores"
    )
    .describe("The ID of the server to delete (REQUIRED)"),
  confirm: z
    .boolean()
    .describe(
      "Confirmation flag to prevent accidental deletion. Must be true to proceed (REQUIRED)"
    ),
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
  return `📁 **${project.name}** (ID: ${project.id})
📝 Description: ${project.description || "No description"}
👤 Owner: ${project.owner.name} (${project.owner.email})
📅 Created: ${
    isValidDate(project.createdAt)
      ? new Date(project.createdAt).toLocaleString()
      : "Unknown"
  }
📅 Updated: ${
    isValidDate(project.updatedAt)
      ? new Date(project.updatedAt).toLocaleString()
      : "Unknown"
  }
🏷️ Status: ${project.status}
${
  project.collaborators && project.collaborators.length > 0
    ? `👥 Collaborators: ${project.collaborators.length}`
    : ""
}
${project.settings ? `🔒 Visibility: ${project.settings.visibility}` : ""}
${
  "metadata" in project && project.metadata?.tags
    ? `🏷️ Tags: ${project.metadata.tags.join(", ")}`
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
  const statusEmoji = {
    running: "🟢",
    stopped: "🔴",
    starting: "🟡",
    stopping: "🟡",
    error: "❌",
    deleted: "🗑️",
  };

  return `🖥️ **${server.name}** (ID: ${server.id})
📝 Description: ${server.description || "No description"}
🏷️ Status: ${statusEmoji[server.status]} ${server.status}
🌍 Region: ${server.region.name} (${server.region.slug})
💻 Plan: ${server.plan.name} - $${server.plan.price} ${server.plan.currency}
📅 Created: ${
    isValidDate(server.createdAt)
      ? new Date(server.createdAt).toLocaleString()
      : "Unknown"
  }
📅 Updated: ${
    isValidDate(server.updatedAt)
      ? new Date(server.updatedAt).toLocaleString()
      : "Unknown"
  }
🌐 IP Address: ${server.ipAddress || "Not assigned"}
🔒 Private IP: ${server.privateIpAddress || "Not assigned"}
${
  server.metadata
    ? `💾 Specs: ${server.metadata.cpu} CPU, ${server.metadata.memory}MB RAM, ${server.metadata.disk}GB Disk`
    : ""
}
${
  server.tags && server.tags.length > 0
    ? `🏷️ Tags: ${server.tags.join(", ")}`
    : ""
}
${
  "specs" in server && server.specs
    ? `⚙️ Detailed Specs: ${server.specs.cpu} CPU, ${server.specs.memory}MB RAM, ${server.specs.disk}GB Disk, ${server.specs.bandwidth}GB Bandwidth`
    : ""
}
${
  "network" in server && server.network
    ? `🌐 Network: Public IP: ${server.network.publicIp}, Private IP: ${
        server.network.privateIp || "N/A"
      }`
    : ""
}
${
  "os" in server && server.os
    ? `💿 OS: ${server.os.name} ${server.os.version} (${server.os.architecture})`
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
          name: "test_connection",
          description:
            "Test the connection to the latitude.sh API. " +
            "Verifies that the API key is valid and the server can communicate with latitude.sh.",
          inputSchema: zodToJsonSchema(TestConnectionArgsSchema) as ToolInput,
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

          if (!parsed.data.confirm) {
            return {
              content: [
                {
                  type: "text",
                  text: "❌ Server deletion cancelled. Set 'confirm' to true to proceed with deletion.",
                },
              ],
            };
          }

          await latitudeClient.deleteServer(parsed.data.serverId);

          return {
            content: [
              {
                type: "text",
                text: `✅ Server ${parsed.data.serverId} deleted successfully!`,
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
