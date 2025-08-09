import axios, { AxiosInstance, AxiosResponse } from "axios";
import type {
  LatitudeProjectList,
  LatitudeProjectDetails,
  LatitudeAPIConfig,
  ProjectSearchParams,
  LatitudeServerList,
  LatitudeServerDetails,
  ServerSearchParams,
  CreateServerParams,
  UpdateServerParams,
  LatitudeAPIProjectsResponse,
  LatitudeAPIProjectResponse,
  LatitudeAPIParams,
  LatitudeAPIProjectData,
  LatitudeAPIServersResponse,
  LatitudeAPIServerData,
  LatitudeAPIServerResponse,
  LatitudeAPIPlansResponse,
  LatitudeAPIPlanResponse,
  LatitudeAPIPlanData,
  LatitudeAPIPlanRegion,
} from "../types/latitude.js";

export class LatitudeAPIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: LatitudeAPIConfig) {
    this.apiKey = config.apiKey;
    const rawApiKey = (this.apiKey || "").trim();
    const authHeader = rawApiKey.toLowerCase().startsWith("bearer ")
      ? rawApiKey
      : `Bearer ${rawApiKey}`;
    this.client = axios.create({
      baseURL: config.baseURL || "https://api.latitude.sh",
      timeout: config.timeout || 10000,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        "User-Agent": "mcp-server-latitude-sh/0.4.0",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiErrors = error?.response?.data?.errors;

        const throwWith = (msg: string): never => {
          const err: any = new Error(msg);
          if (apiErrors) err.apiErrors = apiErrors;
          throw err;
        };

        if (error.response?.status === 401) {
          throwWith("Unauthorized: Invalid API key");
        } else if (error.response?.status === 403) {
          throwWith("Forbidden: Insufficient permissions");
        } else if (error.response?.status === 404) {
          const resourceHint = error.config?.url || "resource";
          // Try to surface API error details when available
          const details = Array.isArray(error.response?.data?.errors)
            ? error.response.data.errors
                .map((e: any) => e?.detail || e?.title)
                .filter(Boolean)
                .join("; ")
            : error.response?.data?.message;
          throwWith(
            `Not Found: ${
              details || `The requested ${resourceHint} was not found`
            }`
          );
        } else if (
          error.response?.status === 400 ||
          error.response?.status === 422
        ) {
          const errorData = error.response?.data;
          if (errorData && errorData.errors && errorData.errors.length > 0) {
            const errorDetails = errorData.errors
              .map(
                (err: any) =>
                  `${err.title || "Validation Error"}: ${
                    err.detail || err.message || "Unknown error"
                  }`
              )
              .join("; ");
            throwWith(
              `Bad Request (${error.response?.status}): ${errorDetails}`
            );
          } else {
            throwWith(
              `Bad Request (${error.response?.status}): ${
                error.response?.data?.message ||
                error.message ||
                "Invalid request"
              }`
            );
          }
        } else if (error.response?.status === 429) {
          throwWith("Rate limit exceeded - please try again later");
        } else if (error.response?.status >= 500) {
          throwWith("Latitude.sh API server error");
        } else if (error.code === "ECONNABORTED") {
          throwWith("Request timeout - server took too long to respond");
        } else if (error.code === "ENOTFOUND") {
          throwWith("Network error - could not reach latitude.sh API");
        } else if (error.code === "ECONNREFUSED") {
          throwWith("Connection refused - check your network connection");
        } else {
          throwWith(
            `API Error: ${error.response?.data?.message || error.message}`
          );
        }
      }
    );
  }

  /**
   * Get all projects for the authenticated user
   */
  async getProjects(
    params?: ProjectSearchParams & Record<string, unknown>
  ): Promise<LatitudeProjectList> {
    try {
      // Transform parameters to match Latitude.sh API format
      const apiParams: Record<string, unknown> = {};

      if (params?.limit) {
        apiParams["page[size]"] = params.limit;
      }

      if (params?.page) {
        apiParams["page[number]"] = params.page;
      }

      // Legacy/compat mapping (optional)
      if ((params as any)?.status) apiParams.status = (params as any).status;
      if ((params as any)?.owner) apiParams.owner = (params as any).owner;
      if (
        Array.isArray((params as any)?.tags) &&
        (params as any).tags.length > 0
      ) {
        apiParams["filter[tags]"] = (params as any).tags.join(",");
      }
      if ((params as any)?.query) apiParams.query = (params as any).query;

      // Pass-through any JSON:API filter/extra_fields keys provided by the tool
      for (const [key, value] of Object.entries(params || {})) {
        if (/^filter\[.*\]$/.test(key) || /^extra_fields\[.*\]$/.test(key)) {
          apiParams[key] = value as unknown;
        }
      }

      const response: AxiosResponse<LatitudeAPIProjectsResponse> =
        await this.client.get("/projects", { params: apiParams });

      // Latitude.sh API returns data directly, not wrapped in success/error
      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      // Transform the response to match our expected format
      const projects = response.data.data.map(
        (project: LatitudeAPIProjectData) => ({
          id: project.id,
          name: project.attributes.name,
          description: project.attributes.description,
          createdAt: project.attributes.created_at,
          updatedAt: project.attributes.updated_at,
          status: "active" as const,
          owner: {
            id: project.attributes.team?.id || "unknown",
            name: project.attributes.team?.name || "Unknown",
            email: "unknown@latitude.sh",
          },
          collaborators: [],
          settings: {
            visibility: "private" as const,
            allowComments: false,
          },
          metadata: {
            tags: project.attributes.tags || [],
            category: "default",
            framework: project.attributes.environment || undefined,
            // carry-through provisioning_type so callers can filter without attributes
            provisioning_type: project.attributes.provisioning_type,
          } as any,
        })
      );

      return {
        projects,
        total: response.data?.meta?.total ?? projects.length,
        page: response.data?.meta?.page ?? params?.page ?? 1,
        limit: response.data?.meta?.limit ?? params?.limit ?? 50,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch projects: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<LatitudeProjectDetails> {
    try {
      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.get(`/projects/${projectId}`);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const project = response.data.data;

      // Transform the response to match our expected format
      const projectDetails: LatitudeProjectDetails = {
        id: project.id,
        name: project.attributes.name,
        description: project.attributes.description,
        createdAt: project.attributes.created_at,
        updatedAt: project.attributes.updated_at,
        status: "active" as const, // Default status since API doesn't provide it
        owner: {
          id: project.attributes.team?.id || "unknown",
          name: project.attributes.team?.name || "Unknown",
          email: "unknown@latitude.sh",
        },
        collaborators: [],
        settings: {
          visibility: "private" as const,
          allowComments: false,
        },
        files: [], // Default empty files array
        metadata: {
          tags: project.attributes.tags || [],
          category: "default",
          framework: project.attributes.environment || undefined,
          language: undefined,
        },
      };

      return projectDetails;
    } catch (error) {
      throw new Error(
        `Failed to fetch project ${projectId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Search projects by query
   */
  async searchProjects(
    query: string,
    params?: Omit<ProjectSearchParams, "query">
  ): Promise<LatitudeProjectList> {
    return this.getProjects({ ...params, query });
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(
    status: "active" | "inactive" | "archived",
    params?: Omit<ProjectSearchParams, "status">
  ): Promise<LatitudeProjectList> {
    return this.getProjects({ ...params, status });
  }

  /**
   * Get projects by owner
   */
  async getProjectsByOwner(
    ownerId: string,
    params?: Omit<ProjectSearchParams, "owner">
  ): Promise<LatitudeProjectList> {
    return this.getProjects({ ...params, owner: ownerId });
  }

  /**
   * Get projects by tags
   */
  async getProjectsByTags(
    tags: string[],
    params?: Omit<ProjectSearchParams, "tags">
  ): Promise<LatitudeProjectList> {
    return this.getProjects({ ...params, tags });
  }

  /**
   * Create a new project
   */
  async createProject(projectData: {
    name: string;
    description?: string;
    environment?: string;
    provisioning_type?: string;
    billing_type?: string;
    billing_method?: string;
    tags?: string[];
  }): Promise<LatitudeProjectDetails> {
    try {
      const requestData = {
        data: {
          type: "projects",
          attributes: {
            name: projectData.name,
            provisioning_type: projectData.provisioning_type || "on_demand",
            ...(projectData.description && {
              description: projectData.description,
            }),
            ...(projectData.environment && {
              environment: projectData.environment,
            }),
            ...(projectData.billing_type && {
              billing_type: projectData.billing_type,
            }),
            ...(projectData.billing_method && {
              billing_method: projectData.billing_method,
            }),
            ...(projectData.tags &&
              projectData.tags.length > 0 && { tags: projectData.tags }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.post("/projects", requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const project = response.data.data;

      // Transform the response to match our expected format
      const projectDetails: LatitudeProjectDetails = {
        id: project.id,
        name: project.attributes.name,
        description: project.attributes.description,
        createdAt: project.attributes.created_at,
        updatedAt: project.attributes.updated_at,
        status: "active" as const,
        owner: {
          id: project.attributes.team?.id || "unknown",
          name: project.attributes.team?.name || "Unknown",
          email: "unknown@latitude.sh",
        },
        collaborators: [],
        settings: {
          visibility: "private" as const,
          allowComments: false,
        },
        files: [],
        metadata: {
          tags: project.attributes.tags || [],
          category: "default",
          framework: project.attributes.environment || undefined,
          language: undefined,
        },
      };

      return projectDetails;
    } catch (error) {
      throw new Error(
        `Failed to create project: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(
    projectId: string,
    projectData: {
      name?: string;
      description?: string;
      environment?: string;
      provisioning_type?: string;
      billing_type?: string;
      billing_method?: string;
      tags?: string[];
    }
  ): Promise<LatitudeProjectDetails> {
    try {
      const requestData = {
        data: {
          type: "projects",
          id: projectId,
          attributes: {
            ...(projectData.name && { name: projectData.name }),
            ...(projectData.description && {
              description: projectData.description,
            }),
            ...(projectData.environment && {
              environment: projectData.environment,
            }),
            ...(projectData.provisioning_type && {
              provisioning_type: projectData.provisioning_type,
            }),
            ...(projectData.billing_type && {
              billing_type: projectData.billing_type,
            }),
            ...(projectData.billing_method && {
              billing_method: projectData.billing_method,
            }),
            ...(projectData.tags &&
              projectData.tags.length > 0 && { tags: projectData.tags }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.patch(`/projects/${projectId}`, requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const project = response.data.data;

      // Transform the response to match our expected format
      const projectDetails: LatitudeProjectDetails = {
        id: project.id,
        name: project.attributes.name,
        description: project.attributes.description,
        createdAt: project.attributes.created_at,
        updatedAt: project.attributes.updated_at,
        status: "active" as const,
        owner: {
          id: project.attributes.team?.id || "unknown",
          name: project.attributes.team?.name || "Unknown",
          email: "unknown@latitude.sh",
        },
        collaborators: [],
        settings: {
          visibility: "private" as const,
          allowComments: false,
        },
        files: [],
        metadata: {
          tags: project.attributes.tags || [],
          category: "default",
          framework: project.attributes.environment || undefined,
          language: undefined,
        },
      };

      return projectDetails;
    } catch (error) {
      throw new Error(
        `Failed to update project ${projectId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await this.client.delete(`/projects/${projectId}`);

      // Verify we got a successful response
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to delete project: HTTP ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete project ${projectId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get project files (if available)
   */
  async getProjectFiles(
    projectId: string
  ): Promise<LatitudeProjectDetails["files"]> {
    try {
      const project = await this.getProject(projectId);
      return project.files || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch project files: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<void> {
    try {
      const response = await this.client.get("/user/profile", {
        timeout: 5000, // Shorter timeout for connection test
      });

      // Verify we got a valid response
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Invalid response status: ${response.status}`);
      }
    } catch (error) {
      // Re-throw the error with proper context
      if (error instanceof Error) {
        throw new Error(`Connection test failed: ${error.message}`);
      } else {
        throw new Error(`Connection test failed: ${String(error)}`);
      }
    }
  }

  /**
   * Get all servers for a project
   */
  async getServers(
    params?: ServerSearchParams & Record<string, unknown>
  ): Promise<LatitudeServerList> {
    try {
      const apiParams: Record<string, unknown> = {};

      if (params?.limit) {
        apiParams["page[size]"] = params.limit;
      }

      if (params?.page) {
        apiParams["page[number]"] = params.page;
      }

      if ((params as any)?.status)
        apiParams["filter[status]"] = (params as any).status;
      if ((params as any)?.projectId)
        apiParams["filter[project]"] = (params as any).projectId;
      if ((params as any)?.region)
        apiParams["filter[region]"] = (params as any).region;
      if ((params as any)?.plan)
        apiParams["filter[plan]"] = (params as any).plan;
      if (
        Array.isArray((params as any)?.tags) &&
        (params as any).tags.length > 0
      ) {
        apiParams["filter[tags]"] = (params as any).tags.join(",");
      }

      // Pass-through any provided JSON:API filter/extra_fields keys
      for (const [key, value] of Object.entries(params || {})) {
        if (/^filter\[.*\]$/.test(key) || /^extra_fields\[.*\]$/.test(key)) {
          apiParams[key] = value as unknown;
        }
      }

      const response: AxiosResponse<LatitudeAPIServersResponse> =
        await this.client.get("/servers", { params: apiParams });

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      // Transform the response to match our expected format
      const servers = response.data.data.map(
        (server: LatitudeAPIServerData) => ({
          id: server.id,
          name: server.attributes.name,
          description: server.attributes.description,
          createdAt: server.attributes.created_at,
          updatedAt: server.attributes.updated_at,
          status: server.attributes.status,
          projectId: server.attributes.project_id,
          region: {
            id: server.attributes.region?.id || "unknown",
            name: server.attributes.region?.name || "Unknown",
            slug: server.attributes.region?.slug || "unknown",
          },
          plan: {
            id: server.attributes.plan?.id || "unknown",
            name: server.attributes.plan?.name || "Unknown",
            slug: server.attributes.plan?.slug || "unknown",
            price: server.attributes.plan?.price || 0,
            currency: server.attributes.plan?.currency || "USD",
          },
          ipAddress: server.attributes.ip_address,
          privateIpAddress: server.attributes.private_ip_address,
          sshKeys:
            server.attributes.ssh_keys?.map((key) => ({
              id: key.id,
              name: key.name,
              publicKey: key.public_key,
            })) || [],
          tags: server.attributes.tags || [],
          metadata: {
            os: server.attributes.os?.name || "Unknown",
            cpu: server.attributes.specs?.cpu || 0,
            memory: server.attributes.specs?.memory || 0,
            disk: server.attributes.specs?.disk || 0,
            bandwidth: server.attributes.specs?.bandwidth || 0,
          },
        })
      );

      return {
        servers,
        total: response.data?.meta?.total ?? servers.length,
        page: response.data?.meta?.page ?? params?.page ?? 1,
        limit: response.data?.meta?.limit ?? params?.limit ?? 50,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch servers: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get a specific server by ID
   */
  async getServer(serverId: string): Promise<LatitudeServerDetails> {
    try {
      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.get(`/servers/${serverId}`);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const server = response.data.data;

      // Transform the response to match our expected format
      const serverDetails: LatitudeServerDetails = {
        id: server.id,
        name: server.attributes.name,
        description: server.attributes.description,
        createdAt: server.attributes.created_at,
        updatedAt: server.attributes.updated_at,
        status: server.attributes.status,
        projectId: server.attributes.project_id,
        region: {
          id: server.attributes.region?.id || "unknown",
          name: server.attributes.region?.name || "Unknown",
          slug: server.attributes.region?.slug || "unknown",
        },
        plan: {
          id: server.attributes.plan?.id || "unknown",
          name: server.attributes.plan?.name || "Unknown",
          slug: server.attributes.plan?.slug || "unknown",
          price: server.attributes.plan?.price || 0,
          currency: server.attributes.plan?.currency || "USD",
        },
        ipAddress: server.attributes.ip_address,
        privateIpAddress: server.attributes.private_ip_address,
        sshKeys:
          server.attributes.ssh_keys?.map((key) => ({
            id: key.id,
            name: key.name,
            publicKey: key.public_key,
          })) || [],
        tags: server.attributes.tags || [],
        metadata: {
          os: server.attributes.os?.name || "Unknown",
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        specs: {
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        network: {
          publicIp: server.attributes.ip_address || "",
          privateIp: server.attributes.private_ip_address,
          gateway: server.attributes.network?.gateway,
          netmask: server.attributes.network?.netmask,
        },
        os: {
          name: server.attributes.os?.name || "Unknown",
          version: server.attributes.os?.version || "Unknown",
          architecture: server.attributes.os?.architecture || "Unknown",
        },
        actions:
          server.attributes.actions?.map((action) => ({
            id: action.id,
            name: action.name,
            status: action.status,
            createdAt: action.created_at,
          })) || [],
      };

      return serverDetails;
    } catch (error) {
      throw new Error(
        `Failed to fetch server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Create a new server
   */
  async createServer(
    serverData: CreateServerParams
  ): Promise<LatitudeServerDetails> {
    try {
      const requestData = {
        data: {
          type: "servers",
          attributes: {
            name: serverData.name,
            project_id: serverData.projectId,
            // Latitude JSON:API commonly uses `site` for region code in creation
            site: serverData.regionId,
            plan_id: serverData.planId,
            ...(serverData.operating_system && {
              operating_system: serverData.operating_system,
            }),
            ...(serverData.description && {
              description: serverData.description,
            }),
            ...(serverData.sshKeys &&
              serverData.sshKeys.length > 0 && {
                ssh_keys: serverData.sshKeys,
              }),
            ...(serverData.tags &&
              serverData.tags.length > 0 && { tags: serverData.tags }),
            ...(serverData.userData && { user_data: serverData.userData }),
            ...(serverData.startupScript && {
              startup_script: serverData.startupScript,
            }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.post("/servers", requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const server = response.data.data;

      // Transform the response to match our expected format
      const serverDetails: LatitudeServerDetails = {
        id: server.id,
        name: server.attributes.name,
        description: server.attributes.description,
        createdAt: server.attributes.created_at,
        updatedAt: server.attributes.updated_at,
        status: server.attributes.status,
        projectId: server.attributes.project_id,
        region: {
          id: server.attributes.region?.id || "unknown",
          name: server.attributes.region?.name || "Unknown",
          slug: server.attributes.region?.slug || "unknown",
        },
        plan: {
          id: server.attributes.plan?.id || "unknown",
          name: server.attributes.plan?.name || "Unknown",
          slug: server.attributes.plan?.slug || "unknown",
          price: server.attributes.plan?.price || 0,
          currency: server.attributes.plan?.currency || "USD",
        },
        ipAddress: server.attributes.ip_address,
        privateIpAddress: server.attributes.private_ip_address,
        sshKeys:
          server.attributes.ssh_keys?.map((key) => ({
            id: key.id,
            name: key.name,
            publicKey: key.public_key,
          })) || [],
        tags: server.attributes.tags || [],
        metadata: {
          os: server.attributes.os?.name || "Unknown",
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        specs: {
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        network: {
          publicIp: server.attributes.ip_address || "",
          privateIp: server.attributes.private_ip_address,
          gateway: server.attributes.network?.gateway,
          netmask: server.attributes.network?.netmask,
        },
        os: {
          name: server.attributes.os?.name || "Unknown",
          version: server.attributes.os?.version || "Unknown",
          architecture: server.attributes.os?.architecture || "Unknown",
        },
        actions:
          server.attributes.actions?.map((action) => ({
            id: action.id,
            name: action.name,
            status: action.status,
            createdAt: action.created_at,
          })) || [],
      };

      return serverDetails;
    } catch (error) {
      throw new Error(
        `Failed to create server: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Update an existing server
   */
  async updateServer(
    serverId: string,
    serverData: UpdateServerParams
  ): Promise<LatitudeServerDetails> {
    try {
      const requestData = {
        data: {
          type: "servers",
          id: serverId,
          attributes: {
            ...(serverData.name && { name: serverData.name }),
            ...(serverData.description && {
              description: serverData.description,
            }),
            ...(serverData.tags &&
              serverData.tags.length > 0 && { tags: serverData.tags }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.patch(`/servers/${serverId}`, requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const server = response.data.data;

      // Transform the response to match our expected format
      const serverDetails: LatitudeServerDetails = {
        id: server.id,
        name: server.attributes.name,
        description: server.attributes.description,
        createdAt: server.attributes.created_at,
        updatedAt: server.attributes.updated_at,
        status: server.attributes.status,
        projectId: server.attributes.project_id,
        region: {
          id: server.attributes.region?.id || "unknown",
          name: server.attributes.region?.name || "Unknown",
          slug: server.attributes.region?.slug || "unknown",
        },
        plan: {
          id: server.attributes.plan?.id || "unknown",
          name: server.attributes.plan?.name || "Unknown",
          slug: server.attributes.plan?.slug || "unknown",
          price: server.attributes.plan?.price || 0,
          currency: server.attributes.plan?.currency || "USD",
        },
        ipAddress: server.attributes.ip_address,
        privateIpAddress: server.attributes.private_ip_address,
        sshKeys:
          server.attributes.ssh_keys?.map((key) => ({
            id: key.id,
            name: key.name,
            publicKey: key.public_key,
          })) || [],
        tags: server.attributes.tags || [],
        metadata: {
          os: server.attributes.os?.name || "Unknown",
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        specs: {
          cpu: server.attributes.specs?.cpu || 0,
          memory: server.attributes.specs?.memory || 0,
          disk: server.attributes.specs?.disk || 0,
          bandwidth: server.attributes.specs?.bandwidth || 0,
        },
        network: {
          publicIp: server.attributes.ip_address || "",
          privateIp: server.attributes.private_ip_address,
          gateway: server.attributes.network?.gateway,
          netmask: server.attributes.network?.netmask,
        },
        os: {
          name: server.attributes.os?.name || "Unknown",
          version: server.attributes.os?.version || "Unknown",
          architecture: server.attributes.os?.architecture || "Unknown",
        },
        actions:
          server.attributes.actions?.map((action) => ({
            id: action.id,
            name: action.name,
            status: action.status,
            createdAt: action.created_at,
          })) || [],
      };

      return serverDetails;
    } catch (error) {
      throw new Error(
        `Failed to update server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Delete a server
   */
  async deleteServer(serverId: string): Promise<void> {
    try {
      const response = await this.client.delete(`/servers/${serverId}`);

      // Verify we got a successful response
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to delete server: HTTP ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get a single plan by ID
   */
  async getPlan(planId: string): Promise<LatitudeAPIPlanData> {
    try {
      const response = await this.client.get<LatitudeAPIPlanResponse>(
        `/plans/${planId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch plan ${planId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * List all plans
   */
  async listPlans(): Promise<LatitudeAPIPlanData[]> {
    try {
      const response = await this.client.get<LatitudeAPIPlansResponse>(
        `/plans`
      );
      if (!response.data?.data) {
        throw new Error("Invalid API response: missing data");
      }
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch plans: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get available regions for a specific plan
   */
  async getAvailableRegions(
    planId: string,
    _projectId?: string
  ): Promise<LatitudeAPIPlanRegion[]> {
    try {
      // Use getPlan internally since it works and returns regions
      const plan = await this.getPlan(planId);
      return plan.attributes?.regions || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch available regions for plan ${planId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * List all regions (global regions endpoint)
   */
  async listRegions(): Promise<any[]> {
    try {
      const response = await this.client.get<any>(`/regions`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch regions: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get a specific region by ID
   */
  async getRegion(regionId: string): Promise<any> {
    try {
      const response = await this.client.get<any>(`/regions/${regionId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch region ${regionId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieve a server deploy config
   */
  async getServerDeployConfig(serverId: string): Promise<any> {
    try {
      const response = await this.client.get<any>(
        `/servers/${serverId}/deploy_config`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch deploy config for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Update a server deploy config
   */
  async updateServerDeployConfig(
    serverId: string,
    attrs: {
      hostname?: string;
      operating_system?: string;
      raid?: string;
      user_data?: string | null;
      ssh_keys?: string[];
      partitions?: Array<{
        path: string;
        size_in_gb: number;
        filesystem_type: string;
      }>;
      ipxe_url?: string | null;
    }
  ): Promise<LatitudeAPIServerData> {
    try {
      const payload = {
        data: {
          type: "deploy_config",
          id: serverId,
          attributes: {
            ...(attrs.hostname !== undefined && { hostname: attrs.hostname }),
            ...(attrs.operating_system !== undefined && {
              operating_system: attrs.operating_system,
            }),
            ...(attrs.raid !== undefined && { raid: attrs.raid }),
            ...(attrs.user_data !== undefined && {
              user_data: attrs.user_data,
            }),
            ...(attrs.ssh_keys !== undefined && { ssh_keys: attrs.ssh_keys }),
            ...(attrs.partitions !== undefined && {
              partitions: attrs.partitions,
            }),
            ...(attrs.ipxe_url !== undefined && { ipxe_url: attrs.ipxe_url }),
          },
        },
      };

      const response = await this.client.patch<LatitudeAPIServerResponse>(
        `/servers/${serverId}/deploy_config`,
        payload
      );
      return response.data.data as LatitudeAPIServerData;
    } catch (error) {
      throw new Error(
        `Failed to update deploy config for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Lock a server (POST /servers/{serverId}/lock)
   */
  async lockServer(serverId: string): Promise<LatitudeAPIServerData> {
    try {
      const response = await this.client.post<LatitudeAPIServerResponse>(
        `/servers/${serverId}/lock`,
        {}
      );
      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to lock server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Unlock a server (POST /servers/{serverId}/unlock)
   */
  async unlockServer(serverId: string): Promise<LatitudeAPIServerData> {
    try {
      const response = await this.client.post<LatitudeAPIServerResponse>(
        `/servers/${serverId}/unlock`,
        {}
      );
      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to unlock server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
