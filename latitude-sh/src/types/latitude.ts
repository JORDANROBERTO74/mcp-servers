export interface LatitudeProject {
  id: string;
  type: string;
  attributes?: {
    tags?: string[];
    name: string;
    slug: string;
    description?: string;
    billing_type?: string;
    billing_method?: string;
    bandwidth_alert?: boolean;
    environment?: string;
    provisioning_type?: string;
    billing: {
      subscription_id?: string;
      type?: string;
      method?: string;
    };
    team: {
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      address?: string;
      currency: {
        id?: string;
        code?: string;
        name?: string;
      } | null;
      status?: string;
      feature_flags?: string[];
    };
    stats: {
      databases?: number;
      ip_addresses?: number;
      prefixes?: number;
      servers?: number;
      storages?: number;
      virtual_machines?: number;
      vlans?: number;
    };
    created_at?: string;
    updated_at?: string;
  };
  metadata?: {
    tags?: string[];
    category?: string;
    framework?: string;
    language?: string;
    provisioning_type?: string;
  };
}

export interface LatitudeProjectList {
  projects: LatitudeProject[];
  total: number;
  page: number;
  limit: number;
}

export interface LatitudeAPIConfig {
  apiKey: string;
  baseURL: string;
  timeout: number;
}

export interface ProjectSearchParams {
  // Pagination parameters (compatible with Cursor)
  pageSize?: number;
  pageNumber?: number;

  // Filters (compatible with Cursor)
  filterName?: string;
  filterSlug?: string;
  filterDescription?: string;
  filterBillingType?: string;
  filterEnvironment?: string;
  filterTags?: string; // Comma-separated string

  // Extra fields
  extraFieldsProjects?: string; // last_renewal_date,next_renewal_date
}

export interface PlansSearchParams {
  // Filters (compatible with Cursor)
  filterName?: string;
  filterSlug?: string;
  filterLocation?: string;
  filterStockLevel?: string;
  filterInStock?: boolean;
  filterGpu?: boolean;

  // RAM filters with operators
  filterRamEql?: number;
  filterRamGte?: number;
  filterRamLte?: number;

  // Disk filters with operators
  filterDiskEql?: number;
  filterDiskGte?: number;
  filterDiskLte?: number;
}

export interface RegionsSearchParams {
  // Pagination parameters (compatible with Cursor)
  pageSize?: number;
  pageNumber?: number;
}

export interface LatitudeRegion {
  id: string;
  type: string;
  attributes: {
    name: string;
    slug: string;
    facility: string;
    country: {
      name: string;
      slug: string;
    };
    type: string;
  };
}

export interface LatitudeRegionsResponse {
  data: LatitudeRegion[];
  meta: Record<string, any>;
}

export interface LatitudeRegionsList {
  regions: LatitudeRegion[];
  total: number;
  page: number;
  limit: number;
}

// Server Types
export interface LatitudeServer {
  id: string;
  type: string;
  attributes: {
    tags: string[];
    hostname: string;
    label?: string;
    price?: number;
    role: string;
    primary_ipv4: string;
    primary_ipv6?: string;
    status: string;
    ipmi_status: string;
    created_at: string;
    scheduled_deletion_at: string | null;
    locked: boolean;
    rescue_allowed: boolean;
    region: {
      city: string;
      country: string;
      site: {
        id: string;
        name: string;
        slug: string;
        facility: string;
        rack_id: string;
      };
    };
    team: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      address: string | null;
      currency: {
        id: string;
        code: string;
        name: string;
      };
      status: string;
      feature_flags: string[];
    };
    project: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      provisioning_type: string;
      billing_type: string;
      billing_method: string;
      bandwidth_alert: boolean;
      environment: string | null;
      billing: {
        subscription_id: string;
        type: string;
        method: string;
      };
      stats: {
        databases: number;
        ip_addresses: number;
        prefixes: number;
        servers: number;
        storages: number;
        virtual_machines: number;
        vlans: number;
      };
    };
    plan: {
      id: string;
      name: string;
      slug: string;
      billing: string;
    };
    interfaces: Array<{
      role: string;
      name: string;
      mac_address: string;
      description: string;
    }>;
    operating_system: {
      name: string;
      slug: string;
      version: string;
      features: {
        raid: boolean;
        rescue: boolean;
        ssh_keys: boolean;
        user_data: boolean;
      };
      distro: {
        name: string;
        slug: string;
        series: string;
      };
    };
    specs: {
      cpu: string;
      disk: string;
      ram: string;
      nic: string;
      gpu: string | null;
    };
  };
}

export interface LatitudeServerList {
  servers: LatitudeServer[];
  total: number;
  page: number;
  limit: number;
}

