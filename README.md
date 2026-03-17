<p align="center">
  <img src="icon.svg" alt="Garage Logo" width="21%">
</p>

# Garage on StartOS

> **Upstream repo:** <https://git.deuxfleurs.fr/Deuxfleurs/garage>

An S3-compatible distributed object storage service for StartOS, powered by [Garage](https://garagehq.deuxfleurs.fr/). Garage provides a lightweight, self-hosted alternative to Amazon S3 for storing files, backups, and application data.

---

## Container Runtime

| Property      | Value                  |
| ------------- | ---------------------- |
| Image         | `dxflrs/garage:v2.2.0` |
| Architectures | x86_64, aarch64        |
| Entrypoint    | `/garage server`       |

## Volumes

| Volume | Mount Point | Purpose                              |
| ------ | ----------- | ------------------------------------ |
| `main` | `/data`     | Persistent data and metadata storage |

## Network Interfaces

| Interface | Port | Protocol | Purpose                          |
| --------- | ---- | -------- | -------------------------------- |
| S3 API    | 3900 | HTTP     | S3-compatible object storage API |
| Admin API | 3903 | HTTP     | Garage administration API        |

## Actions

| Action                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| Reset Admin Token          | Generate a new admin API token              |
| Create Bucket              | Create a new S3 bucket                      |
| Create API Key             | Create a new S3 API key pair                |
| List Buckets               | List all S3 buckets with authorized keys    |
| List API Keys              | List all S3 API keys with bucket access     |
| Delete Bucket              | Delete an S3 bucket by name                 |
| Delete API Key             | Delete an S3 API key by its key ID          |
| Grant Bucket Access to Key | Allow a specific API key to access a bucket |

## Dependencies

None.

## Backups

The `main` volume is backed up.

## Health Checks

| Check     | Method                | Messages                        |
| --------- | --------------------- | ------------------------------- |
| S3 API    | Port listening (3900) | Ready: "The S3 API is ready"    |
| Admin API | Port listening (3903) | Ready: "The Admin API is ready" |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: garage
upstream_version: 2.2.0
image: dxflrs/garage:v2.2.0
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  s3_api: 3900
  admin_api: 3903
dependencies: none
actions:
  - reset-admin-token
  - create-bucket
  - create-api-key
  - list-buckets
  - list-api-keys
  - delete-bucket
  - delete-api-key
  - grant-bucket-to-key
health_checks:
  - port_listening: 3900
  - port_listening: 3903
backup_volumes:
  - main
```
