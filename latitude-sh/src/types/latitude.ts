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
}

export interface LatitudeProjectList {
  projects: LatitudeProject[];
  total: number;
  page: number;
  limit: number;
}

export interface LatitudeProjectDetails extends LatitudeProject {
  files?: Array<{
    id: string;
    name: string;
    path: string;
    size: number;
    type: "file" | "directory";
    lastModified: string;
  }>;
  metadata?: {
    tags: string[];
    category: string;
    framework?: string;
    language?: string;
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
  status?: "active" | "inactive" | "archived";
  owner?: string;

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
  query?: string;
}

// Server Types
export interface LatitudeServer {
  id: string;
  type: string;
  attributes: {
    tags: string[];
    hostname: string;
    label: string;
    price: number;
    role: string;
    primary_ipv4: string;
    primary_ipv6?: string;
    status: "on" | "off" | "rebooting" | "provisioning" | "deleted";
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
  status?: "on" | "off" | "rebooting" | "provisioning" | "deleted";
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
  project: string;
  plan: string;
  operating_system: string;
  hostname: string;
  site: string;
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

export interface LatitudeAPIProjectsResponse {
  data: LatitudeProject[];
}

export interface LatitudeAPIServerResponse {
  data: LatitudeServer;
}

export interface LatitudeAPIServersResponse {
  data: LatitudeServer[];
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
  memory: {
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
  gpu: Record<string, any>;
}

export interface LatitudePlanRegion {
  name: string;
  deploys_instantly: string[];
  locations: {
    available: string[];
    in_stock: string[];
  };
  stock_level: string;
  pricing: {
    USD: {
      hour: number;
      month: number;
      year: number;
    };
    BRL: {
      hour: number;
      month: number;
      year: number;
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
