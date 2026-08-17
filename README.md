<p align="center">
  <img src="icon.svg" alt="Garage Logo" width="21%">
</p>

# Garage on StartOS

> Everything not listed in this document should behave the same as upstream
> Garage. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Garage](https://git.deuxfleurs.fr/Deuxfleurs/garage) is an S3-compatible object store designed to run distributed across several machines. This package runs it as a **single node**: install bootstraps the cluster layout for you, and buckets and API keys are managed through StartOS actions rather than a shell.

- **Upstream repo:** <https://git.deuxfleurs.fr/Deuxfleurs/garage>
- **Wrapper repo:** <https://github.com/Start9Labs/garage-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream image is used unmodified, and one subcontainer runs the service.

| Property      | Value                                                          |
| ------------- | -------------------------------------------------------------- |
| Image         | `dxflrs/garage`                                                |
| Architectures | x86_64, aarch64                                                |
| Command       | `garage server`                                                |
| Subcontainer  | `garage-sub` — the `garage` daemon, and the one to `attach` to |

Two further subcontainers exist from the same image: `garage-init-sub`, which runs once during install, and `garage-action-sub`, which every action spins up to run Garage's CLI.

## Volume and Data Layout

One volume, and the layout includes two files that are not Garage's.

| Volume | Mount Point | Purpose                                                                                    |
| ------ | ----------- | ------------------------------------------------------------------------------------------ |
| `main` | `/data`     | `garage.toml`, the LMDB metadata database (`metadata/`), and the object blocks (`blocks/`) |

The volume additionally supplies `/etc/passwd` and `/etc/group` as **individual read-only file mounts**, written by init. The upstream image is built from scratch and ships neither, which Garage needs in order to resolve the user it runs as.

## File Models

Three models. One is Garage's configuration; the other two are the account files just described.

| File          | Format | Modelled                  | Written by                                            |
| ------------- | ------ | ------------------------- | ----------------------------------------------------- |
| `garage.toml` | TOML   | Yes — `FileHelper.toml`   | Install, every init, and the Reset Admin Token action |
| `passwd`      | text   | Yes — `FileHelper.string` | Every init, unconditionally                           |
| `group`       | text   | Yes — `FileHelper.string` | Every init, unconditionally                           |

### garage.toml

**Enforced** — rewritten to a fixed value whenever the package writes the file: the metadata and data directories, the database engine, both bind addresses for S3 and the admin API, the S3 web bind address, the S3 region and root domains, and the RPC bind address.

Two enforced values are worth naming because they encode the single-node decision: **`replication_factor` is pinned to 1 and `consistency_mode` to consistent.** Garage's distributed replication has nothing to replicate to here, and raising the factor on a one-node cluster would leave writes unable to satisfy their quorum.

**Generated at install:** `rpc_secret`, a 64-character hex value. It is what cluster members would authenticate to each other with.

**Yours:** `compression_level`, and `admin_token` through its action.

### passwd and group

Both are rewritten on **every** init, not seeded once — they are a fixed pair of minimal account files, and a hand edit is replaced at the next init, update, or restore.

## Dependencies

None. Other services use Garage as an S3 backend by pointing at its API address and a key you create here.

## Network Access and Interfaces

Three interfaces, each on its own host so they can be exposed independently.

| Interface      | Id      | Type | Port | Description                          |
| -------------- | ------- | ---- | ---- | ------------------------------------ |
| S3 API         | `s3`    | api  | 3900 | The S3-compatible object storage API |
| S3 Web Hosting | `web`   | api  | 3902 | Serves static sites out of buckets   |
| Admin API      | `admin` | api  | 3903 | Garage's administration API          |

The RPC port used between cluster members is bound inside the container but exported as no interface, because this is a single-node deployment.

**The admin API is protected only by its token.** Exposing that interface beyond the LAN hands full administrative control to anyone holding the token, so treat it accordingly — it is a separate host precisely so it can be left unexposed while the S3 API is not.

## Installation and First-Run Flow

Install does more here than in most packages, because a Garage cluster is not usable until it has a layout — and a single-node cluster still needs one.

1. **`passwd` and `group` are written**, since the image has neither.
2. **`rpc_secret` is generated** into `garage.toml`.
3. **The cluster is bootstrapped.** Garage is started in a temporary subcontainer, its node id read, a layout assigned to it in a single zone, and that layout applied. This is reported as an install progress phase and is bounded at five minutes; if it does not succeed, init fails and StartOS rolls the install back.
4. **A `critical` task is raised** pointing at Set Admin Token — see [Tasks](#tasks).

After that, the working order is: create an API key, create a bucket, then grant the key access to the bucket. A key with no grant can authenticate but sees nothing.

## Actions

Nine actions. All but one require the service to be running, since they drive Garage's own CLI against a live node.

### Set / Reset Admin Token

Generates the token the admin API authenticates with. The action renames itself — "Set Admin Token" when none exists, "Reset Admin Token" afterwards — so it reads correctly both as the install task and as a rotation later.

- **What it changes:** `admin_token` in `garage.toml`.
- **Availability:** running or stopped, unlike the rest.
- **Repeat safety:** safe to re-run, but **it invalidates the current token**; anything using the admin API must be updated.
- **Outputs:** the token, masked and copyable, shown once.

### Create Bucket, List Buckets, Delete Bucket

**Create Bucket** makes an empty bucket and returns its id, object count, and size.

**List Buckets** reports every bucket with its id, object count, size, and the keys authorized against it — the quickest way to see whether a key has been granted access.

**Delete Bucket** removes one or more buckets, selected from a live list. It is **destructive and not reversible**: the bucket and everything in it go. If some deletions fail it reports a partial result naming which, rather than failing the whole run.

### Create API Key, List API Keys, Delete API Key

**Create API Key** issues an S3 access key and secret. The secret is shown once.

**List API Keys** reports the keys that exist.

**Delete API Key** revokes one or more, selected from a live list. Anything authenticating with a deleted key stops working immediately.

### Grant Bucket Access to Key

Grants a key read, write, and/or owner permission on a bucket. At least one permission must be selected; the action refuses an empty grant rather than silently doing nothing.

This is the step that connects the two halves — a key and a bucket created separately have no relationship until it runs.

### Cluster Status

Read-only: the node's view of the cluster, its layout, and its health.

## Tasks

One task, raised at install, and it blocks the service until you clear it.

| Task            | Severity   | Raised when                          | Cleared when    |
| --------------- | ---------- | ------------------------------------ | --------------- |
| Set Admin Token | `critical` | At init, while no admin token is set | The action runs |

`critical` because the admin API would otherwise be reachable with no token configured at all. It is raised by a condition rather than unconditionally, so a restored install that already has a token does not see it.

## Health Checks

One check, on the daemon.

| Check             | Method                                   | Grace Period |
| ----------------- | ---------------------------------------- | ------------ |
| `garage` "Garage" | HTTP `GET /health` on the admin API port | SDK default  |

It probes Garage's own health endpoint rather than only the port, so a pass means the node considers itself operational — including its layout. A failure after a period of running points at the daemon or its storage; the service logs name it.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** every stored object, the metadata database, the cluster layout, `garage.toml` with the RPC secret and admin token, and the account files.
- **Restore:** complete, and no re-bootstrap happens — the layout is part of the backup, so the install-time bootstrap does not run again and the admin-token task is not raised. Buckets, keys, and grants all come back.

The size implication is direct: the backup contains every object stored in every bucket.

## Limitations and Differences

1. **Single node.** The replication factor is pinned to 1 and no RPC interface is exported; this package does not join or form a multi-node cluster.
2. **Buckets and keys are managed through actions**, not through a web console — Garage ships none.
3. **A key and a bucket are unrelated until granted.** Creating both is not enough to use them together.
4. **The admin API's only protection is its token.** Exposing that interface publicly exposes administrative control.
5. **Deleting a bucket destroys its contents**, and deleting a key immediately breaks anything using it. Neither is reversible.
6. **`passwd` and `group` are package-supplied and rewritten every init**, because the upstream image ships neither.
7. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: garage
image: dxflrs/garage
architectures:
  - x86_64
  - aarch64
subcontainers:
  - garage-sub # the running daemon
  - garage-init-sub # install only; bootstraps the cluster layout
  - garage-action-sub # temporary; every action's CLI
volumes:
  main: /data
file_models:
  - /data/garage.toml
  - /data/passwd # mounted read-only at /etc/passwd
  - /data/group # mounted read-only at /etc/group
startos_managed_env_vars:
  - GARAGE_CONFIG_FILE
dependencies: []
interfaces:
  s3: { type: api, port: 3900 }
  web: { type: api, port: 3902 }
  admin: { type: api, port: 3903 }
actions:
  - reset-admin-token # renames itself to "Set Admin Token" when unset
  - cluster-status
  - create-bucket
  - list-buckets
  - delete-bucket
  - create-api-key
  - list-api-keys
  - delete-api-key
  - grant-bucket-to-key
tasks:
  - { action: reset-admin-token, severity: critical }
health_checks:
  - garage # displayed "Garage"; probes the admin API's /health
```
