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
import type { LatitudeAPIConfig } from "./types/latitude.js";
import { getAPIConfig } from "./config.js";

// Schema definitions for tool arguments
const ListProjectsArgsSchema = z.object({
  // Pagination
  "page[size]": z.number().min(1).max(100).optional().default(20),
  "page[number]": z.number().min(1).optional().default(1),

  // Advanced filters
  "filter[name]": z.string().min(1).max(100).optional(),
  "filter[slug]": z.string().min(1).max(100).optional(),
  "filter[description]": z.string().min(1).max(500).optional(),
  "filter[billing_type]": z.string().min(1).max(50).optional(),
  "filter[environment]": z.string().min(1).max(50).optional(),
  "filter[tags]": z.string().min(1).max(200).optional(),

  // Extra fields
  "extra_fields[projects]": z.string().optional(),

  // Legacy support
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  query: z.string().min(1).max(200).optional(),
});

const GetProjectArgsSchema = z.object({
  projectId: z.string().min(1).describe("The ID of the project to retrieve"),
});

const SearchProjectsArgsSchema = z.object({
  query: z.string().min(1).max(200).describe("Search query to find projects"),
  limit: z
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

  // Advanced filters
  "filter[name]": z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by project status"),
});

// const TestConnectionArgsSchema already declared above

const GetAvailablePlansArgsSchema = z.object({});

const GetServerCreationFlowArgsSchema = z.object({});

const ValidateServerConfigArgsSchema = z.object({
  project_id: z.string().describe("Project ID to validate"),
  plan: z.string().min(1).describe("Plan ID (plan_...) to validate"),
  region: z.string().describe("Region code to validate"),
  operating_system: z.string().optional().describe("OS to validate"),
});

// Operating systems list (supports optional pagination)
const ListOperatingSystemsArgsSchema = z.object({
  "page[size]": z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Number of items per page (default 20)"),
  "page[number]": z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page number to return (starts at 1, default 1)"),
});

const GetAvailableRegionsArgsSchema = z.object({
  plan: z
    .string()
    .min(1)
    .describe("Plan ID (plan_...) to check availability for"),
  project_id: z
    .string()
    .optional()
    .describe("Project ID for project-specific region availability"),
});

const ListRegionsArgsSchema = z.object({});

const GetRegionArgsSchema = z.object({
  regionId: z.string().min(1).describe("Region ID to retrieve (e.g., loc_...)"),
});

const GetServerDeployConfigArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .describe("The ID of the server to get deploy configuration for"),
});

const TestConnectionArgsSchema = z.object({});

// Extra schemas for tools registered in ListTools
const GetPlanArgsSchema = z.object({
  planId: z
    .string()
    .min(1)
    .describe("The ID of the plan to retrieve (e.g., plan_...)"),
});

const UpdateServerDeployConfigArgsSchema = z.object({
  serverId: z.string().min(1),
  hostname: z.string().optional(),
  operating_system: z.string().optional(),
  raid: z.string().optional(),
  user_data: z.number().int().nullable().optional(),
  ssh_keys: z.array(z.number().int()).optional(),
  partitions: z
    .array(
      z.object({
        path: z.string(),
        size_in_gb: z.number().int(),
        filesystem_type: z.string(),
      })
    )
    .optional(),
  ipxe_url: z.string().url().nullable().optional(),
});

const LockServerArgsSchema = z.object({
  serverId: z.string().min(1),
});

const UnlockServerArgsSchema = z.object({
  serverId: z.string().min(1),
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
    .describe("The ID of the project to delete (REQUIRED)"),
  confirm: z
    .boolean()
    .optional()
    .default(false)
    .describe("Confirmation flag to prevent accidental deletion (OPTIONAL)"),
});

