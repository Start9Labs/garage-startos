export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Garage': 0,
  'Garage is healthy': 1,
  'Garage is not healthy': 2,

  // interfaces.ts
  'S3 API Interface': 3,
  'S3-compatible object storage API': 4,
  'Admin API': 5,
  'Garage administration API': 6,
  'S3 Web Interface': 7,
  'Static website hosting endpoint for S3 buckets': 8,

  // actions
  'Get Admin Token': 9,
  'Retrieve the admin API token for Garage': 10,
  'Create Bucket': 11,
  'Create a new S3 bucket': 12,
  'Create API Key': 13,
  'Create a new S3 API key pair': 14,
  'List Buckets': 15,
  'List all S3 buckets': 16,
  'List API Keys': 17,
  'List all S3 API keys': 18,
  'Retrieve the admin API token': 19,
  'Delete API Key': 20,
  'Delete an S3 API key by its key ID': 21,
  'This will permanently delete the API key.': 22,
  'Delete Bucket': 23,
  'Delete an S3 bucket by name': 24,
  'This will permanently delete the bucket and all its contents.': 25,
  'Grant Key Access to Buckets': 26,
  'Grant an API key read/write access to a specific bucket': 27,
  'Grant Bucket Access to Keys': 28,
  'Allow a specific API key to access a bucket': 29,
  'Cluster Status': 30,
  'Show the status of the Garage cluster': 31,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
