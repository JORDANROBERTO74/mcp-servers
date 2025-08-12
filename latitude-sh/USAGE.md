# Latitude.sh MCP Server - Usage Guide

This comprehensive guide shows you how to use the Latitude.sh MCP server with practical examples for all available tools.

## Table of Contents

- [🚀 Quick Start](#-quick-start)
  - [1. Installation & Setup](#1-installation--setup)
  - [2. Basic Usage](#2-basic-usage)
- [📁 Project Management Tools](#-project-management-tools)
  - [1. list_projects](#1-list_projects---list-all-projects)
  - [2. get_project](#2-get_project---get-project-details)
  - [3. create_project](#3-create_project---create-new-project)
  - [4. update_project](#4-update_project---update-existing-project)
  - [5. delete_project](#5-delete_project---delete-project)
- [🖥️ Server Management Tools](#️-server-management-tools)
  - [1. list_servers](#1-list_servers---list-all-servers)
  - [2. create_server](#2-create_server---create-new-server)
  - [3. get_server](#3-get_server---get-server-details)
  - [4. update_server](#4-update_server---update-server)
  - [5. delete_server](#5-delete_server---delete-server)
- [🔒 Server Security Tools](#-server-security-tools)
  - [1. lock_server](#1-lock_server---lock-a-server)
  - [2. unlock_server](#2-unlock_server---unlock-a-server)
- [🔄 Server Operations Tools](#-server-operations-tools)
  - [1. run_server_action](#1-run_server_action---run-power-actions)
  - [2. enter_rescue_mode](#2-enter_rescue_mode---enter-rescue-mode)
  - [3. exit_rescue_mode](#3-exit_rescue_mode---exit-rescue-mode)
  - [4. server_reinstall](#4-server_reinstall---reinstall-server)
  - [5. schedule_server_deletion](#5-schedule_server_deletion---schedule-deletion)
  - [6. unschedule_server_deletion](#6-unschedule_server_deletion---cancel-scheduled-deletion)
- [🌐 Out of Band Access Tools](#-out-of-band-access-tools)
  - [1. start_out_of_band_connection](#1-start_out_of_band_connection---start-oob-connection)
  - [2. list_out_of_band_connections](#2-list_out_of_band_connections---list-oob-connections)
  - [3. generate_ipmi_credentials](#3-generate_ipmi_credentials---generate-ipmi-credentials)
- [📊 Plan and Region Tools](#-plan-and-region-tools)
  - [1. list_plans](#1-list_plans---list-all-plans)
  - [2. get_plan](#2-get_plan---get-plan-by-id)
  - [3. list_regions](#3-list_regions---list-global-regions)
  - [4. get_region](#4-get_region---get-region-by-id)
- [🔧 Utility Tools](#-utility-tools)
  - [1. test_connection](#1-test_connection---test-api-connection)
  - [2. get_server_deploy_config](#2-get_server_deploy_config---retrieve-deploy-config)
  - [3. update_server_deploy_config](#3-update_server_deploy_config---update-deploy-config)
  - [4. list_operating_systems](#4-list_operating_systems---list-available-operating-systems)
- [🚀 Smart Server Creation Workflow](#-smart-server-creation-workflow)
- [📱 Integration Examples](#-integration-examples)
  - [Using with Shell Scripts](#using-with-shell-scripts)
  - [Using with Python](#using-with-python)
- [⚠️ Error Handling](#️-error-handling)
  - [Common Error Patterns](#common-error-patterns)
  - [Error Recovery Strategies](#error-recovery-strategies)
- [🎯 Best Practices](#-best-practices)
- [🆘 Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### 1. Installation & Setup

```bash
# Clone and install
cd latitude-sh
npm install

# Configure environment
cp env.example .env.local
# Edit .env.local with your API key

# Build the project
npm run build
```

### 2. Basic Usage

```bash
# Run the MCP server (built)
npm run start

# Or run in dev mode
npm run dev
```

## 📁 Project Management Tools

### 1. `list_projects` - List All Projects

**Basic Usage:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_projects",
    "arguments": {}
  }
}
```

**Advanced Filtering:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_projects",
    "arguments": {
      "page[size]": 10,
      "page[number]": 1,
      "filter[environment]": "Development",
      "filter[tags]": "tag_1,tag_2",
      "extra_fields[projects]": "last_renewal_date,next_renewal_date"
    }
  }
}
```

**Response (API-like JSON in content[0].text):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"data\": [\n    { \"id\": \"proj_...\", \"type\": \"projects\", \"attributes\": { /* ... */ } }\n  ],\n  \"meta\": { \"total\": 10, \"page\": 1, \"limit\": 20 }\n}"
      }
    ]
  }
}
```

### 2. `get_project` - Get Project Details

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_project",
    "arguments": {
      "projectId": "proj_123456789"
    }
  }
}
```

### 3. `search_projects` - Search Projects

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_projects",
    "arguments": {
      "query": "machine learning",
      "limit": 5
    }
  }
}
```

### 4. `create_project` - Create New Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create_project",
    "arguments": {
      "name": "AI Development Project",
      "description": "Machine learning experiments and model training",
      "environment": "Development",
      "provisioning_type": "on_demand",

      "billing_method": "Normal",
      "tags": ["ai", "machine-learning", "python"]
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \n  \"data\": { \"id\": \"proj_...\", \"type\": \"projects\", \"attributes\": { /* ... */ } },\n  \"meta\": {}\n}"
      }
    ]
  }
}
```

### 5. `update_project` - Update Existing Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "update_project",
    "arguments": {
      "projectId": "my-project-id",
      "name": "Updated AI Project",
      "description": "Advanced ML experiments with GPU acceleration",
      "environment": "Production",
      "tags": ["ai", "gpu", "production"]
    }
  }
}
```

### 6. `delete_project` - Delete Project

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "delete_project",
    "arguments": {
      "projectId": "my-project-id",
      "confirm": true
    }
  }
}
```

## 🖥️ Server Management Tools

### 1. `list_servers` - List All Servers

**Basic Usage:**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "list_servers",
    "arguments": {
      "page[size]": 20,
      "status": "deploying"
    }
  }
}
```

**Advanced Filtering:**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "list_servers",
    "arguments": {
      "page[size]": 10,
      "page[number]": 1,
      "projectId": "my-project-id",
      "filter[region]": "NYC",
      "filter[plan]": "c2-small-x86",
      "filter[hostname]": "web-server"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \n  \"data\": [ { \"id\": \"sv_...\", \"type\": \"servers\", \"attributes\": { /* ... */ } } ],\n  \"meta\": { \"total\": 2, \"page\": 1, \"limit\": 20 }\n}"
      }
    ]
  }
}
```

### 2. `create_server` - Create New Server

**Basic Server Creation:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "create_server",
    "arguments": {
      "project": "my-project-id",
      "plan": "my-plan-id",
      "operating_system": "ubuntu_24_04_x64_lts",
      "hostname": "my-web-server",
      "site": "NYC"
    }
  }
}
```

**Advanced Server Creation:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "create_server",
    "arguments": {
      "project": "my-project-id",
      "plan": "my-plan-id",
      "operating_system": "ubuntu_24_04_x64_lts",
      "hostname": "production-api-server",
      "site": "NYC",
      "sshKeys": ["ssh_key_123", "ssh_key_456"],
      "tags": ["api", "production", "nodejs"],
      "userData": "IyEvYmluL2Jhc2gKYXB0LWdldCB1cGRhdGUKYXB0LWdldCBpbnN0YWxsIC15IG5vZGVqcw==",
      "startupScript": "systemctl enable nginx && systemctl start nginx"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \n  \"data\": { \"id\": \"sv_...\", \"type\": \"servers\", \"attributes\": { /* ... */ } },\n  \"meta\": {}\n}"
      }
    ]
  }
}
```

### 3. `get_server` - Get Server Details

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "get_server",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

### 4. `update_server` - Update Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "update_server",
    "arguments": {
      "serverId": "my-server-id",
      "hostname": "updated-web-server",
      "billing": "monthly",
      "tags": ["web", "production", "updated"],
      "project": "proj_newProject123"
    }
  }
}
```

### 5. `delete_server` - Delete Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "delete_server",
    "arguments": {
      "server_id": "my-server-id",
      "reason": "Server no longer needed",
      "confirm": true
    }
  }
}
```

## 🔒 Server Security Tools

### 1. `lock_server` - Lock a Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "method": "tools/call",
  "params": {
    "name": "lock_server",
    "arguments": { "serverId": "sv_VLMmAD8EOwop2" }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🔒 Server locked successfully\n\n🖥️ **Practical Linen Chair** (ID: sv_VLMmAD8EOwop2)\n..."
      }
    ]
  }
}
```

### 2. `unlock_server` - Unlock a Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "method": "tools/call",
  "params": {
    "name": "unlock_server",
    "arguments": { "serverId": "sv_VLMmAD8EOwop2" }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🔓 Server unlocked successfully\n\n🖥️ **Practical Linen Chair** (ID: sv_VLMmAD8EOwop2)\n..."
      }
    ]
  }
}
```

## 🔄 Server Operations Tools

### 1. `run_server_action` - Run Power Actions

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 18,
  "method": "tools/call",
  "params": {
    "name": "run_server_action",
    "arguments": {
      "serverId": "sv_123456789",
      "action": "power_off"
    }
  }
}
```

### 2. `enter_rescue_mode` - Enter Rescue Mode

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 19,
  "method": "tools/call",
  "params": {
    "name": "enter_rescue_mode",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

### 3. `exit_rescue_mode` - Exit Rescue Mode

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 20,
  "method": "tools/call",
  "params": {
    "name": "exit_rescue_mode",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

### 4. `server_reinstall` - Reinstall Server

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 25,
  "method": "tools/call",
  "params": {
    "name": "server_reinstall",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

### 5. `schedule_server_deletion` - Schedule Deletion

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 26,
  "method": "tools/call",
  "params": {
    "name": "schedule_server_deletion",
    "arguments": {
      "serverId": "sv_123456789",
      "deletion_date": "2024-07-25T10:00:00Z"
    }
  }
}
```

### 6. `unschedule_server_deletion` - Cancel Scheduled Deletion

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 27,
  "method": "tools/call",
  "params": {
    "name": "unschedule_server_deletion",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

## 🌐 Out of Band Access Tools

### 1. `start_out_of_band_connection` - Start OOB Connection

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 28,
  "method": "tools/call",
  "params": {
    "name": "start_out_of_band_connection",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

### 2. `list_out_of_band_connections` - List OOB Connections

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 29,
  "method": "tools/call",
  "params": {
    "name": "list_out_of_band_connections",
    "arguments": {}
  }
}
```

### 3. `generate_ipmi_credentials` - Generate IPMI Credentials

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 30,
  "method": "tools/call",
  "params": {
    "name": "generate_ipmi_credentials",
    "arguments": {
      "serverId": "sv_123456789"
    }
  }
}
```

## 📊 Plan and Region Tools

### 1. `list_plans` - List All Plans

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "tools/call",
  "params": {
    "name": "list_plans",
    "arguments": {}
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "💻 **Available Server Plans**\n\n🖥️ **c2.small.x86** (ID: plan_123)\n📊 Features: ssh, user_data\n💻 CPU: E-2234 @ 3.6GHz (4 cores)\n🧠 Memory: 32 GB\n💾 Storage: 1 X 500 GB SSD\n🌐 Network: 1 X 1 Gbit/s\n💰 Pricing: $0.18/hour, $92/month, $773/year\n🌍 Regions: 8 regions available\n   • Brazil: High stock (SAO, SAO2) - Instant deploy: ubuntu_24_04_x64_lts\n   • United States: Medium stock (NYC, CHI, MIA2) - Instant deploy: ubuntu_24_04_x64_lts\n   • Australia: Medium stock (SYD) - Instant deploy: ubuntu_24_04_x64_lts\n\n🖥️ **c2.medium.x86** (ID: plan_456)\n📊 Features: ssh, raid, user_data\n💻 CPU: E-2278G @ 3.4GHz (8 cores)\n🧠 Memory: 64 GB\n💾 Storage: 2 X 500 GB SSD\n🌐 Network: 1 X 10 Gbit/s\n💰 Pricing: $0.35/hour, $179/month, $1504/year\n🌍 Regions: 9 regions available\n   • Brazil: Low stock (SAO) - Instant deploy: ubuntu_22_04_x64_lts\n   • United States: Low stock (DAL, ASH) - Instant deploy: ubuntu_24_04_x64_lts, ubuntu_22_04_x64_lts\n\n---"
      }
    ]
  }
}
```

### 2. `get_plan` - Get Plan by ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 17,
  "method": "tools/call",
  "params": {
    "name": "get_plan",
    "arguments": { "planId": "plan_2X6KG5mA5yPBM" }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 17,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🧭 Plan c2.small.x86 (c2-small-x86)\nID: plan_2X6KG5mA5yPBM\nFeatures: ssh, user_data\nCPU: 1x E-2234 (4 cores @ 3.6GHz)\nMemory: 32GB\nDrives: 1x 500 GB SSD\nNICs: 1x 1 Gbps\nRegions:\n  - 🟢 Brazil\n     📍 In stock: SAO, SAO2\n     💵 USD: $0.18/hr, $92/mo, $773/yr\n     🇧🇷 BRL: R$0.9/hr, R$460/mo, R$3864/yr\n  - 🟡 United States\n     ⏳ Available: DAL, LAX, NYC, CHI, ASH, MIA2, LAX2\n     💵 USD: $0.18/hr, $92/mo, $773/yr\n     🇧🇷 BRL: R$0.9/hr, R$460/mo, R$3864/yr"
      }
    ]
  }
}
```

### 3. `list_regions` - List Global Regions

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "tools/call",
  "params": {
    "name": "list_regions",
    "arguments": {}
  }
}
```

### 4. `get_region` - Get Region by ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "method": "tools/call",
  "params": {
    "name": "get_region",
    "arguments": { "regionId": "loc_bEvjLaBg0oqyx" }
  }
}
```

## 🔧 Utility Tools

### 1. `test_connection` - Test API Connection

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "method": "tools/call",
  "params": {
    "name": "test_connection",
    "arguments": {}
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Successfully connected to latitude.sh API"
      }
    ]
  }
}
```

### 2. `get_server_deploy_config` - Retrieve Deploy Config

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 21,
  "method": "tools/call",
  "params": {
    "name": "get_server_deploy_config",
    "arguments": { "serverId": "sv_VLMmAD8EOwop2" }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 21,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🧩 Deploy Config for sv_VLMmAD8EOwop2\nSSH Keys: ssh_6059EqYkOQj8p\nUser Data: ud_zGr47qlMDAg0m\nRAID: raid-1\nOS: rhel8\nHostname: Solarbreeze\niPXE URL: -\nPartitions:\n  1. / - 300GB (ext4)"
      }
    ]
  }
}
```

### 3. `update_server_deploy_config` - Update Deploy Config

Updatable fields: hostname, operating_system, raid, user_data (integer or null), ssh_keys (array of integers), partitions (path, size_in_gb, filesystem_type), ipxe_url.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 22,
  "method": "tools/call",
  "params": {
    "name": "update_server_deploy_config",
    "arguments": {
      "serverId": "sv_VLMmAD8EOwop2",
      "hostname": "Solarbreeze",
      "operating_system": "rhel8",
      "raid": "raid-1",
      "user_data": 12345,
      "ssh_keys": [123, 456],
      "partitions": [
        { "path": "/", "size_in_gb": 300, "filesystem_type": "ext4" }
      ],
      "ipxe_url": null
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 22,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Deploy Config updated for sv_VLMmAD8EOwop2\nSSH Keys: 123, 456\nUser Data: 12345\nRAID: raid-1\nOS: rhel8\nHostname: Solarbreeze\niPXE URL: -\nPartitions:\n  1. / - 300GB (ext4)"
      }
    ]
  }
}
```

### 4. `list_operating_systems` - List Available Operating Systems

Lists all operating systems available to deploy and reinstall. Supports optional pagination parameters `page[size]` and `page[number]` as per the official API.

Reference: [List all operating systems available](https://docs.latitude.sh/reference/get-plans-operating-system)

**Request (no params):**

```json
{
  "jsonrpc": "2.0",
  "id": 101,
  "method": "tools/call",
  "params": { "name": "list_operating_systems", "arguments": {} }
}
```

**Request (with pagination):**

```json
{
  "jsonrpc": "2.0",
  "id": 102,
  "method": "tools/call",
  "params": {
    "name": "list_operating_systems",
    "arguments": { "page[size]": 20, "page[number]": 1 }
  }
}
```

**Response (API-like JSON in content[0].text):**

```json
{
  "data": [
    {
      "id": "os_...",
      "type": "operating_system",
      "attributes": {
        "name": "Ubuntu 24.04",
        "distro": "ubuntu",
        "slug": "ubuntu_24_04_x64_lts",
        "version": "24.04",
        "user": "ubuntu",
        "features": {
          "raid": true,
          "rescue": true,
          "ssh_keys": true,
          "user_data": true
        },
        "provisionable_on": ["c2.small.x86", "c2.medium.x86"]
      }
    }
  ],
  "meta": { "total": 20 }
}
```

## 🚀 Smart Server Creation Workflow

### Complete Example: Creating a Production Web Server

**Step 1: Get Creation Flow**

```json
{
  "name": "get_server_creation_flow",
  "arguments": {}
}
```

**Step 2: Validate Configuration**

```json
{
  "name": "validate_server_config",
  "arguments": {
    "project_id": "proj_123456789",
    "plan": "plan_2X6KG5mA5yPBM",
    "region": "NYC",
    "operating_system": "ubuntu_24_04_x64_lts"
  }
}
```

**Step 3: Create Server (if validation passes)**

```json
{
  "name": "create_server",
  "arguments": {
    "project": "proj_123456789",
    "plan": "plan_2X6KG5mA5yPBM",
    "operating_system": "ubuntu_24_04_x64_lts",
    "hostname": "production-web-01",
    "site": "NYC",
    "sshKeys": ["ssh_key_production"],
    "tags": ["web", "production", "nginx"],
    "userData": "IyEvYmluL2Jhc2gKYXB0LWdldCB1cGRhdGUgJiYgYXB0LWdldCBpbnN0YWxsIC15IG5naW54",
    "startupScript": "systemctl enable nginx && systemctl start nginx"
  }
}
```

## 🚀 Smart Server Creation Workflow

### Complete Example: Creating a Production Web Server

**Step 1: Get Creation Flow**

```json
{
  "name": "get_server_creation_flow",
  "arguments": {}
}
```

**Step 2: Validate Configuration**

```json
{
  "name": "validate_server_config",
  "arguments": {
    "project_id": "proj_123456789",
    "plan": "plan_2X6KG5mA5yPBM",
    "region": "NYC",
    "operating_system": "ubuntu_24_04_x64_lts"
  }
}
```

**Step 3: Create Server (if validation passes)**

```json
{
  "name": "create_server",
  "arguments": {
    "project": "proj_123456789",
    "plan": "plan_2X6KG5mA5yPBM",
    "operating_system": "ubuntu_24_04_x64_lts",
    "hostname": "production-web-01",
    "site": "NYC",

    "sshKeys": ["ssh_key_production"],
    "tags": ["web", "production", "nginx"],
    "userData": "IyEvYmluL2Jhc2gKYXB0LWdldCB1cGRhdGUgJiYgYXB0LWdldCBpbnN0YWxsIC15IG5naW54",
    "startupScript": "systemctl enable nginx && systemctl start nginx"
  }
}
```

## 📱 Integration Examples

### Using with Shell Scripts

**Create a simple server creation script:**

```bash
#!/bin/bash

# server-create.sh
PROJECT_ID="proj_123456789"
PLAN="c2-small-x86"
REGION="NYC"
HOSTNAME="test-server-$(date +%s)"

# First validate
echo "Validating configuration..."
VALIDATION=$(echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "validate_server_config",
    "arguments": {
      "project_id": "'$PROJECT_ID'",
      "plan": "'$PLAN'",
      "region": "'$REGION'",
      "operating_system": "ubuntu_24_04_x64_lts"
    }
  }
}' | node dist/index.js)

if echo "$VALIDATION" | grep -q "✅ Configuration is valid"; then
  echo "Configuration valid, creating server..."
  echo '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_server",
      "arguments": {
        "project": "'$PROJECT_ID'",
        "plan": "'$PLAN'",
        "operating_system": "ubuntu_24_04_x64_lts",
        "hostname": "'$HOSTNAME'",
        "site": "'$REGION'",

      }
    }
  }' | node dist/index.js
else
  echo "Configuration invalid:"
  echo "$VALIDATION"
fi
```

### Using with Python

**Python client example:**

```python
import json
import subprocess
import sys

def call_mcp_tool(tool_name, arguments):
    """Call an MCP tool and return the response"""
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

    process = subprocess.Popen(
        ["node", "dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout, stderr = process.communicate(json.dumps(request))
    return json.loads(stdout.split('\n')[-2])  # Get JSON response

# Example: List projects
response = call_mcp_tool("list_projects", {"page[size]": 5})
print(response["result"]["content"][0]["text"])

# Example: Validate server config
validation = call_mcp_tool("validate_server_config", {
    "project_id": "proj_123456789",
    "plan": "c2-small-x86",
    "region": "NYC",
    "operating_system": "ubuntu_24_04_x64_lts"
})

if "✅ Configuration is valid" in validation["result"]["content"][0]["text"]:
    # Create server
    server = call_mcp_tool("create_server", {
        "project": "proj_123456789",
        "plan": "c2-small-x86",
        "operating_system": "ubuntu_24_04_x64_lts",
        "hostname": "python-created-server",
        "site": "NYC",

    })
    print("Server created:", server["result"]["content"][0]["text"])
else:
    print("Configuration invalid:", validation["result"]["content"][0]["text"])
```

## ⚠️ Error Handling

### Common Error Patterns

**Invalid API Key:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Unauthorized: Invalid API key"
      }
    ],
    "isError": true
  }
}
```

**Resource Not Found:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Project not found"
      }
    ],
    "isError": true
  }
}
```

**Validation Error:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Invalid arguments for create_server: [\"project\" is required]"
      }
    ],
    "isError": true
  }
}
```

### Error Recovery Strategies

1. **Always validate first**: Use interactive scripts for guided server creation
2. **Check API connectivity**: Use `test_connection` if getting network errors
3. **Verify resource existence**: Use `get_project` or `get_server` to confirm resources exist
4. **Handle rate limits**: Implement exponential backoff for 429 responses
5. **Parse error messages**: Extract actionable information from error responses

## 🎯 Best Practices

### 1. Server Creation Workflow

```json
// 1. Always get the creation flow first
{"name": "get_server_creation_flow", "arguments": {}}

// 2. Validate your configuration
{"name": "validate_server_config", "arguments": {...}}

// 3. Only create if validation passes
{"name": "create_server", "arguments": {...}}
```

### 2. Server Security Workflow

```json
// 1. Lock server before maintenance
{"name": "lock_server", "arguments": {"serverId": "sv_123"}}

// 2. Perform operations (reinstall, rescue mode, etc.)
{"name": "server_reinstall", "arguments": {...}}

// 3. Unlock server when done
{"name": "unlock_server", "arguments": {"serverId": "sv_123"}}
```

### 3. Server Operations Workflow

```json
// 1. Check server status
{"name": "get_server", "arguments": {"serverId": "sv_123"}}

// 2. Perform power action
{"name": "run_server_action", "arguments": {"serverId": "sv_123", "action": "reboot"}}

// 3. Monitor status changes
{"name": "get_server", "arguments": {"serverId": "sv_123"}}
```

### 2. Resource Management

- Use pagination for large lists
- Filter results to reduce response size
- Cache plan and region information
- Always confirm destructive operations

### 3. Security

- Store API keys in environment variables
- Use least-privilege API keys
- Regularly rotate API keys
- Monitor API usage
- Lock servers before maintenance operations
- Use OOB access for emergency situations
- Implement proper access controls for IPMI

### 4. Performance

- Use specific filters instead of fetching all results
- Implement client-side caching for static data
- Use appropriate page sizes (10-50 items)
- Handle rate limits gracefully

## 🆘 Troubleshooting

### Connection Issues

```bash
# Test API connectivity
curl -H "Authorization: Bearer your-api-key" https://api.latitude.sh/user/profile

# Test MCP server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"test_connection","arguments":{}}}' | npm run start --silent
```

### Server Creation Failures

1. **Use validation first**: Always validate configuration before creation
2. **Check project type**: Ensure project is on-demand
3. **Verify region availability**: Use `list_regions` and `get_plan`
4. **Check plan availability**: Use `list_plans`
5. **Validate hostname uniqueness**: Ensure hostname is unique

### Server Operations Issues

1. **Power actions failing**: Check if server is locked using `get_server`
2. **Rescue mode issues**: Ensure server is not in a transitional state
3. **Reinstall failures**: Verify OS compatibility with server plan
4. **OOB connection problems**: Check if server supports OOB access
5. **IPMI access issues**: Verify server has IPMI capabilities

### Debug Mode

```bash
# Run with debug output
NODE_ENV=development node dist/index.js 2>&1 | tee debug.log
```

Note: By default, example responses show the exact API-like JSON returned inside `content[0].text`. Many utility scripts in `latitude-sh` print the full JSON response and then a readable summary.

This comprehensive guide covers all available tools and their usage patterns. For additional help, use the `get_server_creation_flow` tool to get real-time guidance for server creation workflows.