export interface LatitudeServerDetails extends LatitudeServer {
  // Additional metadata that might be added by the API client
  metadata?: {
    tags: string[];
    category: string;
    framework?: string;
    language?: string;
  };
}

export interface ServerSearchParams {
  // Pagination parameters (compatible with Cursor)
  pageSize?: number;
  pageNumber?: number;

  // Filters (compatible with Cursor)
  filterProject?: string; // Project ID or Slug
  filterRegion?: string; // Region Slug
  filterHostname?: string; // Server hostname
  filterCreatedAtGte?: string; // Created at greater than equal date
  filterCreatedAtLte?: string; // Created at less than equal date
  filterLabel?: string; // Server label
  filterStatus?: string; // Server status
  filterPlan?: string; // Platform/plan name
  filterGpu?: boolean; // Filter by GPU existence
  filterRamEql?: number; // RAM size equals (in GB)
  filterRamGte?: number; // RAM size greater than or equal (in GB)
  filterRamLte?: number; // RAM size less than or equal (in GB)
  filterDisk?: number; // Disk size (in GB)
  filterDiskEql?: number; // Disk size equals (in GB)
  filterDiskGte?: number; // Disk size greater than or equal (in GB)
  filterDiskLte?: number; // Disk size less than or equal (in GB)
  filterTags?: string; // Tags IDs separated by comma

  // Extra fields
  extraFieldsServers?: string; // credentials
}

export interface CreateServerParams {
  // Required fields according to official docs
  project: string; // Project ID or Slug
  plan: string; // Plan slug
  site: string; // Site slug (region)
  operatingSystem: string; // OS slug
  hostname: string; // Server hostname

  // Optional fields according to official docs
  sshKeys?: string[]; // SSH Keys array
  userData?: string; // User data ID (not script content)
  raid?: string; // RAID mode
  ipxe?: string; // iPXE script URL or base64
  billing?: "hourly" | "monthly" | "yearly"; // Billing type
}

export interface GetServerParams {
  serverId: string;
  extraFieldsServers?: string; // Para credenciales lazy-loaded
}

export interface UpdateServerParams {
  hostname?: string;
  billing?: "hourly" | "monthly" | "yearly";
  tags?: string[];
  project?: string;
}

// API Response Types for Latitude.sh
export interface LatitudeAPIProjectResponse {
  data: LatitudeProject;
}

// Raw project data returned by API list endpoint (same as LatitudeProject)
export type LatitudeAPIProjectData = LatitudeProject;

