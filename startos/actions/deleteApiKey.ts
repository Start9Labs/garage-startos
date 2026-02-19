import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { createGarageSub, parseKeyList } from './garageSubContainer'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyIds: Value.dynamicMultiselect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'key', 'list'], { env })
    const keys = parseKeyList(String(result.stdout || ''))
    keys.sort((a, b) => a.id.localeCompare(b.id))

    if (keys.length === 0) {
      return {
        name: 'API Keys',
        description: null,
        warning: 'No API keys found.',
        default: [],
        values: { _none: 'No API keys available' } as Record<string, string>,
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
      name: 'API Keys',
      description: `${keys.length} key(s) available. Select one or more to delete.`,
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
    warning: i18n('This will permanently delete the API key.'),
    allowedStatuses: 'only-running',
    group: 'API Keys',
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ effects, input }) => {
    if (input.keyIds.length === 0) {
      throw new Error('No API keys selected.')
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
        errors.push(`${keyId}: ${result.stderr || result.stdout}`)
      } else {
        deleted.push(keyId)
      }
    }

    if (errors.length > 0 && deleted.length === 0) {
      throw new Error(`Failed to delete API key(s):\n${errors.join('\n')}`)
    }

    const message =
      deleted.length === 1
        ? `API key "${deleted[0]}" has been permanently deleted.`
        : `${deleted.length} API keys have been permanently deleted.`

    if (errors.length > 0) {
      return {
        version: '1' as const,
        title: 'Partial Deletion',
        message: `${message}\n\nFailed to delete:\n${errors.join('\n')}`,
        result: null,
      }
    }

    return {
      version: '1' as const,
      title: deleted.length === 1 ? 'API Key Deleted' : 'API Keys Deleted',
      message,
      result: null,
    }
  },
)
