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
  // Pagination (compatible with Cursor)
  pageSize: z
    .number()
    .min(1)
    .optional()
    .default(20)
    .describe("Number of items to return per page"),
  pageNumber: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1)"),

  // Filters (compatible with Cursor)
  filterName: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("The project name to filter by"),
  filterSlug: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("The project slug to filter by"),
  filterDescription: z
    .string()
    .min(1)
    .max(500)
    .optional()
    .describe("The project description to filter by"),
  filterBillingType: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("The billing type to filter by"),
  filterEnvironment: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("The environment to filter by"),
  filterTags: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("The tags ids to filter by, separated by comma"),

  // Extra fields
  extraFieldsProjects: z.string().optional(),
});

const GetProjectArgsSchema = z.object({
  projectId: z.string().min(1).describe("The ID of the project to retrieve"),
});

const ListPlansArgsSchema = z.object({
  // Official filters (compatible with Cursor)
  filterName: z.string().optional().describe("The plan name to filter by"),
  filterSlug: z.string().optional().describe("The plan slug to filter by"),
  filterLocation: z
    .string()
    .optional()
    .describe("The location of the site to filter by"),
  filterStockLevel: z
    .string()
    .optional()
    .describe("The stock level at the site to filter by"),
  filterInStock: z
    .boolean()
    .optional()
    .describe("The stock available at the site to filter by"),
  filterGpu: z
    .boolean()
    .optional()
    .describe("Filter by the existence of an associated GPU"),

  // RAM filters with operators
  filterRamEql: z
    .number()
    .optional()
    .describe("Filter for RAM equal to the provided value in GB"),
  filterRamGte: z
    .number()
    .optional()
    .describe("Filter for RAM greater or equal to the provided value in GB"),
  filterRamLte: z
    .number()
    .optional()
    .describe("Filter for RAM lower or equal to the provided value in GB"),

  // Disk filters with operators
  filterDiskEql: z
    .number()
    .optional()
    .describe("Filter for disk equal to the provided value in GB"),
  filterDiskGte: z
    .number()
    .optional()
    .describe("Filter for disk greater or equal to the provided value in GB"),
  filterDiskLte: z
    .number()
    .optional()
    .describe("Filter for disk lower or equal to the provided value in GB"),
});

const GetPlanArgsSchema = z.object({
  planId: z
    .string()
    .min(1)
    .describe("The ID of the plan to retrieve (e.g., plan_...)"),
});

// Operating systems list (compatible with Cursor)
const ListOperatingSystemsArgsSchema = z.object({
  pageSize: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(20)
    .describe("Number of items per page (≥1, default: 20)"),
  pageNumber: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1, default: 1)"),
});

const ListRegionsArgsSchema = z.object({
  // Pagination parameters (compatible with Cursor)
  pageSize: z
    .number()
    .min(1)
    .optional()
    .default(20)
    .describe("Number of items to return per page (≥1, default: 20)"),
  pageNumber: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1, default: 1)"),
});

const GetRegionArgsSchema = z.object({
  regionId: z.string().min(1).describe("Region ID to retrieve (e.g., loc_...)"),
});

const GetServerDeployConfigArgsSchema = z.object({
  serverId: z.string().min(1).describe("The Server ID"),
});

const TestConnectionArgsSchema = z.object({});

// Extra schemas for tools registered in ListTools

const UpdateServerDeployConfigArgsSchema = z.object({
  serverId: z.string().min(1).describe("The Server ID"),
  hostname: z.string().optional().describe("Server hostname"),
  operatingSystem: z.string().optional().describe("Operating system slug"),
  raid: z.string().optional().describe("RAID configuration"),
  userData: z
    .number()
    .int()
    .optional()
    .describe("User data to configure the server"),
  sshKeys: z
    .array(z.number().int())
    .optional()
    .describe("Array of SSH key IDs"),
  partitions: z
    .array(
      z.object({
        path: z.string().describe("Partition mount path"),
        sizeInGb: z.number().int().describe("Partition size in GB"),
        filesystemType: z.string().describe("Filesystem type"),
      })
    )
    .optional()
    .describe("Partition configuration"),
  ipxeUrl: z
    .string()
    .optional()
    .describe(
      "URL where iPXE script is stored on, necessary for custom image deployments"
    ),
});

const LockServerArgsSchema = z.object({
  serverId: z.string().min(1).describe("The server ID"),
});

const UnlockServerArgsSchema = z.object({
  serverId: z.string().min(1).describe("The server ID"),
});

