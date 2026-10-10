import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { createGarageSub, parseKeyList } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyIds: Value.dynamicMultiselect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'key', 'list'], { env })
    const keys = parseKeyList(String(result.stdout || ''))
    keys.sort((a, b) => a.id.localeCompare(b.id))

    if (keys.length === 0) {
      return {
        name: i18n('API Keys'),
        description: null,
        warning: i18n('No API keys found.'),
        default: [],
        values: { _none: i18n('No API keys available') } as Record<string, string>,
        disabled: ['_none'],
        minLength: null,
        maxLength: null,
      }
    }

    const values: Record<string, string> = {}
    for (const k of keys) {
      values[k.id] = k.name !== k.id ? `${k.id} (${k.name})` : k.id
    }

    return {
      name: i18n('API Keys'),
      description: null,
      warning: null,
      default: [],
      values,
      minLength: 1,
      maxLength: null,
    }
  }),
})

export const deleteApiKey = sdk.Action.withInput(
  'delete-api-key',

  async ({ effects }) => ({
    name: i18n('Delete API Key'),
    description: i18n('Delete an S3 API key by its key ID'),
    warning: i18n(
      'Anything using a deleted key loses access to Garage immediately. This cannot be undone.',
    ),
    allowedStatuses: 'only-running',
    group: i18n('API Keys'),
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ effects, input }) => {
    if (input.keyIds.length === 0) {
      throw new Error(i18n('No API keys selected.'))
    }

    const { sub, env } = await createGarageSub(effects)
    const errors: string[] = []
    const deleted: string[] = []

    for (const keyId of input.keyIds) {
      const result = await sub.exec(
        ['/garage', 'key', 'delete', '--yes', keyId],
        { env },
      )
      if (result.exitCode !== 0) {
        errors.push(
          `${keyId}: ${String(result.stderr || result.stdout).trim()}`,
        )
      } else {
        deleted.push(keyId)
      }
    }

    if (errors.length > 0 && deleted.length === 0) {
      throw new Error(i18n('Failed to delete API key(s):\n${errors}', { errors: errors.join('\n') }))
    }

    const message =
      deleted.length === 1
        ? i18n('API key "${name}" has been permanently deleted.', { name: deleted[0] })
        : i18n('${count} API keys have been permanently deleted.', { count: deleted.length })

    if (errors.length > 0) {
      return {
        version: '1' as const,
        title: i18n('Partial Deletion'),
        message: `${message} ${i18n('Garage refused to delete the API keys below.')}`,
        result: {
          type: 'multiline',
          value: errors.join('\n'),
          copyable: true,
          masked: false,
          qr: false,
        },
      }
    }

    return {
      version: '1' as const,
      title: deleted.length === 1 ? i18n('API Key Deleted') : i18n('API Keys Deleted'),
      message,
      result: null,
    }
  },
)
