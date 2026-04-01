<p align="center">
  <img src="icon.svg" alt="Garage Logo" width="21%">
</p>

# Garage on StartOS

> **Upstream docs:** <https://garagehq.deuxfleurs.fr/documentation/>
>
> Everything not listed in this document should behave the same as upstream
> Garage. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[Garage](https://git.deuxfleurs.fr/Deuxfleurs/garage) is a lightweight, S3-compatible distributed object storage service. On StartOS it runs as a single-node cluster for self-hosted file storage, backups, and application data.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                            |
| ------------- | -------------------------------- |
| Image         | `dxflrs/garage` (upstream)       |
| Architectures | x86_64, aarch64                  |
| Command       | `/garage server`                 |
| Config env    | `GARAGE_CONFIG_FILE=/data/garage.toml` |

---

## Volume and Data Layout

| Volume | Mount Point | Purpose                              |
| ------ | ----------- | ------------------------------------ |
| `main` | `/data`     | Metadata, block storage, and config  |

**Key paths on the `main` volume:**

- `garage.toml` — main configuration file (TOML format, managed by StartOS)
- `metadata/` — LMDB metadata database
- `blocks/` — object block storage
- `passwd` — mounted as `/etc/passwd` (read-only)
- `group` — mounted as `/etc/group` (read-only)

---

## Installation and First-Run Flow

On first install, StartOS automatically:

1. Generates a random 64-character hex `rpc_secret`
2. Starts Garage temporarily to bootstrap the cluster layout (assigns the single node with a 1GB capacity zone)
3. Applies the layout and shuts down
4. Creates a critical task prompting the user to set an admin API token

After install, run the "Set Admin Token" action to get your admin API token.

---

## Configuration Management

| StartOS-Managed (fixed)              | Upstream Default                  |
| ------------------------------------ | --------------------------------- |
| `metadata_dir` = `/data/metadata`    | Configurable                      |
| `data_dir` = `/data/blocks`          | Configurable                      |
| `db_engine` = `lmdb`                 | Configurable                      |
| `replication_factor` = `1`           | Configurable                      |
| `consistency_mode` = `consistent`    | Configurable                      |
| `rpc_bind_addr` = `0.0.0.0:3901`    | Configurable                      |
| `s3_api.api_bind_addr` = `0.0.0.0:3900` | Configurable                  |
| `s3_api.s3_region` = `garage`        | Configurable                      |
| `s3_web.bind_addr` = `0.0.0.0:3902` | Configurable                      |
| `admin.api_bind_addr` = `0.0.0.0:3903` | Configurable                   |
| Admin token                          | Via "Reset Admin Token" action    |

**Not configurable on StartOS:** replication factor, consistency mode, database engine, bind addresses, S3 region.

---

## Network Access and Interfaces

| Interface      | Port | Protocol | Purpose                                |
| -------------- | ---- | -------- | -------------------------------------- |
| S3 API         | 3900 | HTTP     | S3-compatible object storage API       |
| S3 Web Hosting | 3902 | HTTP     | Serves static websites from S3 buckets |
| Admin API      | 3903 | HTTP     | Garage administration API              |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

### Reset Admin Token

| Property     | Value |
|--------------|-------|
| ID           | `reset-admin-token` |
| Visibility   | Enabled |
| Availability | Any status |
| Group        | — |
| Purpose      | Generate a new admin API token |

**Output:** Displays the new admin token (masked, copyable). Name changes to "Set Admin Token" if no token exists yet.

### Cluster Status

| Property     | Value |
|--------------|-------|
| ID           | `cluster-status` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | — |
| Purpose      | Show healthy/unhealthy nodes with IDs, addresses, and roles |

### Create Bucket

| Property     | Value |
|--------------|-------|
| ID           | `create-bucket` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | Buckets |
| Purpose      | Create a new S3 bucket |

**Inputs:** Bucket name (lowercase, hyphens, 1–63 chars).
**Output:** Bucket name, ID, object count, size.

### Delete Bucket

| Property     | Value |
|--------------|-------|
| ID           | `delete-bucket` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | Buckets |
| Purpose      | Delete one or more S3 buckets |

**Inputs:** Multi-select from existing buckets.

### List Buckets

| Property     | Value |
|--------------|-------|
| ID           | `list-buckets` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | Buckets |
| Purpose      | List all buckets with authorized keys |

### Create API Key

| Property     | Value |
|--------------|-------|
| ID           | `create-api-key` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | API Keys |
| Purpose      | Create a new S3 API key pair |

**Inputs:** Key name (1–128 chars).
**Output:** Access key ID and secret access key (masked, copyable).

### Delete API Key

| Property     | Value |
|--------------|-------|
| ID           | `delete-api-key` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | API Keys |
| Purpose      | Delete one or more API keys |

**Inputs:** Multi-select from existing keys.

### List API Keys

| Property     | Value |
|--------------|-------|
| ID           | `list-api-keys` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | API Keys |
| Purpose      | List all API keys with bucket access and permissions |

### Grant Bucket Access to Key

| Property     | Value |
|--------------|-------|
| ID           | `grant-bucket-to-key` |
| Visibility   | Enabled |
| Availability | Only when running |
| Group        | Keys |
| Purpose      | Grant an API key access to a bucket |

**Inputs:** Bucket (select), API keys (multi-select), read (default: on), write (default: on), owner (default: off).

---

## Backups and Restore

**Included in backup:**

- `main` volume — all metadata, block storage, and configuration

**Restore behavior:**

- All buckets, keys, and data are restored
- Admin token and cluster layout are preserved

---

## Health Checks

| Check  | Method                                 | Messages                                   |
| ------ | -------------------------------------- | ------------------------------------------ |
| Garage | HTTP GET `http://127.0.0.1:3903/health` | Success: "Garage is healthy" / Error: "Garage is not healthy" |

---

## Dependencies

None. Garage is a standalone application.

---

## Limitations and Differences

1. **Single-node only** — replication factor is fixed at 1; multi-node clusters are not supported
2. **Fixed database engine** — always uses LMDB; cannot switch to SQLite or other engines
3. **Fixed S3 region** — always `garage`; cannot be changed
4. **No configurable bind addresses** — all ports are fixed
5. **No consistency mode selection** — always `consistent`

---

## What Is Unchanged from Upstream

- Full S3 API compatibility (GET, PUT, DELETE, multipart uploads, etc.)
- Bucket and key management via CLI/API
- S3 website hosting
- Admin API
- LMDB metadata engine performance characteristics
- All client compatibility (AWS CLI, s3cmd, rclone, MinIO Client, etc.)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: garage
image: dxflrs/garage
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  s3_api: 3900
  s3_web: 3902
  admin_api: 3903
dependencies: none
startos_managed_env_vars:
  - GARAGE_CONFIG_FILE
actions:
  - reset-admin-token
  - cluster-status
  - create-bucket
  - delete-bucket
  - list-buckets
  - create-api-key
  - delete-api-key
  - list-api-keys
  - grant-bucket-to-key
```