// New: Start Out Of Band Connection Args
const StartOobConnectionArgsSchema = z.object({
  serverId: z.string().min(1).describe("The server ID"),
  sshKeyId: z.string().optional().describe("SSH Key ID to set for out of band"),
});

// New: List Out Of Band Connections Args
const ListOobConnectionsArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to list OOB connections for"),
});

// New: Run Server Action Args
const RunServerActionArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to run action on"),
  action: z
    .enum(["power_on", "power_off", "reboot"])
    .describe("Action to perform on the server"),
});

// New: Generate IPMI Credentials Args
const GenerateIPMICredentialsArgsSchema = z.object({
  serverId: z
    .string()
    .min(1)
    .describe("Server ID to generate IPMI credentials for"),
});

// New: Enter Rescue Mode Args
const EnterRescueModeArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to put in rescue mode"),
});

// New: Exit Rescue Mode Args
const ExitRescueModeArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to exit rescue mode"),
});

// New: Schedule Server Deletion Args
const ScheduleServerDeletionArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to schedule for deletion"),
});

// New: Unschedule Server Deletion Args
const UnscheduleServerDeletionArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to unschedule deletion for"),
});

// New: Server Reinstall Args
const ServerReinstallArgsSchema = z.object({
  serverId: z.string().min(1).describe("Server ID to reinstall"),
  operatingSystem: z
    .string()
    .optional()
    .describe("The OS selected for the reinstall process"),
  hostname: z
    .string()
    .optional()
    .describe("The server hostname to set upon reinstall"),
  partitions: z
    .array(
      z.object({
        sizeInGb: z.number().describe("Partition size in GB"),
        path: z.string().describe("Partition mount path"),
        filesystemType: z.string().describe("Filesystem type"),
      })
    )
    .optional()
    .describe("Partition configuration"),
  sshKeys: z
    .array(z.string())
    .optional()
    .describe("SSH Keys to set upon reinstall"),
  userData: z
    .number()
    .optional()
    .describe("User data ID to set upon reinstall"),
  raid: z.string().optional().describe("RAID mode for the server"),
  ipxe: z
    .string()
    .optional()
    .describe(
      "iPXE script URL or base64 encoded script (required when OS is iPXE)"
    ),
});

const CreateProjectArgsSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Name of the project to create (REQUIRED)"),
  provisioningType: z
    .enum(["on_demand", "reserved"])
    .optional()
    .default("on_demand")
    .describe(
      "Provisioning type for the project (REQUIRED, default: on_demand)"
    ),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("Description of the project (OPTIONAL)"),
  environment: z
    .enum(["Development", "Production", "Staging"])
    .optional()
    .describe("Environment for the project (OPTIONAL)"),
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
    .describe("New environment for the project (OPTIONAL)"),
  bandwidthAlert: z
    .boolean()
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
});

const ListServersArgsSchema = z.object({
  // Pagination parameters (compatible with Cursor)
  pageSize: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(20)
    .describe("Number of items to return per page (≥1, default: 20)"),
  pageNumber: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number to return (starts at 1, default: 1)"),

  // Filters (compatible with Cursor)
  filterProject: z
    .string()
    .optional()
    .describe("The project ID or Slug to filter by"),
  filterRegion: z.string().optional().describe("The region Slug to filter by"),
  filterHostname: z
    .string()
    .optional()
    .describe("The hostname of server to filter by"),
  filterCreatedAtGte: z
    .string()
    .optional()
    .describe("The created at greater than equal date to filter by"),
  filterCreatedAtLte: z
    .string()
    .optional()
    .describe("The created at less than equal date to filter by"),
  filterLabel: z
    .string()
    .optional()
    .describe("The label of server to filter by"),
  filterStatus: z
    .string()
    .optional()
    .describe("The status of server to filter by"),
  filterPlan: z
    .string()
    .optional()
    .describe("The platform/plan name of the server to filter by"),
  filterGpu: z
    .boolean()
    .optional()
    .describe("Filter by the existence of an associated GPU"),

  // Advanced RAM filters
  filterRamEql: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Filter servers with RAM size (in GB) equals the provided value"),
  filterRamGte: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Filter servers with RAM size (in GB) greater than or equal the provided value"
    ),
  filterRamLte: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Filter servers with RAM size (in GB) less than or equal the provided value"
    ),

  // Advanced Disk filters
  filterDisk: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("The disk size in Gigabytes to filter by"),
  filterDiskEql: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Filter servers with disk size (in GB) equals the provided value"
    ),
  filterDiskGte: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Filter servers with disk size (in GB) greater than or equal the provided value"
    ),
  filterDiskLte: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Filter servers with disk size (in GB) less than or equal the provided value"
    ),

  filterTags: z
    .string()
    .optional()
    .describe(
      "The tags IDs to filter by, separated by comma, e.g. filter[tags]=tag_1,tag_2"
    ),

  // Extra fields
  extraFieldsServers: z
    .string()
    .optional()
    .describe(
      "The credentials are provided as extra attributes that is lazy loaded. Set to 'credentials' to request it"
    ),
});

