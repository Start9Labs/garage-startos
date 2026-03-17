import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { createGarageSub } from '../utils'

export const listBuckets = sdk.Action.withoutInput(
  'list-buckets',

  async ({ effects }) => ({
    name: i18n('List Buckets'),
    description: i18n('List all S3 buckets'),
    warning: null,
    allowedStatuses: 'only-running',
    group: 'Buckets',
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const { sub: garageSub, env } = await createGarageSub(effects)

    const result = await garageSub.execFail(['/garage', 'bucket', 'list'], {
      env,
    })

    const output = String(result.stdout || '').trim()
    const lines = output.split('\n').filter((l) => l.trim().length > 0)

    // Parse garage bucket list output (columns separated by 2+ spaces):
    // ID                Created     Global aliases  Local aliases
    // b60617679cab55bf  2026-02-14  test-bucket
    const buckets: { id: string; name: string }[] = []
    for (const line of lines) {
      const cols = line.split(/\s{2,}/)
      const id = cols[0]?.trim() ?? ''
      if (/^[0-9a-f]+$/.test(id)) {
        const name = cols[2]?.trim() || id
        buckets.push({ id, name })
      }
    }

    if (buckets.length === 0) {
      return {
        version: '1' as const,
        title: 'S3 Buckets',
        message: 'No buckets found.',
        result: null,
      }
    }

    // Fetch info for each bucket including authorized keys
    const bucketDetails = await Promise.all(
      buckets.map(async (bucket) => {
        const info = await garageSub.exec(
          ['/garage', 'bucket', 'info', bucket.name],
          { env },
        )
        const infoOut = String(info.stdout || '')
        const objectsMatch = infoOut.match(/Objects:\s*(\d+)/)
        const sizeMatch = infoOut.match(/Size:\s*(.+)/)

        // Parse authorized keys from bucket info output
        // Section starts after "==== KEYS FOR THIS BUCKET ===="
        // Permissions  Access key                              Local aliases
        // RWO          GKe84b87567a8d7d49bd03819e  key-name    bucket-alias
        const keysSection = infoOut.split(
          /====\s*KEYS FOR THIS BUCKET\s*====/,
        )[1]
        const authorizedKeys: string[] = []
        if (keysSection) {
          const keyLines = keysSection
            .split('\n')
            .filter((l) => l.trim().length > 0)
          for (const kl of keyLines) {
            const kcols = kl.split(/\s{2,}/)
            const perms = kcols[0]?.trim() ?? ''
            if (/^[RWO]+$/.test(perms) && kcols.length >= 2) {
              const keyInfo = kcols[1]?.trim() ?? ''
              authorizedKeys.push(`${keyInfo} (${perms})`)
            }
          }
        }

        return {
          ...bucket,
          objects: objectsMatch?.[1] ?? '0',
          size: sizeMatch?.[1]?.trim() ?? '0 B',
          authorizedKeys,
        }
      }),
    )

    return {
      version: '1' as const,
      title: 'S3 Buckets',
      message: `Found ${buckets.length} bucket(s). Use "Delete Bucket" to remove, or "Grant Bucket Access to Key" to manage permissions.`,
      result: {
        type: 'group' as const,
        value: bucketDetails.map((b) => ({
          type: 'group' as const,
          name: b.name,
          description: null,
          value: [
            {
              type: 'single' as const,
              name: 'Bucket ID',
              description: null,
              value: b.id,
              masked: false,
              copyable: true,
              qr: false,
            },
            {
              type: 'single' as const,
              name: 'Objects',
              description: null,
              value: b.objects,
              masked: false,
              copyable: false,
              qr: false,
            },
            {
              type: 'single' as const,
              name: 'Size',
              description: null,
              value: b.size,
              masked: false,
              copyable: false,
              qr: false,
            },
            {
              type: 'single' as const,
              name: 'Authorized Keys',
              description: null,
              value:
                b.authorizedKeys.length > 0
                  ? b.authorizedKeys.join(', ')
                  : 'No keys authorized',
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
