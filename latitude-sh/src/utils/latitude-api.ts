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
  LatitudeAPIServersResponse,
  LatitudeAPIServerResponse,
  LatitudePlanRegion,
  LatitudeAPIPlanData,
  LatitudeAPIPlanResponse,
  LatitudeAPIPlansResponse,
  LatitudeServerDeployConfigResponse,
  LatitudeServerDeployConfig,
  LatitudeOperatingSystem,
  LatitudeOperatingSystemsResponse,
} from "../types/latitude.js";

export class LatitudeAPIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: LatitudeAPIConfig) {
    this.apiKey = config.apiKey;
    const authHeader = this.apiKey.startsWith("Bearer ")
      ? this.apiKey
      : `Bearer ${this.apiKey}`;
    this.client = axios.create({
      baseURL: config.baseURL || "https://api.latitude.sh",
      timeout: config.timeout || 10000,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
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
          throw new Error("Project not found");
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
            throw new Error(
              `Bad Request (${error.response?.status}): ${errorDetails}`
            );
          } else {
            throw new Error(
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

      // Handle new pagination parameters
      if (params?.["page[size]"]) {
        apiParams["page[size]"] = params["page[size]"];
      } else if (params?.limit) {
        // Legacy support
        apiParams["page[size]"] = params.limit;
      }

      if (params?.["page[number]"]) {
        apiParams["page[number]"] = params["page[number]"];
      } else if (params?.page) {
        // Legacy support
        apiParams["page[number]"] = params.page;
      }

      // No undocumented basic filters

      // Handle advanced filters
      if (params?.["filter[name]"])
        apiParams["filter[name]"] = params["filter[name]"];
      if (params?.["filter[slug]"])
        apiParams["filter[slug]"] = params["filter[slug]"];
      if (params?.["filter[description]"])
        apiParams["filter[description]"] = params["filter[description]"];
      if (params?.["filter[billing_type]"])
        apiParams["filter[billing_type]"] = params["filter[billing_type]"];
      if (params?.["filter[environment]"])
        apiParams["filter[environment]"] = params["filter[environment]"];
      if (params?.["filter[tags]"])
        apiParams["filter[tags]"] = params["filter[tags]"];

      // Handle extra fields
      if (params?.["extra_fields[projects]"])
        apiParams["extra_fields[projects]"] = params["extra_fields[projects]"];

      // Legacy support for tags array
      if (params?.tags && params.tags.length > 0) {
        apiParams["filter[tags]"] = params.tags.join(",");
      }

      // No query passthrough (use filter[name] via searchProjects)

      const response: AxiosResponse<LatitudeAPIProjectsResponse> =
        await this.client.get("/projects", { params: apiParams });

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      // Use the projects directly from the API response
      const projects = response.data.data;
      const pagination = (response.data.meta as any)?.pagination;

      return {
        projects,
        total:
          pagination?.total_count ??
          (response.data.meta as any)?.total ??
          projects.length,
        page:
          pagination?.current_page ??
          params?.["page[number]"] ??
          params?.page ??
          1,
        limit:
          pagination?.per_page ?? params?.["page[size]"] ?? params?.limit ?? 20,
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

      // Return the project directly with additional metadata
      const projectDetails: LatitudeProjectDetails = {
        ...project,
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
    // Map 'query' to filter[name]
    const mapped: ProjectSearchParams = { ...params, ["filter[name]"]: query };
    return this.getProjects(mapped as any);
  }

  // (Removed) getProjectsByStatus: Not supported by Latitude.sh API

  /**
   * Get projects by owner
   */
  async getProjectsByOwner(
    _ownerId: string,
    params?: Omit<ProjectSearchParams, never>
  ): Promise<LatitudeProjectList> {
    // Not supported by API; fallback to plain list
    return this.getProjects({ ...params });
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
            ...(projectData.description && {
              description: projectData.description,
            }),
            ...(projectData.environment && {
              environment: projectData.environment,
            }),
            provisioning_type: projectData.provisioning_type ?? "on_demand",
            ...(projectData.billing_type && {
              billing_type: projectData.billing_type,
            }),
            ...(projectData.billing_method && {
              billing_method: projectData.billing_method,
            }),
            ...(projectData.tags &&
              projectData.tags.length > 0 && {
                tags: projectData.tags,
              }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.post("/projects", requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const project = response.data.data;

      // Return the project directly with additional metadata
      const projectDetails: LatitudeProjectDetails = {
        ...project,
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
      bandwidth_alert?: any;
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
            ...(projectData.bandwidth_alert && {
              bandwidth_alert: projectData.bandwidth_alert,
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

      // Return the project directly with additional metadata
      const projectDetails: LatitudeProjectDetails = {
        ...project,
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
   * Get all servers for the authenticated user
   */
  async getServers(
    params?: ServerSearchParams & Record<string, unknown>
  ): Promise<LatitudeServerList> {
    try {
      // Transform parameters to match Latitude.sh API format
      const apiParams: LatitudeAPIParams = {};

      // Handle new pagination parameters
      if (params?.["page[size]"]) {
        apiParams["page[size]"] = params["page[size]"];
      } else if (params?.limit) {
        // Legacy support
        apiParams["page[size]"] = params.limit;
      }

      if (params?.["page[number]"]) {
        apiParams["page[number]"] = params["page[number]"];
      } else if (params?.page) {
        // Legacy support
        apiParams["page[number]"] = params.page;
      }

      // Handle basic filters
      if (params?.status) apiParams.status = params.status;
      if (params?.projectId) apiParams["filter[project]"] = params.projectId;

      // Handle advanced filters
      if (params?.["filter[project]"])
        apiParams["filter[project]"] = params["filter[project]"];
      if (params?.["filter[region]"])
        apiParams["filter[region]"] = params["filter[region]"];
      if (params?.["filter[hostname]"])
        apiParams["filter[hostname]"] = params["filter[hostname]"];
      if (params?.["filter[created_at_gte]"])
        apiParams["filter[created_at_gte]"] = params["filter[created_at_gte]"];
      if (params?.["filter[created_at_lte]"])
        apiParams["filter[created_at_lte]"] = params["filter[created_at_lte]"];
      if (params?.["filter[label]"])
        apiParams["filter[label]"] = params["filter[label]"];
      if (params?.["filter[status]"])
        apiParams["filter[status]"] = params["filter[status]"];
      if (params?.["filter[plan]"])
        apiParams["filter[plan]"] = params["filter[plan]"];
      if (params?.["filter[gpu]"] !== undefined)
        apiParams["filter[gpu]"] = params["filter[gpu]"];
      if (params?.["filter[ram][eql]"])
        apiParams["filter[ram][eql]"] = params["filter[ram][eql]"];
      if (params?.["filter[ram][gte]"])
        apiParams["filter[ram][gte]"] = params["filter[ram][gte]"];
      if (params?.["filter[ram][lte]"])
        apiParams["filter[ram][lte]"] = params["filter[ram][lte]"];
      if (params?.["filter[disk][eql]"])
        apiParams["filter[disk][eql]"] = params["filter[disk][eql]"];
      if (params?.["filter[disk][gte]"])
        apiParams["filter[disk][gte]"] = params["filter[disk][gte]"];
      if (params?.["filter[disk][lte]"])
        apiParams["filter[disk][lte]"] = params["filter[disk][lte]"];
      if (params?.["filter[tags]"])
        apiParams["filter[tags]"] = params["filter[tags]"];

      // Handle extra fields
      if (params?.["extra_fields[servers]"])
        apiParams["extra_fields[servers]"] = params["extra_fields[servers]"];

      // Legacy support for region and plan
      if (params?.region) apiParams["filter[region]"] = params.region;
      if (params?.plan) apiParams["filter[plan]"] = params.plan;

      // Legacy support for tags array
      if (params?.tags && params.tags.length > 0) {
        apiParams["filter[tags]"] = params.tags.join(",");
      }

      const response: AxiosResponse<LatitudeAPIServersResponse> =
        await this.client.get("/servers", { params: apiParams });

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      // Use the servers directly from the API response
      const servers = response.data.data;
      const pagination = (response.data.meta as any)?.pagination;

      return {
        servers: servers as unknown as LatitudeServerDetails[],
        total:
          pagination?.total_count ??
          (response.data.meta as any)?.total ??
          servers.length,
        page:
          pagination?.current_page ??
          params?.["page[number]"] ??
          params?.page ??
          1,
        limit:
          pagination?.per_page ?? params?.["page[size]"] ?? params?.limit ?? 20,
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

      // Return the server directly with additional metadata
      const serverDetails: LatitudeServerDetails = {
        ...server,
        metadata: {
          tags: server.attributes.tags || [],
          category: "server",
          framework: server.attributes.operating_system?.name || undefined,
          language: undefined,
        },
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
            hostname: serverData.hostname,
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

      // Return the server directly with additional metadata
      const serverDetails: LatitudeServerDetails = {
        ...server,
        metadata: {
          tags: server.attributes.tags || [],
          category: "server",
          framework: server.attributes.operating_system?.name || undefined,
          language: undefined,
        },
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
            ...(serverData.hostname && { hostname: serverData.hostname }),
            ...(serverData.billing && { billing: serverData.billing }),
            ...(serverData.tags &&
              serverData.tags.length > 0 && { tags: serverData.tags }),
            ...(serverData.project && { project: serverData.project }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.patch(`/servers/${serverId}`, requestData);

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      const server = response.data.data;

      // Return the server directly with additional metadata
      const serverDetails: LatitudeServerDetails = {
        ...server,
        metadata: {
          tags: server.attributes.tags || [],
          category: "server",
          framework: server.attributes.operating_system?.name || undefined,
          language: undefined,
        },
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
  ): Promise<LatitudePlanRegion[]> {
    try {
      // Use getPlan internally since it works and returns regions
      const plan = await this.getPlan(planId);
      return (plan.attributes?.regions ||
        []) as unknown as LatitudePlanRegion[];
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
  async getServerDeployConfig(
    serverId: string
  ): Promise<LatitudeServerDeployConfig> {
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
      user_data?: number | null;
      ssh_keys?: number[];
      partitions?: Array<{
        path: string;
        size_in_gb: number;
        filesystem_type: string;
      }>;
      ipxe_url?: string | null;
    }
  ): Promise<LatitudeServerDeployConfig> {
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

      const response =
        await this.client.patch<LatitudeServerDeployConfigResponse>(
          `/servers/${serverId}/deploy_config`,
          payload
        );
      return response.data.data as LatitudeServerDeployConfig;
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
  async lockServer(serverId: string): Promise<LatitudeServerDetails> {
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
  async unlockServer(serverId: string): Promise<LatitudeServerDetails> {
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

  /**
   * List available operating systems
   */
  async listOperatingSystems(params?: {
    "page[size]"?: number;
    "page[number]"?: number;
  }): Promise<LatitudeOperatingSystem[]> {
    try {
      const response = await this.client.get<LatitudeOperatingSystemsResponse>(
        `/plans/operating_systems`,
        { params }
      );
      return response.data?.data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch operating systems: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
