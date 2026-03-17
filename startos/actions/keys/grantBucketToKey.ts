import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { createGarageSub, parseBucketList, parseKeyList } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketName: Value.dynamicSelect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'bucket', 'list'], { env })
    const buckets = parseBucketList(String(result.stdout || ''))
    buckets.sort((a, b) => a.name.localeCompare(b.name))

    if (buckets.length === 0) {
      return {
        name: 'Bucket',
        description: null,
        warning: 'No buckets found. Create one first.',
        default: '_none',
        values: { _none: 'No buckets available' } as Record<string, string>,
        disabled: ['_none'],
      }
    }

    const values: Record<string, string> = {}
    for (const b of buckets) {
      values[b.name] = b.name
    }

    return {
      name: 'Bucket',
      description: 'Select the bucket to grant access to',
      warning: null,
      default: buckets[0].name,
      values,
    }
  }),
  keyIds: Value.dynamicMultiselect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'key', 'list'], { env })
    const keys = parseKeyList(String(result.stdout || ''))
    keys.sort((a, b) => a.id.localeCompare(b.id))

    if (keys.length === 0) {
      return {
        name: 'API Keys',
        description: null,
        warning: 'No API keys found. Create one first.',
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
      description: `${keys.length} key(s) available. Select one or more to grant access.`,
      warning: null,
      default: [],
      values,
      minLength: 1,
      maxLength: null,
    }
  }),
  read: Value.toggle({
    name: 'Read',
    description: 'Allow reading objects from the bucket',
    default: true,
  }),
  write: Value.toggle({
    name: 'Write',
    description: 'Allow writing objects to the bucket',
    default: true,
  }),
  owner: Value.toggle({
    name: 'Owner',
    description:
      'Grant owner permissions (delete objects, manage bucket settings)',
    default: false,
  }),
})

export const grantBucketToKey = sdk.Action.withInput(
  'grant-bucket-to-key',

  async ({ effects }) => ({
    name: i18n('Grant Bucket Access to Keys'),
    description: i18n('Allow a specific API key to access a bucket'),
    warning: null,
    allowedStatuses: 'only-running',
    group: 'Keys',
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ effects, input }) => {
    if (input.bucketName === '_none') {
      throw new Error('Please create buckets before granting access.')
    }

    if (input.keyIds.length === 0) {
      throw new Error('Please select at least one API key.')
    }

    if (!input.read && !input.write && !input.owner) {
      throw new Error(
        'At least one permission (Read, Write, or Owner) must be selected.',
      )
    }

    const { sub, env } = await createGarageSub(effects)

    const perms = [
      input.read ? 'Read' : null,
      input.write ? 'Write' : null,
      input.owner ? 'Owner' : null,
    ]
      .filter(Boolean)
      .join(', ')

    const errors: string[] = []
    const granted: string[] = []

    for (const keyId of input.keyIds) {
      // Allow checked permissions
      const allowArgs = ['/garage', 'bucket', 'allow', input.bucketName]
      if (input.read) allowArgs.push('--read')
      if (input.write) allowArgs.push('--write')
      if (input.owner) allowArgs.push('--owner')
      allowArgs.push('--key', keyId)

      const allowResult = await sub.exec(allowArgs, { env })
      if (allowResult.exitCode !== 0) {
        errors.push(`${keyId}: ${allowResult.stderr || allowResult.stdout}`)
        continue
      }

      // Deny unchecked permissions to revoke any previously granted access
      const denyArgs = ['/garage', 'bucket', 'deny', input.bucketName]
      if (!input.read) denyArgs.push('--read')
      if (!input.write) denyArgs.push('--write')
      if (!input.owner) denyArgs.push('--owner')

      if (denyArgs.length > 4) {
        denyArgs.push('--key', keyId)
        const denyResult = await sub.exec(denyArgs, { env })
        if (denyResult.exitCode !== 0) {
          errors.push(
            `${keyId} (deny): ${denyResult.stderr || denyResult.stdout}`,
          )
          continue
        }
      }

      granted.push(keyId)
    }

    if (errors.length > 0 && granted.length === 0) {
      throw new Error(`Failed to grant access:\n${errors.join('\n')}`)
    }

    const message =
      granted.length === 1
        ? `Key "${granted[0]}" now has ${perms} access to bucket "${input.bucketName}".`
        : `${granted.length} keys now have ${perms} access to bucket "${input.bucketName}".`

    if (errors.length > 0) {
      return {
        version: '1' as const,
        title: 'Partial Grant',
        message: `${message}\n\nFailed to grant:\n${errors.join('\n')}`,
        result: null,
      }
    }

    return {
      version: '1' as const,
      title: 'Access Granted',
      message,
      result: null,
    }
  },
)
