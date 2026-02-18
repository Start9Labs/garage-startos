import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  createGarageSub,
  parseBucketList,
  parseKeyList,
} from './garageSubContainer'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyId: Value.dynamicSelect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'key', 'list'], { env })
    const keys = parseKeyList(String(result.stdout || ''))
    keys.sort((a, b) => a.id.localeCompare(b.id))

    if (keys.length === 0) {
      return {
        name: 'API Key',
        description: null,
        warning: 'No API keys found. Create one first.',
        default: '_none',
        values: { _none: 'No API keys available' } as Record<string, string>,
        disabled: ['_none'],
      }
    }

    const values: Record<string, string> = {}
    for (const k of keys) {
      values[k.id] = k.name !== k.id ? `${k.id} (${k.name})` : k.id
    }

    return {
      name: 'API Key',
      description: 'Select the API key to grant access',
      warning: null,
      default: keys[0].id,
      values,
    }
  }),
  bucketNames: Value.dynamicMultiselect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'bucket', 'list'], { env })
    const buckets = parseBucketList(String(result.stdout || ''))
    buckets.sort((a, b) => a.name.localeCompare(b.name))

    if (buckets.length === 0) {
      return {
        name: 'Buckets',
        description: null,
        warning: 'No buckets found. Create one first.',
        default: [],
        values: { _none: 'No buckets available' } as Record<string, string>,
        disabled: ['_none'],
        minLength: null,
        maxLength: null,
      }
    }

    const values: Record<string, string> = {}
    for (const b of buckets) {
      values[b.name] = b.name
    }

    return {
      name: 'Buckets',
      description: `${buckets.length} bucket(s) available. Select one or more to grant access.`,
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

export const grantKeyToBucket = sdk.Action.withInput(
  'grant-key-to-bucket',

  async ({ effects }) => ({
    name: i18n('Grant Key Access to Bucket'),
    description: i18n(
      'Grant an API key read/write access to a specific bucket',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ effects, input }) => {
    if (input.keyId === '_none') {
      throw new Error(
        'Please create API keys before granting access.',
      )
    }

    if (input.bucketNames.length === 0) {
      throw new Error('Please select at least one bucket.')
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

    for (const bucketName of input.bucketNames) {
      // Allow checked permissions
      const allowArgs = ['/garage', 'bucket', 'allow', bucketName]
      if (input.read) allowArgs.push('--read')
      if (input.write) allowArgs.push('--write')
      if (input.owner) allowArgs.push('--owner')
      allowArgs.push('--key', input.keyId)

      const allowResult = await sub.exec(allowArgs, { env })
      if (allowResult.exitCode !== 0) {
        errors.push(
          `${bucketName}: ${allowResult.stderr || allowResult.stdout}`,
        )
        continue
      }

      // Deny unchecked permissions to revoke any previously granted access
      const denyArgs = ['/garage', 'bucket', 'deny', bucketName]
      if (!input.read) denyArgs.push('--read')
      if (!input.write) denyArgs.push('--write')
      if (!input.owner) denyArgs.push('--owner')

      if (denyArgs.length > 4) {
        denyArgs.push('--key', input.keyId)
        const denyResult = await sub.exec(denyArgs, { env })
        if (denyResult.exitCode !== 0) {
          errors.push(
            `${bucketName} (deny): ${denyResult.stderr || denyResult.stdout}`,
          )
          continue
        }
      }

      granted.push(bucketName)
    }

    if (errors.length > 0 && granted.length === 0) {
      throw new Error(`Failed to grant access:\n${errors.join('\n')}`)
    }

    const message =
      granted.length === 1
        ? `Key "${input.keyId}" now has ${perms} access to bucket "${granted[0]}".`
        : `Key "${input.keyId}" now has ${perms} access to ${granted.length} buckets.`

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