const ListServersArgsSchema = z.object({
  // Pagination
  "page[size]": z.number().min(1).max(100).optional().default(20),
  "page[number]": z.number().min(1).optional().default(1),

  // Basic filters
  status: z.string().optional(),
  projectId: z.string().min(1).optional(),

  // Advanced filters
  "filter[project]": z.string().optional(),
  "filter[region]": z.string().optional(),
  "filter[hostname]": z.string().min(1).max(100).optional(),
  "filter[created_at_gte]": z.string().optional(),
  "filter[created_at_lte]": z.string().optional(),
  "filter[label]": z.string().min(1).max(100).optional(),
  "filter[status]": z.string().min(1).max(50).optional(),
  "filter[plan]": z.string().min(1).max(100).optional(),
  "filter[gpu]": z.boolean().optional(),
  "filter[ram][eql]": z.number().min(1).optional(),
  "filter[ram][gte]": z.number().min(1).optional(),
  "filter[ram][lte]": z.number().min(1).optional(),
  "filter[disk][eql]": z.number().min(1).optional(),
  "filter[disk][gte]": z.number().min(1).optional(),
  "filter[disk][lte]": z.number().min(1).optional(),
  "filter[tags]": z.string().min(1).max(200).optional(),

  // Extra fields
  "extra_fields[servers]": z.string().optional(),

  // Legacy support
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  region: z.string().optional(),
  plan: z.string().optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

const CreateServerArgsSchema = z.object({
  project: z.string().min(1),
  plan: z.string().min(1),
  operating_system: z.string().min(1),
  hostname: z.string().min(1).max(100),
  site: z.string().min(1),
  sshKeys: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  userData: z.string().max(16384).optional(),
  startupScript: z.string().max(16384).optional(),
});

const GetServerArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .describe("The ID of the server to retrieve (REQUIRED)"),
});

