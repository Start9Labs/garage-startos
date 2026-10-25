# Updating the upstream version

Garage's source lives on Deuxfleurs' self-hosted Gitea (not GitHub); the release image is published to Docker Hub as `dxflrs/garage`.

## Determining the upstream version

- **Garage** ([git.deuxfleurs.fr/Deuxfleurs/garage](https://git.deuxfleurs.fr/Deuxfleurs/garage)) — canonical source of truth for the latest release tag:

  ```sh
  curl -fsSL "https://git.deuxfleurs.fr/api/v1/repos/Deuxfleurs/garage/tags?limit=100" | jq -r '.[].name | select(test("^v[0-9]+\\.[0-9]+\\.[0-9]+$"))' | sort -V
  ```

  Pinned via `dockerTag` in `startos/manifest/index.ts`.

- **Docker image** ([hub.docker.com/r/dxflrs/garage](https://hub.docker.com/r/dxflrs/garage)) — confirm the matching `v<version>` tag has been published before bumping:

  ```sh
  curl -fsSL "https://hub.docker.com/v2/repositories/dxflrs/garage/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
  ```

  Pinned via the same `dockerTag` in `startos/manifest/index.ts`.

## Applying the bump

- In `startos/manifest/index.ts`, set `images.garage.source.dockerTag` to `dxflrs/garage:v<new version>`.
- Re-check `parseBucketList` and `parseKeyList` in `startos/actions/utils.ts` against the tagged CLI's table columns.
- Read the release's upgrade warnings even for a minor version: v2.5.0 automatically migrates the resync queue and forbids downgrades. Upstream performs this migration; do not duplicate it in a package migration.
