# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `garage`.** Runs a single-node Garage cluster. Three network interfaces are exported via `sdk.MultiHost` in `startos/interfaces.ts`: `s3` (S3 API, port 3900), `web` (S3 static-website hosting, port 3902), and `admin` (Admin API, port 3903).
- **Install bootstraps the cluster layout.** `startos/init/initializeService.ts` spins a temporary `garage-init-sub` daemon chain via `runUntilSuccess` to assign and apply the single-node layout, surfaced as an install progress phase. Config lives in `garage.toml` on the `main` volume; the RPC secret and admin token are generated (the admin token via the **Reset/Set Admin Token** action).
- **Subcontainer names differ by call site:** the main daemon uses `garage-sub` (`main.ts`), the install bootstrap uses `garage-init-sub`, and actions run their CLI commands in `garage-action-sub` via the `createGarageSub(effects)` helper in `startos/actions/utils.ts`.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach garage -n garage-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `garage-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