const UpdateServerArgsSchema = z.object({
  serverId: z.string().min(1),
  hostname: z.string().min(1).max(100).optional(),
  billing: z.enum(["hourly", "monthly", "yearly"]).optional(),
  project: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

const DeleteServerArgsSchema = z.object({
  server_id: z.string().min(1),
  reason: z.string().max(500).optional(),
  confirm: z.boolean().optional().default(false),
});

// Define ToolInput type locally
const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Server setup
const server = new Server(
  {
    name: "latitude-sh-server",
    version: "0.4.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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
            "Supports official filters (name, slug, description, billing_type, environment, tags) and pagination. " +
            "Returns detailed information about each project including name, description, dates, and metadata.",
          inputSchema: zodToJsonSchema(ListProjectsArgsSchema) as ToolInput,
        },
        {
          name: "lock_server",
          description:
            "Lock a server to prevent deletion/modification and actions.",
          inputSchema: zodToJsonSchema(
            z.object({
              serverId: z
                .string()
                .min(1)
                .regex(
                  /^[a-zA-Z0-9_-]+$/,
                  "Server ID must contain only letters, numbers, hyphens, and underscores"
                ),
            })
          ) as ToolInput,
        },
        {
          name: "unlock_server",
          description: "Unlock a previously locked server.",
          inputSchema: zodToJsonSchema(
            z.object({
              serverId: z
                .string()
                .min(1)
                .regex(
                  /^[a-zA-Z0-9_-]+$/,
                  "Server ID must contain only letters, numbers, hyphens, and underscores"
                ),
            })
          ) as ToolInput,
        },
        {
          name: "get_project",
          description:
            "Get detailed information about a specific project by its ID. " +
            "Returns comprehensive project details including metadata and settings.",
          inputSchema: zodToJsonSchema(GetProjectArgsSchema) as ToolInput,
        },
        {
          name: "search_projects",
          description:
            "Search for projects using a query string. " +
            "Maps query to filter[name] and supports pagination.",
          inputSchema: zodToJsonSchema(SearchProjectsArgsSchema) as ToolInput,
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
            "You can filter by status (any string), project, region, plan, tags, and paginate results. " +
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
          name: "get_server_deploy_config",
          description:
            "Retrieve a server's deploy configuration (ssh_keys, user_data, raid, OS, hostname, ipxe, partitions).",
          inputSchema: zodToJsonSchema(
            GetServerDeployConfigArgsSchema
          ) as ToolInput,
        },
        {
          name: "update_server_deploy_config",
          description:
            "Update a server's deploy configuration (hostname, OS, raid, user_data id, ssh_keys ids, partitions, ipxe_url).",
          inputSchema: zodToJsonSchema(
            UpdateServerDeployConfigArgsSchema
          ) as ToolInput,
        },
        {
          name: "get_plan",
          description:
            "Get a specific plan by its ID. Returns slug, name, features, specs and regions with availability/pricing.",
          inputSchema: zodToJsonSchema(
            z.object({
              planId: z
                .string()
                .min(1)
                .regex(
                  /^plan_[a-zA-Z0-9]+$/,
                  "Plan ID must be in format 'plan_XXXX'"
                )
                .describe("The ID of the plan to retrieve (e.g., plan_...)"),
            })
          ) as ToolInput,
        },
        {
          name: "list_regions",
          description:
            "List all global regions. Returns name, slug, facility, and country.",
          inputSchema: zodToJsonSchema(ListRegionsArgsSchema) as ToolInput,
        },
        {
          name: "get_region",
          description:
            "Retrieve a specific region by its ID (e.g., loc_...). Returns detailed region information.",
          inputSchema: zodToJsonSchema(GetRegionArgsSchema) as ToolInput,
        },
        {
          name: "test_connection",
          description:
            "Test the connection to the latitude.sh API. " +
            "Verifies that the API key is valid and the server can communicate with latitude.sh.",
          inputSchema: zodToJsonSchema(TestConnectionArgsSchema) as ToolInput,
        },
        {
          name: "list_operating_systems",
          description:
            "List all operating systems available for server deployment.",
          inputSchema: zodToJsonSchema(
            ListOperatingSystemsArgsSchema
          ) as ToolInput,
        },
        {
          name: "get_server_creation_flow",
          description:
            "Retrieve metadata needed for the interactive server creation workflow (on-demand projects, all plans, and popular plan slugs).",
          inputSchema: zodToJsonSchema(
            GetServerCreationFlowArgsSchema
          ) as ToolInput,
        },
        {
          name: "validate_server_config",
          description:
            "Validate a proposed server configuration (project, plan, region, operating_system) against live Latitude.sh data before creation.",
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

          const apiLike = {
            data: result.projects,
            meta: {
              total: result.total,
              page: result.page,
              limit: result.limit,
            },
          };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
          const apiLike = { data: project, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "search_projects": {
          const parsed = SearchProjectsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for search_projects: ${parsed.error}`
            );
          }

          const searchParams: Record<string, unknown> = {
            limit: parsed.data.limit,
          };
          if (parsed.data["page[number]"] !== undefined) {
            searchParams["page[number]"] = parsed.data["page[number]"];
          }

          const result = await latitudeClient.searchProjects(
            parsed.data.query,
            searchParams as any
          );

          if (!result || !result.projects) {
            throw new Error("Invalid API response: missing projects data");
          }

          const apiLike = {
            data: result.projects,
            meta: {
              total: result.total,
              page: result.page,
              limit: result.limit,
            },
          };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
          const apiLike = { data: project, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
          const apiLike = { data: project, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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

          const apiLike = {
            data: null,
            meta: { deleted: true, project_id: projectId },
          };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "list_servers": {
          const parsed = ListServersArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_servers: ${parsed.error}`
            );
          }

          const result = await latitudeClient.getServers(parsed.data as any);

          if (!result || !result.servers) {
            throw new Error("Invalid API response: missing servers data");
          }

          const serversApi = {
            data: result.servers,
            meta: {
              total: result.total,
              page: result.page,
              limit: result.limit,
            },
          };

          return {
            content: [
              { type: "text", text: JSON.stringify(serversApi, null, 2) },
            ],
          };
        }

        case "create_server": {
          const parsed = CreateServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for create_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.createServer({
            hostname: parsed.data.hostname,
            projectId: parsed.data.project,
            regionId: parsed.data.site,
            planId: parsed.data.plan,
            ...(parsed.data.operating_system && {
              operating_system: parsed.data.operating_system,
            }),
            ...(parsed.data.sshKeys && { sshKeys: parsed.data.sshKeys }),
            ...(parsed.data.tags && { tags: parsed.data.tags }),
            ...(parsed.data.userData && { userData: parsed.data.userData }),
            ...(parsed.data.startupScript && {
              startupScript: parsed.data.startupScript,
            }),
          });
          const apiLike = { data: server, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
          const apiLike = { data: server, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "update_server": {
          const parsed = UpdateServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for update_server: ${parsed.error}`
            );
          }

          const { serverId, hostname, billing, project, tags } =
            parsed.data as {
              serverId: string;
              hostname?: string;
              billing?: "hourly" | "monthly" | "yearly";
              project?: string;
              tags?: string[];
            };
          const updateAttrs: {
            hostname?: string;
            billing?: "hourly" | "monthly" | "yearly";
            project?: string;
            tags?: string[];
          } = {};
          if (hostname) updateAttrs.hostname = hostname;
          if (billing) updateAttrs.billing = billing;
          if (project) updateAttrs.project = project;
          if (Array.isArray(tags)) updateAttrs.tags = tags;

          const server = await latitudeClient.updateServer(
            serverId,
            updateAttrs
          );
          const apiLike = { data: server, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "delete_server": {
          const parsed = DeleteServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for delete_server: ${parsed.error}`
            );
          }

          // Require confirmation like delete_project for safety
          if (!parsed.data.confirm) {
            return {
              content: [
                {
                  type: "text",
                  text: "❌ Server deletion cancelled. Please set 'confirm' to true to proceed with deletion.",
                },
              ],
              isError: true,
            };
          }

          // Delete the server
          await latitudeClient.deleteServer(parsed.data.server_id);

          const apiLike = {
            data: null,
            meta: {
              deleted: true,
              server_id: parsed.data.server_id,
              reason: parsed.data.reason || null,
            },
          };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "get_available_plans": {
          const parsed = GetAvailablePlansArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_available_plans: ${parsed.error}`
            );
          }

          const plans = await latitudeClient.listPlans();
          const apiLike = { data: plans, meta: { count: plans.length } };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "get_plan": {
          const PlanArgs = z.object({
            planId: z
              .string()
              .min(1)
              .describe("The ID of the plan to retrieve (e.g., plan_...)"),
          });
          const parsed = PlanArgs.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments for get_plan: ${parsed.error}`);
          }

          const plan = await latitudeClient.getPlan(parsed.data.planId);
          const apiLike = { data: plan, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
            parsed.data.plan,
            parsed.data.project_id
          );

          const apiLike = { data: regions, meta: { plan: parsed.data.plan } };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(apiLike, null, 2),
              },
            ],
          };
        }

        case "list_regions": {
          const parsed = ListRegionsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_regions: ${parsed.error}`
            );
          }

          const regions = await latitudeClient.listRegions();
          const apiLike = {
            data: regions.map((r) => ({
              id: r.id,
              type: r.type,
              attributes: r.attributes,
            })),
            meta: {},
          };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "get_region": {
          const parsed = GetRegionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_region: ${parsed.error}`
            );
          }

          const region = await latitudeClient.getRegion(parsed.data.regionId);
          const apiLike = { data: region, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "get_server_deploy_config": {
          const parsed = GetServerDeployConfigArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for get_server_deploy_config: ${parsed.error}`
            );
          }

          const cfg = await latitudeClient.getServerDeployConfig(
            parsed.data.serverId
          );
          const apiLike = { data: cfg, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "update_server_deploy_config": {
          const parsed = UpdateServerDeployConfigArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for update_server_deploy_config: ${parsed.error}`
            );
          }

          const { serverId, ...attrs } = parsed.data as {
            serverId: string;
            hostname?: string;
            operating_system?: string;
            raid?: string;
            user_data?: number | null;
            ssh_keys?: number[];
            partitions?: Array<{
              path: string;
              size_in_gb: number;
              filesystem_type: string;
            }>;
            ipxe_url?: string | null;
          };
          const updated = await latitudeClient.updateServerDeployConfig(
            serverId,
            attrs
          );
          const apiLike = { data: updated, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "lock_server": {
          const LockArgs = z.object({
            serverId: z.string().min(1),
          });
          const parsed = LockArgs.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for lock_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.lockServer(parsed.data.serverId);
          const apiLike = { data: server, meta: { locked: true } };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "unlock_server": {
          const UnlockArgs = z.object({
            serverId: z.string().min(1),
          });
          const parsed = UnlockArgs.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for unlock_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.unlockServer(
            parsed.data.serverId
          );
          const apiLike = { data: server, meta: { locked: false } };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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

        case "list_operating_systems": {
          const parsed = ListOperatingSystemsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_operating_systems: ${parsed.error}`
            );
          }
          const osList = await latitudeClient.listOperatingSystems(parsed.data);
          const apiLike = { data: osList, meta: { total: osList.length } };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
              project.metadata?.provisioning_type === "on_demand"
          );

          // Get available plans (full list)
          const plans = await latitudeClient.listPlans();

          // Popular plan slugs (helper metadata only)
          const popularPlanSlugs = [
            "c2-small-x86",
            "c2-medium-x86",
            "c3-small-x86",
            "m3-large-x86",
          ];

          const data = {
            projects_on_demand: onDemandProjects,
            plans,
            popular_plan_slugs: popularPlanSlugs,
          };
          const meta = {
            total_on_demand_projects: onDemandProjects.length,
            total_plans: plans.length,
          };

          return {
            content: [
              { type: "text", text: JSON.stringify({ data, meta }, null, 2) },
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

          let isValid = true;
          const issues = [];
          const warnings = [];

          try {
            // Validate project
            const projects = await latitudeClient.getProjects({});
            const project = projects.projects.find(
              (p: any) => p.id === parsed.data.project_id
            );

            if (!project) {
              issues.push("Project not found");
              isValid = false;
            } else if (project.metadata?.provisioning_type !== "on_demand") {
              issues.push("Project is not on-demand");
              isValid = false;
            } else {
              // ok
            }

            // Validate plan (using getPlan method)
            let plan = null as unknown as {
              attributes?: {
                regions?: Array<{
                  locations?: { available?: string[]; in_stock?: string[] };
                }>;
              };
            } | null;
            try {
              plan = await latitudeClient.getPlan(parsed.data.plan);
            } catch (error) {
              // Plan not found or error
            }

            if (!plan) {
              issues.push("Plan not found");
              isValid = false;
            }

            // Validate region
            if (plan && plan.attributes?.regions) {
              const planRegions = plan.attributes.regions;
              const regionAvailable = planRegions.some(
                (region: any) =>
                  region.locations?.available?.includes(parsed.data.region) ||
                  region.locations?.in_stock?.includes(parsed.data.region)
              );

              if (!regionAvailable) {
                issues.push("Region not available for this plan");
                isValid = false;
              } else {
                const inStock = planRegions.some((region: any) =>
                  region.locations?.in_stock?.includes(parsed.data.region)
                );
                if (!inStock) warnings.push("Region may have limited stock");
              }
            }

            // Validate OS
            if (parsed.data.operating_system) {
              try {
                // Fetch the list of operating systems from the API so we don't rely on a hard-coded slug list
                const osList = await latitudeClient.listOperatingSystems();
                const osSlugs = osList.map(
                  (os: any) => os?.attributes?.slug ?? os?.id
                );
                if (!osSlugs.includes(parsed.data.operating_system)) {
                  warnings.push(
                    "Operating system slug not found in Latitude.sh catalogue"
                  );
                }
              } catch (e) {
                // If the API call fails, continue without blocking the validation
                warnings.push(
                  "Could not verify operating system against Latitude.sh catalogue"
                );
              }
            }
          } catch (error) {
            issues.push("API error during validation");
            isValid = false;
          }

          const data = {
            valid: isValid && issues.length === 0,
            issues,
            warnings,
            checks: {
              project_id: parsed.data.project_id,
              plan_slug: parsed.data.plan,
              region: parsed.data.region,
              operating_system: parsed.data.operating_system,
            },
          };
          const meta = {} as Record<string, unknown>;

          return {
            content: [
              { type: "text", text: JSON.stringify({ data, meta }, null, 2) },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      let detailed = "";
      if ((error as any)?.apiErrors) {
        try {
          detailed = "\n" + JSON.stringify((error as any).apiErrors, null, 2);
        } catch {
          detailed = "\n" + String((error as any).apiErrors);
        }
      }
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}${detailed}`,
          },
        ],
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
