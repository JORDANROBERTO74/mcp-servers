# Latitude.sh MCP Server - Usage Guide

This comprehensive guide shows you how to use the Latitude.sh MCP server with practical examples for all available tools.

## Table of Contents

- [🚀 Quick Start](#-quick-start)
  - [1. Installation & Setup](#1-installation--setup)
  - [2. Basic Usage](#2-basic-usage)
- [📁 Project Management Tools](#-project-management-tools)
  - [1. list_projects](#1-list_projects---list-all-projects)
  - [2. get_project](#2-get_project---get-project-details)
  - [3. search_projects](#3-search_projects---search-projects)
  - [4. create_project](#4-create_project---create-new-project)
  - [5. update_project](#5-update_project---update-existing-project)
  - [6. delete_project](#6-delete_project---delete-project)
- [🖥️ Server Management Tools](#️-server-management-tools)
  - [1. list_servers](#1-list_servers---list-all-servers)
  - [2. create_server](#2-create_server---create-new-server)
  - [3. get_server](#3-get_server---get-server-details)
  - [4. update_server](#4-update_server---update-server)
  - [5. delete_server](#5-delete_server---delete-server)
- [🧠 Smart Server Creation Tools](#-smart-server-creation-tools)
  - [1. get_server_creation_flow](#1-get_server_creation_flow---get-creation-workflow)
  - [2. validate_server_config](#2-validate_server_config---validate-configuration)
- [📊 Plan and Region Tools](#-plan-and-region-tools)
  - [1. get_available_plans](#1-get_available_plans---list-all-plans)
  - [2. get_available_regions](#2-get_available_regions---get-regions-for-plan)
  - [3. get_plan](#3-get_plan---get-plan-by-id)
  - [4. list_regions](#4-list_regions---list-global-regions)
  - [5. get_region](#5-get_region---get-region-by-id)
- [🔧 Utility Tools](#-utility-tools)
  - [1. test_connection](#1-test_connection---test-api-connection)
  - [2. get_server_deploy_config](#2-get_server_deploy_config---retrieve-deploy-config)
  - [3. update_server_deploy_config](#3-update_server_deploy_config---update-deploy-config)
  - [4. lock_server](#4-lock_server---lock-a-server)
  - [5. unlock_server](#5-unlock_server---unlock-a-server)
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

### 7. `delete_project` - Delete Project

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

## 🧠 Smart Server Creation Tools

### 1. `get_server_creation_flow` - Get Creation Workflow

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "get_server_creation_flow",
    "arguments": {}
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \n  \"data\": { \n    \"projects_on_demand\": [ /* ... */ ],\n    \"plans\": [ /* ... */ ],\n    \"popular_plan_slugs\": [ \"c2-small-x86\", \"c2-medium-x86\", \"c3-small-x86\", \"m3-large-x86\" ]\n  },\n  \"meta\": { \"total_on_demand_projects\": 5, \"total_plans\": 21 }\n}"
      }
    ]
  }
}
```

### 2. `validate_server_config` - Validate Configuration

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "tools/call",
  "params": {
    "name": "validate_server_config",
    "arguments": {
      "project_id": "my-project-id",
      "plan": "my-plan-id",
      "region": "NYC",
      "operating_system": "ubuntu_24_04_x64_lts"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🔍 **SERVER CONFIGURATION VALIDATION**\n\n📁 **PROJECT VALIDATION**\n✅ Project AI Development Project is valid (on-demand)\n\n💻 **PLAN VALIDATION**\n✅ Plan c2.small.x86 is available\n   CPU: 4 cores E-2234\n   Memory: 32GB\n\n🌍 **REGION VALIDATION**\n✅ Region 'NYC' is in stock\n\n🖥️ **OPERATING SYSTEM VALIDATION**\n✅ Operating system 'ubuntu_24_04_x64_lts' is supported\n\n📋 **VALIDATION SUMMARY**\n✅ Configuration is valid and ready for server creation"
      }
    ]
  }
}
```

**Error Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🔍 **SERVER CONFIGURATION VALIDATION**\n\n📁 **PROJECT VALIDATION**\n❌ Project is 'reserved', must be 'on_demand'\n\n💻 **PLAN VALIDATION**\n❌ Plan 'invalid-plan' not found\n\n🌍 **REGION VALIDATION**\n❌ Region 'INVALID' not available for plan 'plan_2X6KG5mA5yPBM'\n\n📋 **VALIDATION SUMMARY**\n❌ Configuration has 3 issue(s) that must be fixed\n   • Project is not on-demand\n   • Plan not found\n   • Region not available for this plan\n\n💡 **SUGGESTIONS**\n   • Use 'get_server_creation_flow' to see available options\n   • Use 'list_projects' to find on-demand projects\n   • Use 'get_available_plans' to see all plans"
      }
    ]
  }
}
```

## 📊 Plan and Region Tools

### 1. `get_available_plans` - List All Plans

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "tools/call",
  "params": {
    "name": "get_available_plans",
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

### 2. `get_available_regions` - Get Regions for Plan

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "tools/call",
  "params": {
    "name": "get_available_regions",
    "arguments": {
      "plan": "my-plan-id"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🌍 Available Regions for plan plan_2X6KG5mA5yPBM:\n\n1. 🟡 United States\n   📍 In stock:  \n   ⏳ Available: DAL, LAX, NYC, CHI, ASH, MIA2, LAX2\n   💵 USD: $0.04/min, $2.4/hr, $92/mo, $773/yr\n   🇧🇷 BRL: R$0.2/min, R$12/hr, R$460/mo, R$3864/yr\n---"
      }
    ]
  }
}
```

### 3. `get_plan` - Get Plan by ID

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

### 4. `list_regions` - List Global Regions

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

### 5. `get_region` - Get Region by ID

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

### 4. `lock_server` - Lock a Server

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

### 5. `unlock_server` - Unlock a Server

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

1. **Always validate first**: Use `validate_server_config` before `create_server`
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
3. **Verify region availability**: Use `get_available_regions`
4. **Check plan availability**: Use `get_available_plans`
5. **Validate hostname uniqueness**: Ensure hostname is unique

### Debug Mode

```bash
# Run with debug output
NODE_ENV=development node dist/index.js 2>&1 | tee debug.log
```

Note: By default, example responses show the exact API-like JSON returned inside `content[0].text`. Many utility scripts in `latitude-sh` print the full JSON response and then a readable summary.

This comprehensive guide covers all available tools and their usage patterns. For additional help, use the `get_server_creation_flow` tool to get real-time guidance for server creation workflows.