const CreateServerArgsSchema = z.object({
  // Required parameters according to official docs
  project: z
    .string()
    .min(1)
    .describe("The project (ID or Slug) to deploy the server"),
  plan: z
    .string()
    .min(1)
    .describe(
      "The plan slug to choose server from, defining the specs the server will have"
    ),
  site: z.string().min(1).describe("The site slug to deploy the server"),
  operatingSystem: z
    .string()
    .min(1)
    .describe("The operating system slug for the new server"),
  hostname: z.string().min(1).max(100).describe("The server hostname"),

  // Optional parameters according to official docs
  sshKeys: z
    .array(z.string().min(1))
    .optional()
    .describe("SSH Keys to set on the server"),
  userData: z
    .string()
    .optional()
    .describe(
      "User data ID to set on the server. This is a custom script that will run after the deploy"
    ),
  raid: z.string().optional().describe("RAID mode for the server"),
  ipxe: z
    .string()
    .optional()
    .describe(
      "URL where iPXE script is stored on, OR the iPXE script encoded in base64. Required when iPXE is selected as operating system"
    ),
  billing: z
    .enum(["hourly", "monthly", "yearly"])
    .optional()
    .describe(
      "The server billing type. Accepts hourly and monthly for on demand projects and yearly for reserved projects"
    ),
});

const GetServerArgsSchema = z.object({
  serverId: z.string().min(1).describe("The Server ID"),
  extraFieldsServers: z
    .string()
    .optional()
    .describe(
      "The credentials are provided as extra attributes that is lazy loaded. To request it, just set extra_fields[servers]=credentials in the query string"
    ),
});

const UpdateServerArgsSchema = z.object({
  serverId: z.string().min(1).describe("The Server ID"),
  hostname: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Defaults to new-hostname"),
  billing: z
    .enum(["hourly", "monthly", "yearly"])
    .optional()
    .describe(
      "The server billing type. Accepts hourly and monthly for on demand projects and yearly for reserved projects"
    ),
  project: z
    .string()
    .min(1)
    .optional()
    .describe("Project ID or slug to move the server to"),
  tags: z.array(z.string().min(1)).optional().describe("List of Tag IDs"),
});

