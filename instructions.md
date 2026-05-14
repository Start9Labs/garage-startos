# Garage

## Documentation

- [Garage book](https://git.deuxfleurs.fr/Deuxfleurs/garage/src/branch/main-v2/doc/book) — the upstream documentation covering S3 API usage, layout, and client configuration.

## What you get on StartOS

- An **S3 API Interface** at port `3900` that any S3-compatible client (AWS CLI, `s3cmd`, `rclone`, MinIO Client, etc.) can point at.
- An **S3 Web Hosting** interface at port `3902` that serves static websites out of your buckets.
- An **Admin API** interface at port `3903` for programmatic administration with the admin token.
- A single-node Garage cluster: the layout, RPC secret, and replication settings are managed for you. You do not configure a database or bind addresses.

## Getting set up

After install Garage posts a critical task asking you to set an admin API token.

1. Run the **Set Admin Token** task. A fresh token is generated and shown once — copy it into a password manager before dismissing. You can regenerate it later with the **Reset Admin Token** action.
2. Start Garage.
3. Run **Create API Key** to mint an S3 access key / secret key pair, and **Create Bucket** to create your first bucket.
4. Run **Grant Bucket Access to Keys** to authorise the key against the bucket (with read, write, and/or owner permissions).
5. Point your S3 client at the **S3 API Interface** address using those credentials. The S3 region is `garage`.

## Using Garage

### S3 client access

The **S3 API Interface** is the endpoint your S3 client connects to. Use the access key ID and secret key from **Create API Key** as the credentials and `garage` as the region. The Admin API uses the admin token from setup as a bearer credential.

### Static website hosting

Buckets configured for website hosting are served on the **S3 Web Hosting** interface. See the upstream book for the bucket configuration required to enable website mode.

### Actions

- **Reset Admin Token** — generate a new admin API token, invalidating the previous one. Use it to rotate the token or recover if you've lost it.
- **Cluster Status** — show the healthy/unhealthy nodes in the cluster with their IDs, addresses, and roles.
- **Create Bucket**, **List Buckets**, **Delete Bucket** — manage S3 buckets. Bucket names must be lowercase, 1–63 characters, with hyphens or dots allowed.
- **Create API Key**, **List API Keys**, **Delete API Key** — manage S3 access key / secret key pairs. The secret is shown once at creation; save it then.
- **Grant Bucket Access to Keys** — authorise one or more API keys against a bucket. Pick the bucket, pick the keys, and toggle read / write / owner.

## Limitations

Garage runs on StartOS as a **single-node cluster**: replication factor is fixed at 1, and multi-node clusters are not supported. The S3 region is fixed at `garage` and the bind addresses, database engine (LMDB), and consistency mode are not configurable.
