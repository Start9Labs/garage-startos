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
        name: i18n('Bucket'),
        description: null,
        warning: i18n('No buckets found. Create one first.'),
        default: null,
        values: { _none: i18n('No buckets available') } as Record<
          string,
          string
        >,
        disabled: ['_none'],
      }
    }

    const values: Record<string, string> = {}
    for (const b of buckets) {
      values[b.name] = b.name
    }

    return {
      name: i18n('Bucket'),
      description: null,
      warning: null,
      default: null,
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
        name: i18n('API Keys'),
        description: null,
        warning: i18n('No API keys found. Create one first.'),
        default: [],
        values: { _none: i18n('No API keys available') } as Record<
          string,
          string
        >,
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
      description: i18n(
        'Each selected key is left with exactly the permissions turned on below. A permission it already had on this bucket is removed if it is turned off here.',
      ),
      warning: null,
      default: [],
      values,
      minLength: 1,
      maxLength: null,
    }
  }),
  read: Value.toggle({
    name: i18n('Read'),
    description: i18n('Download and list the objects in the bucket.'),
    default: true,
  }),
  write: Value.toggle({
    name: i18n('Write'),
    description: i18n('Upload, replace and delete objects in the bucket.'),
    default: true,
  }),
  owner: Value.toggle({
    name: i18n('Owner'),
    description: i18n(
      "Change the bucket's website and CORS settings, and delete the bucket.",
    ),
    default: false,
  }),
})

export const grantBucketToKey = sdk.Action.withInput(
  'grant-bucket-to-key',

  async ({ effects }) => ({
    name: i18n('Grant Bucket Access to Keys'),
    description: i18n(
      'Set the permissions one or more API keys have on a bucket',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: i18n('API Keys'),
    visibility: 'enabled',
  }),

  inputSpec,

  async () => null,

  async ({ effects, input }) => {
    if (input.bucketName === '_none') {
      throw new Error(i18n('Please create buckets before granting access.'))
    }

    if (input.keyIds.length === 0) {
      throw new Error(i18n('Please select at least one API key.'))
    }

    if (!input.read && !input.write && !input.owner) {
      throw new Error(
        i18n(
          'At least one permission (Read, Write, or Owner) must be selected.',
        ),
      )
    }

    const { sub, env } = await createGarageSub(effects)

    const perms = [
      input.read ? i18n('Read') : null,
      input.write ? i18n('Write') : null,
      input.owner ? i18n('Owner') : null,
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
        errors.push(
          `${keyId}: ${String(allowResult.stderr || allowResult.stdout).trim()}`,
        )
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
            i18n('${keyId} (revoke): ${error}', {
              keyId,
              error: String(denyResult.stderr || denyResult.stdout).trim(),
            }),
          )
          continue
        }
      }

      granted.push(keyId)
    }

    if (errors.length > 0 && granted.length === 0) {
      throw new Error(
        i18n('Failed to grant access:\n${errors}', {
          errors: errors.join('\n'),
        }),
      )
    }

    const message =
      granted.length === 1
        ? i18n(
            'Key "${key}" now has ${permissions} access to bucket "${bucket}".',
            { key: granted[0], permissions: perms, bucket: input.bucketName },
          )
        : i18n(
            '${count} keys now have ${permissions} access to bucket "${bucket}".',
            {
              count: granted.length,
              permissions: perms,
              bucket: input.bucketName,
            },
          )

    if (errors.length > 0) {
      return {
        version: '1' as const,
        title: i18n('Partial Grant'),
        message: `${message} ${i18n('Garage refused to change the permissions of the API keys below.')}`,
        result: {
          type: 'multiline',
          value: errors.join('\n'),
          copyable: true,
          masked: false,
          qr: false,
          filename: null,
        },
      }
    }

    return {
      version: '1' as const,
      title: i18n('Access Granted'),
      message,
      result: null,
    }
  },
)