export interface LatitudeAPIProjectsResponse {
  data: LatitudeAPIProjectData[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface LatitudeAPIServerData {
  id: string;
  type: string;
  attributes: {
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    status:
      | "running"
      | "stopped"
      | "starting"
      | "stopping"
      | "error"
      | "deleted";
    project_id: string;
    region?: {
      id: string;
      name: string;
      slug: string;
    };
    plan?: {
      id: string;
      name: string;
      slug: string;
      price: number;
      currency: string;
    };
    ip_address?: string;
    private_ip_address?: string;
    ssh_keys?: Array<{
      id: string;
      name: string;
      public_key: string;
    }>;
    tags?: string[];
    specs?: {
      cpu: number;
      memory: number;
      disk: number;
      bandwidth: number;
    };
    os?: {
      name: string;
      version: string;
      architecture: string;
    };
    network?: {
      gateway?: string;
      netmask?: string;
    };
  };
}

export interface LatitudeAPIPlanRegion {
  locations?: {
    available?: string[];
    in_stock?: string[];
  };
  pricing?: Record<string, unknown>;
}

export interface LatitudeAPIPlanData {
  id: string;
  type: string;
  attributes: {
    name?: string;
    slug?: string;
    regions?: LatitudeAPIPlanRegion[];
  } & Record<string, unknown>;
}

export interface LatitudeAPIPlanResponse {
  data: LatitudeAPIPlanData;
}

export interface LatitudeAPIPlansResponse {
  data: LatitudeAPIPlanData[];
}

export interface LatitudeAPIServerResponse {
  data: LatitudeServer;
}

export interface LatitudeAPIServersResponse {
  data: LatitudeAPIServerData[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Plan-related interfaces

export interface LatitudePlanRegion {
  name: string;
  deploys_instantly: string[]; // Array of OS that deploy instantly
  locations: {
    available: string[];
    in_stock: string[];
  };
  stock_level: string;
  pricing: {
    USD: {
      minute?: number | null;
      hour?: number | null;
      month?: number | null;
      year?: number | null;
    };
    BRL: {
      minute?: number | null;
      hour?: number | null;
      month?: number | null;
      year?: number | null;
    };
  };
}

// Note: Global Regions endpoint has a different shape (id/type/attributes{ name, slug, facility, country, type }).
// If we add a tool for listing global regions, we will add a specific type for that response.

// Server Deploy Config
export interface DeployConfigPartition {
  path: string;
  sizeInGb: number;
  filesystemType: string;
}

export interface LatitudeServerDeployConfig {
  id: string; // server id
  type: "deploy_config";
  attributes: {
    ssh_keys: string[];
    user_data: string | null;
    raid: string | null;
    operating_system: string | null;
    hostname: string | null;
    ipxe_url: string | null;
    ipxe: string | null;
    partitions: DeployConfigPartition[];
  };
}

export interface LatitudeServerDeployConfigResponse {
  data: LatitudeServerDeployConfig;
  meta?: Record<string, unknown>;
}

export interface UpdateDeployConfigPartition {
  path: string;
  size_in_gb: number;
  filesystem_type: string;
}

// Operating Systems
export interface LatitudeOperatingSystem {
  id: string;
  type: string; // "operating_system"
  attributes: {
    name: string;
    distro: string;
    slug: string;
    version: string;
    user: string;
    features: {
      raid: boolean;
      rescue: boolean;
      ssh_keys: boolean;
      user_data?: boolean;
      accelerate?: boolean;
    };
    provisionable_on: string[];
  };
}

export interface LatitudeOperatingSystemsResponse {
  data: LatitudeOperatingSystem[];
  meta?: Record<string, unknown>;
}

export interface OperatingSystemsSearchParams {
  // Pagination parameters (compatible with Cursor)
  pageSize?: number;
  pageNumber?: number;
}

export interface LatitudeOperatingSystemsList {
  operatingSystems: LatitudeOperatingSystem[];
  total: number;
  page: number;
  limit: number;
}

export interface LatitudeOutOfBandConnection {
  id: string;
  type: string;
  attributes: {
    ssh_key?: {
      id: string;
      description: string;
      fingerprint: string;
    };
    created_at: string;
    username: string;
    credentials: {
      user: string;
      password: string;
    };
    port: string;
    access_ip: string;
    server_id: string;
    status: string;
  };
}

export interface LatitudeAPIOOBConnectionResponse {
  data: LatitudeOutOfBandConnection;
}

export interface LatitudeAPIOOBConnectionsResponse {
  data: LatitudeOutOfBandConnection[];
  meta?: Record<string, unknown>;
}

export interface LatitudeServerAction {
  id: string;
  type: string;
  attributes: {
    status: string;
  };
}

export interface LatitudeAPIServerActionResponse {
  data: LatitudeServerAction;
  meta?: Record<string, unknown>;
}

export interface LatitudeIPMICredentials {
  id: string;
  type: string;
  attributes: {
    ipmi_address: string;
    ipmi_url: string | null;
    ipmi_username: string;
    ipmi_password: string;
  };
}

export interface LatitudeAPIIPMICredentialsResponse {
  data: LatitudeIPMICredentials;
  meta?: Record<string, unknown>;
}

export interface LatitudeRescueModeResponse {
  id: string;
  type: string;
  attributes: {
    status: string;
  };
}

export interface LatitudeAPIRescueModeResponse {
  data: LatitudeRescueModeResponse;
  meta?: Record<string, unknown>;
}

// Schedule Deletion Response
export interface LatitudeScheduleDeletionResponse {
  id: string;
  type: string;
  attributes: {
    server_id: string;
    scheduled_deletion_at: string;
  };
}

export interface LatitudeAPIScheduleDeletionResponse {
  data: LatitudeScheduleDeletionResponse;
  meta?: Record<string, unknown>;
}

// Unschedule Deletion Response (typically empty response for DELETE operations)
export interface LatitudeUnscheduleDeletionResponse {
  message?: string;
}

export interface LatitudeAPIUnscheduleDeletionResponse {
  data?: LatitudeUnscheduleDeletionResponse;
  meta?: Record<string, unknown>;
}

// Server Reinstall Request Parameters
export interface LatitudeServerReinstallParams {
  operatingSystem?: string;
  hostname?: string;
  partitions?: Array<{
    sizeInGb: number;
    path: string;
    filesystemType: string;
  }>;
  sshKeys?: string[];
  userData?: number;
  raid?: string;
  ipxe?: string;
}

// Server Reinstall Response
export interface LatitudeServerReinstallResponse {
  id: string;
  type: string;
  attributes: {
    status: string;
    [key: string]: any;
  };
}

export interface LatitudeAPIServerReinstallResponse {
  data: LatitudeServerReinstallResponse;
  meta?: Record<string, unknown>;
}