const DeleteServerArgsSchema = z.object({
  serverId: z.string().min(1).describe("The server ID"),
  reason: z.string().optional().describe("The reason for deleting the server"),
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
            "Supports filtering by name, slug, description, billing_type, environment, and tags. " +
            "Includes pagination (pageSize, pageNumber) and optional extraFieldsProjects for billing dates.",
          inputSchema: zodToJsonSchema(ListProjectsArgsSchema) as ToolInput,
        },
        {
          name: "lock_server",
          description:
            "Lock a server according to official API specification. " +
            "A locked server cannot be deleted or modified and no actions can be performed on it. " +
            "Returns the server information with locked status set to true.",
          inputSchema: zodToJsonSchema(LockServerArgsSchema) as ToolInput,
        },
        {
          name: "unlock_server",
          description:
            "Unlock a server according to official API specification. " +
            "Unlocks the server, allowing it to be deleted, modified, and actions to be performed on it. " +
            "Returns the server information with locked status set to false.",
          inputSchema: zodToJsonSchema(UnlockServerArgsSchema) as ToolInput,
        },
        {
          name: "get_project",
          description:
            "Get detailed information about a specific project by its ID. " +
            "Returns project data exactly as provided by the Latitude.sh API including attributes, billing, team, and stats.",
          inputSchema: zodToJsonSchema(GetProjectArgsSchema) as ToolInput,
        },
        {
          name: "create_project",
          description:
            "Create a new project in latitude.sh. " +
            "Creates a project with the specified name, provisioning type, and optional description and environment. " +
            "Returns detailed information about the newly created project.",
          inputSchema: zodToJsonSchema(CreateProjectArgsSchema) as ToolInput,
        },
        {
          name: "update_project",
          description:
            "Update an existing project in latitude.sh. " +
            "Updates project properties such as name, description, environment, bandwidth_alert, and tags. " +
            "Returns detailed information about the updated project.",
          inputSchema: zodToJsonSchema(UpdateProjectArgsSchema) as ToolInput,
        },
        {
          name: "delete_project",
          description:
            "Delete a project from latitude.sh. " +
            "Permanently removes a project and all its associated resources. " +
            "Returns confirmation message upon successful deletion.",
          inputSchema: zodToJsonSchema(DeleteProjectArgsSchema) as ToolInput,
        },
        {
          name: "list_servers",
          description:
            "List all servers belonging to the team with comprehensive filtering and pagination. " +
            "Supports filters: project, region, hostname, label, status, plan, GPU, created dates, RAM/disk size filters, and tags. " +
            "Includes optional lazy-loaded credentials via extraFieldsServers=credentials. " +
            "Returns detailed server information including specs, network, region, project, and operating system details.",
          inputSchema: zodToJsonSchema(ListServersArgsSchema) as ToolInput,
        },
        {
          name: "create_server",
          description:
            "Deploy a new server in latitude.sh according to official API specification. " +
            "Creates a server with project, plan, site (region), operatingSystem, and hostname. " +
            "Supports optional SSH keys (sshKeys), user data ID (userData), RAID configuration, iPXE scripts, and billing type. " +
            "Returns detailed server information including specs, interfaces, and deployment status.",
          inputSchema: zodToJsonSchema(CreateServerArgsSchema) as ToolInput,
        },
        {
          name: "get_server",
          description:
            "Retrieve a server that belongs to the team. " +
            "Returns comprehensive server details including specs, network information, status, and configuration. " +
            "Supports optional lazy-loaded credentials via extraFieldsServers=credentials for additional server access details.",
          inputSchema: zodToJsonSchema(GetServerArgsSchema) as ToolInput,
        },
        {
          name: "update_server",
          description:
            "Update server properties in latitude.sh according to official API specification. " +
            "Supports updating hostname, billing type, project assignment, and tags. " +
            "Billing accepts hourly/monthly for on-demand projects and yearly for reserved projects. " +
            "Returns the updated server information with all current details.",
          inputSchema: zodToJsonSchema(UpdateServerArgsSchema) as ToolInput,
        },
        {
          name: "delete_server",
          description:
            "Remove a server from latitude.sh according to official API specification. " +
            "Permanently deletes the server and all its data. " +
            "Supports optional reason parameter for deletion tracking. " +
            "Returns confirmation message upon successful deletion.",
          inputSchema: zodToJsonSchema(DeleteServerArgsSchema) as ToolInput,
        },
        {
          name: "list_plans",
          description:
            "List all server plans from latitude.sh with optional filtering. " +
            "Supports filtering by name, slug, location, stock level, GPU availability, RAM and disk size. " +
            "Returns detailed plan specifications, pricing, and regional availability.",
          inputSchema: zodToJsonSchema(ListPlansArgsSchema) as ToolInput,
        },

        {
          name: "get_server_deploy_config",
          description:
            "Retrieve a server's deploy configuration according to official API specification. " +
            "Returns configuration details including SSH keys, user data, RAID settings, operating system, hostname, iPXE settings, and partition configuration. " +
            "Response includes server ID, type, and all deploy attributes.",
          inputSchema: zodToJsonSchema(
            GetServerDeployConfigArgsSchema
          ) as ToolInput,
        },
        {
          name: "update_server_deploy_config",
          description:
            "Update a server's deploy configuration according to official API specification. " +
            "Supports updating hostname, operating system, RAID settings, user data, SSH keys, partitions, and iPXE configuration. " +
            "User data accepts integer IDs, SSH keys accepts array of integer IDs, and partitions accepts array of objects with path, size, and filesystem type. " +
            "Returns the updated deploy configuration with all current settings.",
          inputSchema: zodToJsonSchema(
            UpdateServerDeployConfigArgsSchema
          ) as ToolInput,
        },
        {
          name: "get_plan",
          description:
            "Get a specific plan by its ID. Returns slug, name, features, specs and regions with availability/pricing.",
          inputSchema: zodToJsonSchema(GetPlanArgsSchema) as ToolInput,
        },
        {
          name: "list_regions",
          description:
            "List all global regions with optional pagination. " +
            "Returns comprehensive region information including name, slug, facility, country, and type. " +
            "Supports pagination with pageSize and pageNumber parameters.",
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
            "List all operating systems available for deployment and reinstall with optional pagination. " +
            "Returns comprehensive OS details including distro, version, features, and compatible server plans. " +
            "Supports pagination with pageSize and pageNumber parameters.",
          inputSchema: zodToJsonSchema(
            ListOperatingSystemsArgsSchema
          ) as ToolInput,
        },

        {
          name: "start_out_of_band_connection",
          description:
            "Start an Out of Band (OOB) connection for a server according to official API specification. " +
            "Creates a secure connection with optional SSH key authentication. " +
            "Returns connection details including credentials, port, access IP, and status for remote server access.",
          inputSchema: zodToJsonSchema(
            StartOobConnectionArgsSchema
          ) as ToolInput,
        },
        {
          name: "list_out_of_band_connections",
          description:
            "List all active Out of Band (OOB) connections for a server.",
          inputSchema: zodToJsonSchema(
            ListOobConnectionsArgsSchema
          ) as ToolInput,
        },
        {
          name: "run_server_action",
          description:
            "Run a power action on a server (power_on, power_off, reboot).",
          inputSchema: zodToJsonSchema(RunServerActionArgsSchema) as ToolInput,
        },
        {
          name: "generate_ipmi_credentials",
          description:
            "Generate IPMI credentials for remote server access. Creates VPN connection to server's internal network for IPMI access.",
          inputSchema: zodToJsonSchema(
            GenerateIPMICredentialsArgsSchema
          ) as ToolInput,
        },
        {
          name: "enter_rescue_mode",
          description:
            "Put a server in rescue mode for system recovery and troubleshooting.",
          inputSchema: zodToJsonSchema(EnterRescueModeArgsSchema) as ToolInput,
        },
        {
          name: "exit_rescue_mode",
          description:
            "Exit rescue mode and return server to normal operation.",
          inputSchema: zodToJsonSchema(ExitRescueModeArgsSchema) as ToolInput,
        },
        {
          name: "schedule_server_deletion",
          description:
            "Schedule server deletion at the end of the billing cycle. Server will be automatically removed when the current billing period ends.",
          inputSchema: zodToJsonSchema(
            ScheduleServerDeletionArgsSchema
          ) as ToolInput,
        },
        {
          name: "unschedule_server_deletion",
          description:
            "Cancel a previously scheduled server deletion. The server will remain active beyond the current billing cycle.",
          inputSchema: zodToJsonSchema(
            UnscheduleServerDeletionArgsSchema
          ) as ToolInput,
        },
        {
          name: "server_reinstall",
          description:
            "Reinstall a server with new configuration including OS, hostname, partitions, SSH keys, user data, RAID, and iPXE settings.",
          inputSchema: zodToJsonSchema(ServerReinstallArgsSchema) as ToolInput,
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

          const { projectId } = parsed.data;

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

          const result = await latitudeClient.getServers(parsed.data);

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
            project: parsed.data.project,
            plan: parsed.data.plan,
            site: parsed.data.site,
            operatingSystem: parsed.data.operatingSystem,
            hostname: parsed.data.hostname,
            ...(parsed.data.sshKeys && { sshKeys: parsed.data.sshKeys }),
            ...(parsed.data.userData && { userData: parsed.data.userData }),
            ...(parsed.data.raid && { raid: parsed.data.raid }),
            ...(parsed.data.ipxe && { ipxe: parsed.data.ipxe }),
            ...(parsed.data.billing && { billing: parsed.data.billing }),
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

          const server = await latitudeClient.getServer(
            parsed.data.serverId,
            parsed.data.extraFieldsServers
          );

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

          const result = await latitudeClient.deleteServer(
            parsed.data.serverId,
            parsed.data.reason
          );

          const apiLike = { data: result, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "list_plans": {
          const parsed = ListPlansArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_plans: ${parsed.error}`
            );
          }

          const plans = await latitudeClient.listPlans(parsed.data);
          const apiLike = { data: plans, meta: { count: plans.length } };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "get_plan": {
          const parsed = GetPlanArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments for get_plan: ${parsed.error}`);
          }

          const plan = await latitudeClient.getPlan(parsed.data.planId);
          const apiLike = { data: plan, meta: {} };

          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "list_regions": {
          const parsed = ListRegionsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_regions: ${parsed.error}`
            );
          }

          const result = await latitudeClient.listRegions(parsed.data);
          const apiLike = {
            data: result.regions,
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

          const deployConfig = await latitudeClient.getServerDeployConfig(
            parsed.data.serverId
          );

          return {
            content: [
              { type: "text", text: JSON.stringify(deployConfig, null, 2) },
            ],
          };
        }

        case "update_server_deploy_config": {
          const parsed = UpdateServerDeployConfigArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for update_server_deploy_config: ${parsed.error}`
            );
          }

          const { serverId, ...attrs } = parsed.data;
          const updated = await latitudeClient.updateServerDeployConfig(
            serverId,
            attrs
          );

          return {
            content: [{ type: "text", text: JSON.stringify(updated, null, 2) }],
          };
        }

        case "lock_server": {
          const parsed = LockServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for lock_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.lockServer(parsed.data.serverId);

          return {
            content: [{ type: "text", text: JSON.stringify(server, null, 2) }],
          };
        }

        case "unlock_server": {
          const parsed = UnlockServerArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for unlock_server: ${parsed.error}`
            );
          }

          const server = await latitudeClient.unlockServer(
            parsed.data.serverId
          );

          return {
            content: [{ type: "text", text: JSON.stringify(server, null, 2) }],
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

          const result = await latitudeClient.listOperatingSystems(parsed.data);
          const apiLike = {
            data: result.operatingSystems,
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

        case "start_out_of_band_connection": {
          const parsed = StartOobConnectionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for start_out_of_band_connection: ${parsed.error}`
            );
          }

          const connection = await latitudeClient.startOutOfBandConnection(
            parsed.data.serverId,
            parsed.data.sshKeyId
          );

          return {
            content: [
              { type: "text", text: JSON.stringify(connection, null, 2) },
            ],
          };
        }

        case "list_out_of_band_connections": {
          const parsed = ListOobConnectionsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for list_out_of_band_connections: ${parsed.error}`
            );
          }

          const connections = await latitudeClient.listOutOfBandConnections(
            parsed.data.serverId
          );
          const apiLike = {
            data: connections,
            meta: { total: connections.length },
          };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "run_server_action": {
          const parsed = RunServerActionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for run_server_action: ${parsed.error}`
            );
          }

          const actionResult = await latitudeClient.runServerAction(
            parsed.data.serverId,
            parsed.data.action
          );
          const apiLike = { data: actionResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "generate_ipmi_credentials": {
          const parsed = GenerateIPMICredentialsArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for generate_ipmi_credentials: ${parsed.error}`
            );
          }

          const ipmiCredentials = await latitudeClient.generateIPMICredentials(
            parsed.data.serverId
          );
          const apiLike = { data: ipmiCredentials, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "enter_rescue_mode": {
          const parsed = EnterRescueModeArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for enter_rescue_mode: ${parsed.error}`
            );
          }

          const rescueResult = await latitudeClient.enterRescueMode(
            parsed.data.serverId
          );
          const apiLike = { data: rescueResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "exit_rescue_mode": {
          const parsed = ExitRescueModeArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for exit_rescue_mode: ${parsed.error}`
            );
          }

          const exitResult = await latitudeClient.exitRescueMode(
            parsed.data.serverId
          );
          const apiLike = { data: exitResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "schedule_server_deletion": {
          const parsed = ScheduleServerDeletionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for schedule_server_deletion: ${parsed.error}`
            );
          }

          const scheduleResult = await latitudeClient.scheduleServerDeletion(
            parsed.data.serverId
          );
          const apiLike = { data: scheduleResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "unschedule_server_deletion": {
          const parsed = UnscheduleServerDeletionArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for unschedule_server_deletion: ${parsed.error}`
            );
          }

          const unscheduleResult =
            await latitudeClient.unscheduleServerDeletion(parsed.data.serverId);
          const apiLike = { data: unscheduleResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
          };
        }

        case "server_reinstall": {
          const parsed = ServerReinstallArgsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(
              `Invalid arguments for server_reinstall: ${parsed.error}`
            );
          }

          const { serverId, ...reinstallParams } = parsed.data;
          const reinstallResult = await latitudeClient.reinstallServer(
            serverId,
            reinstallParams
          );
          const apiLike = { data: reinstallResult, meta: {} };
          return {
            content: [{ type: "text", text: JSON.stringify(apiLike, null, 2) }],
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
