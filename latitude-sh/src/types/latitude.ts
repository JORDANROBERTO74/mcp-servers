export interface LatitudeProject {
  id: string;
  type: string;
  attributes: {
    tags: string[];
    name: string;
    slug: string;
    description?: string;
    billing_type: string;
    billing_method: string;
    bandwidth_alert: boolean;
    environment: string;
    provisioning_type: string;
    billing: {
      subscription_id: string;
      type: string;
      method: string;
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
    stats: {
      databases: number;
      ip_addresses: number;
      prefixes: number;
      servers: number;
      storages: number;
      virtual_machines: number;
      vlans: number;
    };
    created_at: string;
    updated_at: string;
  };
  metadata?: {
    tags: string[];
    category: string;
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

export interface LatitudeProjectDetails extends LatitudeProject {
  metadata?: {
    tags: string[];
    category: string;
    framework?: string;
    language?: string;
    provisioning_type?: string;
  };
}

export interface LatitudeAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LatitudeAPIConfig {
  apiKey: string;
  baseURL: string;
  timeout: number;
}

export interface ProjectSearchParams {
  // Pagination
  "page[size]"?: number;
  "page[number]"?: number;

  // Basic filters
  // (no undocumented basic filters)

  // Advanced filters
  "filter[name]"?: string;
  "filter[slug]"?: string;
  "filter[description]"?: string;
  "filter[billing_type]"?: string;
  "filter[environment]"?: string;
  "filter[tags]"?: string; // Comma-separated string

  // Extra fields
  "extra_fields[projects]"?: string; // last_renewal_date,next_renewal_date

  // Legacy support (for backward compatibility)
  limit?: number;
  page?: number;
  tags?: string[];
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
  // Pagination
  "page[size]"?: number;
  "page[number]"?: number;

  // Basic filters
  status?: string;
  projectId?: string;

  // Advanced filters
  "filter[project]"?: string; // Project ID or Slug
  "filter[region]"?: string; // Region Slug
  "filter[hostname]"?: string; // Server hostname
  "filter[created_at_gte]"?: string; // Created at greater than equal date
  "filter[created_at_lte]"?: string; // Created at less than equal date
  "filter[label]"?: string; // Server label
  "filter[status]"?: string; // Server status
  "filter[plan]"?: string; // Platform/plan name
  "filter[gpu]"?: boolean; // Filter by GPU existence
  "filter[ram][eql]"?: number; // RAM size equals (in GB)
  "filter[ram][gte]"?: number; // RAM size greater than or equal (in GB)
  "filter[ram][lte]"?: number; // RAM size less than or equal (in GB)
  "filter[disk][eql]"?: number; // Disk size equals (in GB)
  "filter[disk][gte]"?: number; // Disk size greater than or equal (in GB)
  "filter[disk][lte]"?: number; // Disk size less than or equal (in GB)
  "filter[tags]"?: string; // Tags IDs separated by comma

  // Extra fields
  "extra_fields[servers]"?: string; // credentials

  // Legacy support (for backward compatibility)
  limit?: number;
  page?: number;
  region?: string;
  plan?: string;
  tags?: string[];
}

export interface CreateServerParams {
  hostname: string;
  projectId: string;
  regionId: string;
  planId: string;
  operating_system?: string;
  description?: string;
  sshKeys?: string[];
  tags?: string[];
  userData?: string;
  startupScript?: string;
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

export interface LatitudeAPIParams {
  // Pagination
  "page[size]"?: number;
  "page[number]"?: number;

  // Basic filters
  status?: string;
  owner?: string;

  // Advanced filters for projects
  "filter[name]"?: string;
  "filter[slug]"?: string;
  "filter[description]"?: string;
  "filter[billing_type]"?: string;
  "filter[environment]"?: string;
  "filter[tags]"?: string;

  // Advanced filters for servers
  "filter[project]"?: string;
  "filter[region]"?: string;
  "filter[hostname]"?: string;
  "filter[created_at_gte]"?: string;
  "filter[created_at_lte]"?: string;
  "filter[label]"?: string;
  "filter[status]"?: string;
  "filter[plan]"?: string;
  "filter[gpu]"?: boolean;
  "filter[ram][eql]"?: number;
  "filter[ram][gte]"?: number;
  "filter[ram][lte]"?: number;
  "filter[disk][eql]"?: number;
  "filter[disk][gte]"?: number;
  "filter[disk][lte]"?: number;

  // Extra fields
  "extra_fields[projects]"?: string;
  "extra_fields[servers]"?: string;

  // Legacy support
  limit?: number;
  page?: number;
  tags?: string;
  query?: string;
  project_id?: string;
  region?: string;
  plan?: string;
}

// Plan-related interfaces
export interface LatitudePlanSpecs {
  cpu: {
    type: string;
    clock: number;
    cores: number;
    count: number;
  };
  vcpu?: {
    count: number;
  };
  memory: {
    total: number;
  };
  ephemeral_storage?: {
    total: number;
  };
  drives: Array<{
    count: number;
    size: string;
    type: string;
  }>;
  nics: Array<{
    count: number;
    type: string;
  }>;
  gpu?: {
    count?: number;
    type?: string;
  };
}

export interface LatitudePlanRegion {
  name: string;
  locations: {
    available: string[];
    in_stock: string[];
  };
  stock_level: string;
  pricing: {
    USD: {
      minute: number | null;
      hour: number | null;
      month: number | null;
      year: number | null;
    };
    BRL: {
      minute: number | null;
      hour: number | null;
      month: number | null;
      year: number | null;
    };
  };
}

export interface LatitudePlan {
  id: string;
  type: string;
  attributes: {
    slug: string;
    name: string;
    features: string[];
    specs: LatitudePlanSpecs;
    regions: LatitudePlanRegion[];
  };
}

export interface LatitudePlanList {
  data: LatitudePlan[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
    };
  };
}

export interface LatitudePlanResponse {
  data: LatitudePlan;
}

// Global Regions (List all Regions endpoint)
export interface GlobalRegionAttributes {
  name: string;
  slug: string;
  facility: string;
  country: {
    name: string;
    slug: string;
  };
  type: string;
}

export interface GlobalRegion {
  id: string;
  type: string; // "regions"
  attributes: GlobalRegionAttributes;
}

export interface GlobalRegionList {
  data: GlobalRegion[];
}

export interface GlobalRegionResponse {
  data: GlobalRegion;
  meta?: Record<string, unknown>;
}

// Note: Global Regions endpoint has a different shape (id/type/attributes{ name, slug, facility, country, type }).
// If we add a tool for listing global regions, we will add a specific type for that response.

// Server Deploy Config
export interface DeployConfigPartition {
  path: string;
  size_in_gb: number;
  filesystem_type: string;
}

export interface DeployConfigAttributes {
  ssh_keys: string[];
  user_data: string | null;
  raid: string | null;
  operating_system: string | null;
  hostname: string | null;
  ipxe_url: string | null;
  ipxe: string | null;
  partitions: DeployConfigPartition[];
}

export interface LatitudeServerDeployConfig {
  id: string; // server id
  type: "deploy_config";
  attributes: DeployConfigAttributes;
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

export interface UpdateDeployConfigParams {
  hostname?: string;
  operating_system?: string;
  raid?: string;
  user_data?: number | null; // API expects integer user_data id
  ssh_keys?: number[]; // API expects array of integer ssh_key ids
  partitions?: UpdateDeployConfigPartition[];
  ipxe_url?: string | null;
}

// Operating Systems
export interface LatitudeOSFeatures {
  raid: boolean;
  rescue: boolean;
  ssh_keys: boolean;
  user_data?: boolean;
  accelerate?: boolean;
}

export interface LatitudeOperatingSystemAttributes {
  name: string;
  distro: string;
  slug: string;
  version: string;
  user: string;
  features: LatitudeOSFeatures;
  provisionable_on: string[];
}

export interface LatitudeOperatingSystem {
  id: string;
  type: string; // "operating_system"
  attributes: LatitudeOperatingSystemAttributes;
}

export interface LatitudeOperatingSystemsResponse {
  data: LatitudeOperatingSystem[];
  meta?: Record<string, unknown>;
}
