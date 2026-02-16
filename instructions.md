<p align="center">
  <img src="icon.png" alt="Garage Logo" width="21%">
</p>

# Garage on StartOS

[Garage](https://garagehq.deuxfleurs.fr/) is an S3-compatible distributed object storage service for StartOS. It provides alightweight, self-hosted alternative to Amazon S3 for storing files, backups, and application data.

---

## ALERTS

- This wrapper for StartOS is in early ALPHA testing.  Do not use with any critical important information or data
- Garage supports storage clusters with multiple nodes.  This implementation supports only a single node.
- Garage does not implement the full span of API endpoints that AWS S3 does; the exact list of S3 features implemented by Garage can be found on the [S3 compatibility page](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/).

## Configuring Garage in StartOS
When you first install, you are required to run the actionn to get the admin API token. Once that completes you can start the service.

Additional actions exist to Create / List / Delete Buckets and API keys and also to grant bucket access to specific keys.

## Accessing Garage from an S3 client
To access you will need to provide:
- The ENDPOINT_URL.  This will be displayed on your service dashboard addresses under URL.  It will look like:
-- https://noun-adjective:49195
-- https://192.168.1.34:49195
- The API key.  This will be 26 hexadecimal characters starting with GK
- The API secret. This will be 64 hexadecimal characters
- The bucket name.  This will be whatever you name your bucket.
- The default region. This is currently "garage"

## Support
Please enter any issues or enhancement requests at [https://github.com/JesseMarkowitz/garage-startos/issues](https://github.com/JesseMarkowitz/garage-startos/issues)

#   AWS_SECRET_ACCESS_KEY="..." \
#   S3_BUCKET="my-test-bucket" \ Before launching the UI, you can configure key system settings directly from the StartOS service page. Go to Actions and then Configure Mattermost Options to adjust the following:

Site URL – Enter the URL that Mattermost should use to generate links (e.g., for email notifications or chat links).
Server Timezone – Set the server's local time for accurate logs and timestamps.
Enable Plugin Uploads – Toggle this option to allow the installation of custom plugins within the System Console.
Telemetry – Configure the three telemetry settings to control whether usage data is reported to Mattermost.  


 | Property | Value |
|----------|-------|
| Image | `dxflrs/garage:v2.2.0` |
| Architectures | x86_64, aarch64 |
| Entrypoint | `/garage server` |

## Volumes

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `main` | `/data` | Persistent data and metadata storage |

## Network Interfaces

| Interface | Port | Protocol | Purpose |
|-----------|------|----------|---------|
| S3 API | 3900 | HTTP | S3-compatible object storage API |
| Admin API | 3903 | HTTP | Garage administration API |

## Actions

| Action | Description |
|--------|-------------|
| Get Admin Token | Retrieve the admin API token |
| Create Bucket | Create a new S3 bucket |
| Create API Key | Create a new S3 API key pair |
| List Buckets | List all S3 buckets with authorized keys |
| List API Keys | List all S3 API keys with bucket access |
| Delete Bucket | Delete an S3 bucket by name |
| Delete API Key | Delete an S3 API key by its key ID |
| Grant Key Access to Bucket | Grant an API key read/write access to a bucket |
| Grant Bucket Access to Key | Allow a specific API key to access a bucket |

## Dependencies

None.

## Backups

The `main` volume is backed up.

## Health Checks

| Check | Method | Messages |
|-------|--------|----------|
| S3 API | Port listening (3900) | Ready: "The S3 API is ready" |
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
  - get-admin-token
  - create-bucket
  - create-api-key
  - list-buckets
  - list-api-keys
  - delete-bucket
  - delete-api-key
  - grant-key-to-bucket
  - grant-bucket-to-key
health_checks:
  - port_listening: 3900
  - port_listening: 3903
backup_volumes:
  - main
```
