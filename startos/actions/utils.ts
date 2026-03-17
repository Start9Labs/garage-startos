import { sdk } from '../sdk'
import { garageEnv, garageImageId, garageMounts } from '../utils'

type Effects = Parameters<typeof sdk.SubContainer.of>[0]

/**
 * Create a garage SubContainer ready for CLI commands.
 * The garage.toml lives on the volume at /data/garage.toml.
 */
export async function createGarageSub(effects: Effects) {
  const sub = await sdk.SubContainer.of(
    effects,
    garageImageId,
    garageMounts,
    'garage-action-sub',
  )

  return { sub, env: garageEnv }
}

/** Parse `garage key list` output into key IDs and names. */
export function parseKeyList(stdout: string): { id: string; name: string }[] {
  const lines = stdout.split('\n').filter((l) => l.trim().length > 0)
  const keys: { id: string; name: string }[] = []
  for (const line of lines) {
    const cols = line.split(/\s{2,}/)
    const id = cols[0]?.trim() ?? ''
    if (id.startsWith('GK')) {
      const name = cols[2]?.trim() || id
      keys.push({ id, name })
    }
  }
  return keys
}

/** Parse `garage bucket list` output into bucket IDs and names. */
export function parseBucketList(
  stdout: string,
): { id: string; name: string }[] {
  const lines = stdout.split('\n').filter((l) => l.trim().length > 0)
  const buckets: { id: string; name: string }[] = []
  for (const line of lines) {
    const cols = line.split(/\s{2,}/)
    const id = cols[0]?.trim() ?? ''
    if (/^[0-9a-f]+$/.test(id)) {
      const name = cols[2]?.trim() || id
      buckets.push({ id, name })
    }
  }
  return buckets
}
