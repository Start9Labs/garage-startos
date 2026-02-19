import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

export const listApiKeys = sdk.Action.withoutInput(
  'list-api-keys',

  async ({ effects }) => ({
    name: i18n('List API Keys'),
    description: i18n('List all S3 API keys'),
    warning: null,
    allowedStatuses: 'only-running',
    group: 'API Keys',
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()
    const rpcSecret = store?.rpcSecret ?? ''
    const adminToken = store?.adminToken ?? ''
    const env = { GARAGE_CONFIG_FILE: '/etc/garage.toml' }

    const garageSub = await sdk.SubContainer.of(
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

    await garageSub.writeFile(
      '/etc/garage.toml',
      generateGarageToml({ rpcSecret, adminToken }),
    )

    const result = await garageSub.exec(['/garage', 'key', 'list'], {
      env,
    })

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to list API keys: ${result.stderr || result.stdout}`,
      )
    }

    const output = String(result.stdout || '').trim()
    const lines = output.split('\n').filter((l) => l.trim().length > 0)

    // Parse garage key list output (columns separated by 2+ spaces):
    // ID                          Created     Name   Expiration
    // GKbf70f451adfa92b0f7c7c22b  2026-02-14  mykey  never
    const keys: { id: string; name: string }[] = []
    for (const line of lines) {
      const cols = line.split(/\s{2,}/)
      const id = cols[0]?.trim() ?? ''
      if (id.startsWith('GK')) {
        const name = cols[2]?.trim() || id
        keys.push({ id, name })
      }
    }

    if (keys.length === 0) {
      return {
        version: '1' as const,
        title: 'S3 API Keys',
        message: 'No API keys found.',
        result: null,
      }
    }

    // Fetch detailed info for each key to get bucket permissions
    const keyDetails = await Promise.all(
      keys.map(async (key) => {
        const info = await garageSub.exec(
          ['/garage', 'key', 'info', key.id],
          { env },
        )
        const infoOut = String(info.stdout || '')

        // Parse bucket permissions from key info output
        // Section starts after "==== BUCKETS FOR THIS KEY ===="
        // Permissions  Bucket  Local aliases
        // RW           <hex>   bucket-name
        const bucketSection = infoOut.split(
          /====\s*BUCKETS FOR THIS KEY\s*====/,
        )[1]
        const bucketNames: string[] = []
        if (bucketSection) {
          const bucketLines = bucketSection
            .split('\n')
            .filter((l) => l.trim().length > 0)
          for (const bl of bucketLines) {
            const bcols = bl.split(/\s{2,}/)
            const perms = bcols[0]?.trim() ?? ''
            // Permission lines start with R, W, or O combinations
            if (/^[RWO]+$/.test(perms) && bcols.length >= 3) {
              const alias = bcols[2]?.trim()
              if (alias) {
                bucketNames.push(`${alias} (${perms})`)
              }
            }
          }
        }

        return { ...key, buckets: bucketNames }
      }),
    )

    return {
      version: '1' as const,
      title: 'S3 API Keys',
      message: `Found ${keys.length} API key(s). Use "Delete API Key" to remove, or "Grant Key Access to Bucket" to manage permissions.`,
      result: {
        type: 'group' as const,
        value: keyDetails.map((key) => ({
          type: 'group' as const,
          name: key.name,
          description: null,
          value: [
            {
              type: 'single' as const,
              name: 'Key ID',
              description: null,
              value: key.id,
              masked: false,
              copyable: true,
              qr: false,
            },
            {
              type: 'single' as const,
              name: 'Bucket Access',
              description: null,
              value:
                key.buckets.length > 0
                  ? key.buckets.join(', ')
                  : 'No bucket access',
              masked: false,
              copyable: false,
              qr: false,
            },
          ],
        })),
      },
    }
  },
)
