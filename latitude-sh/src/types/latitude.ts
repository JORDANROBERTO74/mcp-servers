export interface LatitudeProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "archived";
  owner: {
    id: string;
    name: string;
    email: string;
  };
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member";
  }>;
  settings?: {
    visibility: "public" | "private";
    allowComments: boolean;
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
  query?: string;
  status?: "active" | "inactive" | "archived";
  owner?: string;
  tags?: string[];
  limit?: number;
  page?: number;
}

// Server Types
export interface LatitudeServer {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: "running" | "stopped" | "starting" | "stopping" | "error" | "deleted";
  projectId: string;
  region: {
    id: string;
    name: string;
    slug: string;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
  };
  ipAddress?: string;
  privateIpAddress?: string;
  sshKeys?: Array<{
    id: string;
    name: string;
    publicKey: string;
  }>;
  tags?: string[];
  metadata?: {
    os: string;
    cpu: number;
    memory: number;
    disk: number;
    bandwidth: number;
  };
}

export interface LatitudeServerList {
  servers: LatitudeServer[];
  total: number;
  page: number;
  limit: number;
}

export interface LatitudeServerDetails extends LatitudeServer {
  specs?: {
    cpu: number;
    memory: number;
    disk: number;
    bandwidth: number;
  };
  network?: {
    publicIp: string;
    privateIp?: string;
    gateway?: string;
    netmask?: string;
  };
  os?: {
    name: string;
    version: string;
    architecture: string;
  };
  actions?: Array<{
    id: string;
    name: string;
    status: "pending" | "running" | "completed" | "failed";
    createdAt: string;
  }>;
}

export interface ServerSearchParams {
  projectId?: string;
  status?:
    | "running"
    | "stopped"
    | "starting"
    | "stopping"
    | "error"
    | "deleted";
  region?: string;
  plan?: string;
  tags?: string[];
  limit?: number;
  page?: number;
}

export interface CreateServerParams {
  name: string;
  projectId: string;
  regionId: string;
  planId: string;
  description?: string;
  sshKeys?: string[];
  tags?: string[];
  userData?: string;
  startupScript?: string;
}

export interface UpdateServerParams {
  name?: string;
  description?: string;
  tags?: string[];
}

// API Response Types for Latitude.sh
export interface LatitudeAPIProjectData {
  id: string;
  type: string;
  attributes: {
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    team?: {
      id: string;
      name: string;
    };
    tags?: string[];
    environment?: string;
    provisioning_type?: string;
    billing_type?: string;
    billing_method?: string;
  };
}

export interface LatitudeAPIProjectResponse {
  data: LatitudeAPIProjectData;
}

export interface LatitudeAPIProjectsResponse {
  data: LatitudeAPIProjectData[];
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
    actions?: Array<{
      id: string;
      name: string;
      status: "pending" | "running" | "completed" | "failed";
      created_at: string;
    }>;
  };
}

export interface LatitudeAPIServerResponse {
  data: LatitudeAPIServerData;
}

export interface LatitudeAPIServersResponse {
  data: LatitudeAPIServerData[];
}

export interface LatitudeAPIParams {
  "page[size]"?: number;
  "page[number]"?: number;
  status?: string;
  owner?: string;
  tags?: string;
  query?: string;
  project_id?: string;
  region?: string;
  plan?: string;
}
