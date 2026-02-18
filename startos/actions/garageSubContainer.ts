import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

type Effects = Parameters<typeof sdk.SubContainer.of>[0]

/**
 * Create a garage SubContainer ready for CLI commands.
 * Reads rpcSecret/adminToken from store, mounts the main volume,
 * and writes garage.toml into the container.
 */
export async function createGarageSub(effects: Effects) {
  const store = await storeJson.read((s) => s).once()
  const rpcSecret = store?.rpcSecret ?? ''
  const adminToken = store?.adminToken ?? ''
  const env = { GARAGE_CONFIG_FILE: '/etc/garage.toml' }

  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'garage' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'garage-action-sub',
  )

  await sub.writeFile(
    '/etc/garage.toml',
    generateGarageToml({ rpcSecret, adminToken }),
  )

  return { sub, env }
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
