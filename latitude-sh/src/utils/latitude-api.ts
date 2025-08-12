import axios, { AxiosInstance, AxiosResponse } from "axios";
import type {
  LatitudeProject,
  LatitudeProjectList,
  LatitudeAPIConfig,
  ProjectSearchParams,
  PlansSearchParams,
  LatitudeServerList,
  LatitudeServerDetails,
  ServerSearchParams,
  CreateServerParams,
  UpdateServerParams,
  LatitudeAPIProjectsResponse,
  LatitudeAPIProjectResponse,
  LatitudeAPIServersResponse,
  LatitudeAPIServerResponse,
  LatitudeAPIPlanData,
  LatitudeAPIPlanResponse,
  LatitudeAPIPlansResponse,
  LatitudeServerDeployConfigResponse,
  LatitudeServerDeployConfig,
  LatitudeOperatingSystemsResponse,
  LatitudeOutOfBandConnection,
  LatitudeAPIOOBConnectionResponse,
  LatitudeAPIOOBConnectionsResponse,
  LatitudeServerAction,
  LatitudeAPIServerActionResponse,
  LatitudeIPMICredentials,
  LatitudeAPIIPMICredentialsResponse,
  LatitudeRescueModeResponse,
  LatitudeAPIRescueModeResponse,
  LatitudeScheduleDeletionResponse,
  LatitudeAPIScheduleDeletionResponse,
  LatitudeUnscheduleDeletionResponse,
  LatitudeAPIUnscheduleDeletionResponse,
  LatitudeServerReinstallParams,
  LatitudeServerReinstallResponse,
  LatitudeAPIServerReinstallResponse,
  RegionsSearchParams,
  LatitudeRegion,
  LatitudeRegionsList,
  LatitudeRegionsResponse,
  OperatingSystemsSearchParams,
  LatitudeOperatingSystemsList,
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
          throw new Error("Resource not found");
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

      // Handle pagination parameters (transform from Cursor-compatible names)
      if (params?.pageSize) {
        apiParams["page[size]"] = params.pageSize;
      }

      if (params?.pageNumber) {
        apiParams["page[number]"] = params.pageNumber;
      }

      // Handle filters (transform from Cursor-compatible names)
      if (params?.filterName) apiParams["filter[name]"] = params.filterName;
      if (params?.filterSlug) apiParams["filter[slug]"] = params.filterSlug;
      if (params?.filterDescription)
        apiParams["filter[description]"] = params.filterDescription;
      if (params?.filterBillingType)
        apiParams["filter[billing_type]"] = params.filterBillingType;
      if (params?.filterEnvironment)
        apiParams["filter[environment]"] = params.filterEnvironment;
      if (params?.filterTags) apiParams["filter[tags]"] = params.filterTags;

      // Handle extra fields
      if (params?.extraFieldsProjects)
        apiParams["extra_fields[projects]"] = params.extraFieldsProjects;

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
        page: pagination?.current_page ?? params?.pageNumber ?? 1,
        limit: pagination?.per_page ?? params?.pageSize ?? 20,
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
  async getProject(projectId: string): Promise<LatitudeProject> {
    try {
      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.get(`/projects/${projectId}`);

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing project data");
      }

      // Return the project exactly as received from the API
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch project ${projectId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: {
    name: string;
    provisioning_type?: string;
    description?: string;
    environment?: string;
  }): Promise<LatitudeProject> {
    try {
      const requestData = {
        data: {
          type: "projects",
          attributes: {
            name: projectData.name,
            provisioning_type: projectData.provisioning_type ?? "on_demand",
            ...(projectData.description && {
              description: projectData.description,
            }),
            ...(projectData.environment && {
              environment: projectData.environment,
            }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.post("/projects", requestData);

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing project data");
      }

      // Return the project exactly as received from the API
      return response.data.data;
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
      bandwidth_alert?: boolean;
      tags?: string[];
    }
  ): Promise<LatitudeProject> {
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
            ...(projectData.bandwidth_alert !== undefined && {
              bandwidth_alert: projectData.bandwidth_alert,
            }),
            ...(projectData.tags &&
              projectData.tags.length > 0 && { tags: projectData.tags }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIProjectResponse> =
        await this.client.patch(`/projects/${projectId}`, requestData);

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing project data");
      }

      // Return the project exactly as received from the API
      return response.data.data;
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
   * Get all servers for the authenticated user with official filters
   */
  async getServers(params?: ServerSearchParams): Promise<LatitudeServerList> {
    try {
      // Build query parameters (transform from Cursor-compatible names)
      const apiParams: Record<string, unknown> = {};

      if (params) {
        // Pagination (transform from Cursor-compatible names)
        if (params.pageSize) apiParams["page[size]"] = params.pageSize;
        if (params.pageNumber) apiParams["page[number]"] = params.pageNumber;

        // All filters (transform from Cursor-compatible names)
        if (params.filterProject)
          apiParams["filter[project]"] = params.filterProject;
        if (params.filterRegion)
          apiParams["filter[region]"] = params.filterRegion;
        if (params.filterHostname)
          apiParams["filter[hostname]"] = params.filterHostname;
        if (params.filterCreatedAtGte)
          apiParams["filter[created_at_gte]"] = params.filterCreatedAtGte;
        if (params.filterCreatedAtLte)
          apiParams["filter[created_at_lte]"] = params.filterCreatedAtLte;
        if (params.filterLabel) apiParams["filter[label]"] = params.filterLabel;
        if (params.filterStatus)
          apiParams["filter[status]"] = params.filterStatus;
        if (params.filterPlan) apiParams["filter[plan]"] = params.filterPlan;
        if (params.filterGpu !== undefined)
          apiParams["filter[gpu]"] = params.filterGpu;
        if (params.filterRamEql)
          apiParams["filter[ram][eql]"] = params.filterRamEql;
        if (params.filterRamGte)
          apiParams["filter[ram][gte]"] = params.filterRamGte;
        if (params.filterRamLte)
          apiParams["filter[ram][lte]"] = params.filterRamLte;
        if (params.filterDisk) apiParams["filter[disk]"] = params.filterDisk;
        if (params.filterDiskEql)
          apiParams["filter[disk][eql]"] = params.filterDiskEql;
        if (params.filterDiskGte)
          apiParams["filter[disk][gte]"] = params.filterDiskGte;
        if (params.filterDiskLte)
          apiParams["filter[disk][lte]"] = params.filterDiskLte;
        if (params.filterTags) apiParams["filter[tags]"] = params.filterTags;
        if (params.extraFieldsServers)
          apiParams["extra_fields[servers]"] = params.extraFieldsServers;
      }

      const response: AxiosResponse<LatitudeAPIServersResponse> =
        await this.client.get("/servers", { params: apiParams });

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing servers data");
      }

      const servers = response.data.data;
      const meta = response.data.meta || {};

      return {
        servers: servers as unknown as LatitudeServerDetails[],
        total: (meta.total as number) || servers.length,
        page: params?.pageNumber || 1,
        limit: params?.pageSize || 20,
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
   * Get a specific server by ID with optional extra fields
   */
  async getServer(
    serverId: string,
    extraFields?: string
  ): Promise<LatitudeServerDetails> {
    try {
      const params = extraFields
        ? { "extra_fields[servers]": extraFields }
        : {};

      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.get(`/servers/${serverId}`, { params });

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing server data");
      }

      const server = response.data.data;
      return server as unknown as LatitudeServerDetails; // ✅ Sin metadata artificial
    } catch (error) {
      throw new Error(
        `Failed to fetch server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Create a new server according to official API specification
   */
  async createServer(
    serverData: CreateServerParams
  ): Promise<LatitudeServerDetails> {
    try {
      const requestData = {
        data: {
          type: "servers",
          attributes: {
            // Required fields
            project: serverData.project,
            plan: serverData.plan,
            site: serverData.site,
            operating_system: serverData.operatingSystem,
            hostname: serverData.hostname,

            // Optional fields (only if provided)
            ...(serverData.sshKeys && { ssh_keys: serverData.sshKeys }),
            ...(serverData.userData && { user_data: serverData.userData }),
            ...(serverData.raid && { raid: serverData.raid }),
            ...(serverData.ipxe && { ipxe: serverData.ipxe }),
            ...(serverData.billing && { billing: serverData.billing }),
          },
        },
      };

      const response: AxiosResponse<LatitudeAPIServerResponse> =
        await this.client.post("/servers", requestData);

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing server data");
      }

      const server = response.data.data;
      return server as unknown as LatitudeServerDetails;
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

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing server data");
      }

      const server = response.data.data;
      return server as unknown as LatitudeServerDetails; // ✅ Sin metadata artificial
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
  async deleteServer(serverId: string, reason?: string): Promise<any> {
    try {
      const params = reason ? { reason } : {};

      const response = await this.client.delete(`/servers/${serverId}`, {
        params,
      });

      // Verify we got a successful response
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to delete server: HTTP ${response.status}`);
      }

      return response.data;
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

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing plan data");
      }

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
   * List all plans with optional filtering
   */
  async listPlans(params?: PlansSearchParams): Promise<LatitudeAPIPlanData[]> {
    try {
      // Build query parameters (transform from Cursor-compatible names)
      const apiParams: Record<string, unknown> = {};

      if (params) {
        // Basic filters (transform from Cursor-compatible names)
        if (params.filterName) apiParams["filter[name]"] = params.filterName;
        if (params.filterSlug) apiParams["filter[slug]"] = params.filterSlug;
        if (params.filterLocation)
          apiParams["filter[location]"] = params.filterLocation;
        if (params.filterStockLevel)
          apiParams["filter[stock_level]"] = params.filterStockLevel;
        if (params.filterInStock !== undefined)
          apiParams["filter[in_stock]"] = params.filterInStock;
        if (params.filterGpu !== undefined)
          apiParams["filter[gpu]"] = params.filterGpu;

        // RAM filters with operators (transform from Cursor-compatible names)
        if (params.filterRamEql)
          apiParams["filter[ram][eql]"] = params.filterRamEql;
        if (params.filterRamGte)
          apiParams["filter[ram][gte]"] = params.filterRamGte;
        if (params.filterRamLte)
          apiParams["filter[ram][lte]"] = params.filterRamLte;

        // Disk filters with operators (transform from Cursor-compatible names)
        if (params.filterDiskEql)
          apiParams["filter[disk][eql]"] = params.filterDiskEql;
        if (params.filterDiskGte)
          apiParams["filter[disk][gte]"] = params.filterDiskGte;
        if (params.filterDiskLte)
          apiParams["filter[disk][lte]"] = params.filterDiskLte;
      }

      const response = await this.client.get<LatitudeAPIPlansResponse>(
        `/plans`,
        { params: apiParams }
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
   * List all regions with optional pagination
   */
  async listRegions(
    params?: RegionsSearchParams
  ): Promise<LatitudeRegionsList> {
    try {
      // Build query parameters (transform from Cursor-compatible names)
      const apiParams: Record<string, unknown> = {};

      if (params) {
        if (params.pageSize) apiParams["page[size]"] = params.pageSize;
        if (params.pageNumber) apiParams["page[number]"] = params.pageNumber;
      }

      const response = await this.client.get<LatitudeRegionsResponse>(
        `/regions`,
        { params: apiParams }
      );

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing regions data");
      }

      const regions = response.data.data;
      const meta = response.data.meta || {};

      return {
        regions,
        total: meta.total_count || regions.length,
        page: params?.pageNumber || 1,
        limit: params?.pageSize || 20,
      };
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
  async getRegion(regionId: string): Promise<LatitudeRegion> {
    try {
      const response = await this.client.get<{
        data: LatitudeRegion;
        meta: any;
      }>(`/regions/${regionId}`);

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing region data");
      }

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
      const response =
        await this.client.get<LatitudeServerDeployConfigResponse>(
          `/servers/${serverId}/deploy_config`
        );

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing deploy config data");
      }

      return response.data.data as LatitudeServerDeployConfig;
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
      operatingSystem?: string;
      raid?: string;
      userData?: number;
      sshKeys?: number[];
      partitions?: Array<{
        path: string;
        sizeInGb: number;
        filesystemType: string;
      }>;
      ipxeUrl?: string;
    }
  ): Promise<LatitudeServerDeployConfig> {
    try {
      const payload = {
        data: {
          type: "deploy_config",
          id: serverId,
          attributes: {
            ...(attrs.hostname && { hostname: attrs.hostname }),
            ...(attrs.operatingSystem && {
              operating_system: attrs.operatingSystem,
            }),
            ...(attrs.raid && { raid: attrs.raid }),
            ...(attrs.userData && { user_data: attrs.userData }),
            ...(attrs.sshKeys && { ssh_keys: attrs.sshKeys }),
            ...(attrs.partitions && {
              partitions: attrs.partitions.map((p) => ({
                path: p.path,
                size_in_gb: p.sizeInGb,
                filesystem_type: p.filesystemType,
              })),
            }),
            ...(attrs.ipxeUrl && { ipxe_url: attrs.ipxeUrl }),
          },
        },
      };

      const response =
        await this.client.patch<LatitudeServerDeployConfigResponse>(
          `/servers/${serverId}/deploy_config`,
          payload
        );

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing deploy config data");
      }

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

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing server data");
      }

      return response.data.data as unknown as LatitudeServerDetails;
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

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing server data");
      }

      return response.data.data as unknown as LatitudeServerDetails;
    } catch (error) {
      throw new Error(
        `Failed to unlock server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * List available operating systems with optional pagination
   */
  async listOperatingSystems(
    params?: OperatingSystemsSearchParams
  ): Promise<LatitudeOperatingSystemsList> {
    try {
      // Build query parameters (transform from Cursor-compatible names)
      const apiParams: Record<string, unknown> = {};

      if (params) {
        if (params.pageSize) apiParams["page[size]"] = params.pageSize;
        if (params.pageNumber) apiParams["page[number]"] = params.pageNumber;
      }

      const response = await this.client.get<LatitudeOperatingSystemsResponse>(
        `/plans/operating_systems`,
        { params: apiParams }
      );

      if (!response.data?.data) {
        throw new Error("Invalid API response: missing operating systems data");
      }

      const operatingSystems = response.data.data;
      const meta = response.data.meta || {};

      return {
        operatingSystems,
        total: (meta.total_count as number) || operatingSystems.length,
        page: params?.pageNumber || 1,
        limit: params?.pageSize || 20,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch operating systems: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Start an Out Of Band connection for a server
   */
  async startOutOfBandConnection(
    serverId: string,
    sshKeyId?: string
  ): Promise<LatitudeOutOfBandConnection> {
    try {
      const payload = {
        data: {
          type: "out_of_band",
          ...(sshKeyId && {
            attributes: {
              ssh_key_id: sshKeyId,
            },
          }),
        },
      };

      const response = await this.client.post<LatitudeAPIOOBConnectionResponse>(
        `/servers/${serverId}/out_of_band_connection`,
        payload
      );

      if (!response.data?.data) {
        throw new Error(
          "Invalid API response: missing out of band connection data"
        );
      }

      // Return the out-of-band connection exactly as received from the API
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to start out-of-band connection for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * List out-of-band connections for a server
   */
  async listOutOfBandConnections(
    serverId: string
  ): Promise<LatitudeOutOfBandConnection[]> {
    try {
      const response = await this.client.get<LatitudeAPIOOBConnectionsResponse>(
        `/servers/${serverId}/out_of_band_connection`
      );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to list out-of-band connections for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Run an action on a server (power_on, power_off, reboot)
   */
  async runServerAction(
    serverId: string,
    action: "power_on" | "power_off" | "reboot"
  ): Promise<LatitudeServerAction> {
    try {
      const payload = {
        data: {
          type: "actions",
          attributes: {
            action: action,
          },
        },
      };

      const response = await this.client.post<LatitudeAPIServerActionResponse>(
        `/servers/${serverId}/actions`,
        payload
      );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to run action ${action} on server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Generate IPMI credentials for a server
   */
  async generateIPMICredentials(
    serverId: string
  ): Promise<LatitudeIPMICredentials> {
    try {
      const response =
        await this.client.post<LatitudeAPIIPMICredentialsResponse>(
          `/servers/${serverId}/remote_access`
        );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to generate IPMI credentials for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Put a server in rescue mode
   */
  async enterRescueMode(serverId: string): Promise<LatitudeRescueModeResponse> {
    try {
      const response = await this.client.post<LatitudeAPIRescueModeResponse>(
        `/servers/${serverId}/rescue_mode`
      );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to enter rescue mode for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Exit rescue mode for a server
   */
  async exitRescueMode(serverId: string): Promise<LatitudeRescueModeResponse> {
    try {
      const response = await this.client.post<LatitudeAPIRescueModeResponse>(
        `/servers/${serverId}/exit_rescue_mode`
      );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to exit rescue mode for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Schedule server deletion at end of billing cycle
   */
  async scheduleServerDeletion(
    serverId: string
  ): Promise<LatitudeScheduleDeletionResponse> {
    try {
      const response =
        await this.client.post<LatitudeAPIScheduleDeletionResponse>(
          `/servers/${serverId}/schedule_deletion`
        );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to schedule deletion for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Unschedule server deletion (cancel scheduled deletion)
   */
  async unscheduleServerDeletion(
    serverId: string
  ): Promise<LatitudeUnscheduleDeletionResponse> {
    try {
      const response =
        await this.client.delete<LatitudeAPIUnscheduleDeletionResponse>(
          `/servers/${serverId}/schedule_deletion`
        );

      // DELETE operations may return empty responses or just meta
      return (
        response.data.data || {
          message: "Server deletion unscheduled successfully",
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to unschedule deletion for server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Reinstall server with new configuration
   */
  async reinstallServer(
    serverId: string,
    params: LatitudeServerReinstallParams
  ): Promise<LatitudeServerReinstallResponse> {
    try {
      const requestData = {
        data: {
          type: "reinstalls",
          attributes: {
            ...(params.operatingSystem && {
              operating_system: params.operatingSystem,
            }),
            ...(params.hostname && { hostname: params.hostname }),
            ...(params.partitions && {
              partitions: params.partitions.map((p) => ({
                size_in_gb: p.sizeInGb,
                path: p.path,
                filesystem_type: p.filesystemType,
              })),
            }),
            ...(params.sshKeys && { ssh_keys: params.sshKeys }),
            ...(params.userData && { user_data: params.userData }),
            ...(params.raid && { raid: params.raid }),
            ...(params.ipxe && { ipxe: params.ipxe }),
          },
        },
      };

      const response =
        await this.client.post<LatitudeAPIServerReinstallResponse>(
          `/servers/${serverId}/reinstall`,
          requestData
        );

      if (!response.data.data) {
        throw new Error("Invalid API response: missing data");
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to reinstall server ${serverId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
