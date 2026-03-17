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
  'S3 Web Hosting': 7,
  'Serves static websites from S3 buckets': 8,

  // actions
  'Reset Admin Token': 9,
  'Set Admin Token': 10,
  'Generate a new admin API token for Garage': 11,
  'This will invalidate the current admin token. Save the new token to a password manager.': 12,
  'Admin Token Set': 13,
  'Save this token to a password manager. It will not be shown again.': 14,
  'Admin Token': 15,
  'Create Bucket': 16,
  'Create a new S3 bucket': 17,
  'Create API Key': 18,
  'Create a new S3 API key pair': 19,
  'List Buckets': 20,
  'List all S3 buckets': 21,
  'List API Keys': 22,
  'List all S3 API keys': 23,
  'Delete API Key': 24,
  'Delete an S3 API key by its key ID': 25,
  'This will permanently delete the API key.': 26,
  'Delete Bucket': 27,
  'Delete an S3 bucket by name': 28,
  'This will permanently delete the bucket and all its contents.': 29,
  'Grant Bucket Access to Keys': 30,
  'Allow a specific API key to access a bucket': 31,
  'Cluster Status': 32,
  'Show the status of the Garage cluster': 33,

  // init tasks
  'Set your admin API token': 34,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
