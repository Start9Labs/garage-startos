# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`passwd` and `group` are mounted as individual read-only files, and written on every init.** The upstream image is built from scratch and ships neither, so Garage cannot resolve its own user without them. Don't move them into the volume root's ordinary contents or seed them install-only.
- **`replication_factor` stays 1 and no RPC interface is exported.** This is a single-node deployment; raising the factor leaves writes unable to satisfy a quorum against a cluster of one.
- **The `garage bucket list` / `key list` parsers split on two-or-more spaces and validate the id column.** They are parsing human-readable CLI output, so an upstream format change breaks them silently. Re-check both after a version bump.
