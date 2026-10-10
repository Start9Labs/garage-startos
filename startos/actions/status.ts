import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { createGarageSub } from './utils'

type NodeInfo = {
  id: string
  hostname: string
  address: string
  role: string
}

type Section = {
  name: string
  nodes: NodeInfo[]
}

function parseStatusOutput(output: string): Section[] {
  const sections: Section[] = []
  let currentSection: Section | null = null
  let headerSkipped = false

  for (const line of output.split('\n')) {
    const sectionMatch = line.match(/====\s*(.*?)\s*====/)
    if (sectionMatch) {
      currentSection = { name: sectionMatch[1], nodes: [] }
      sections.push(currentSection)
      headerSkipped = false
      continue
    }

    if (!currentSection) continue
    if (line.trim().length === 0) continue

    if (!headerSkipped && line.trim().startsWith('ID')) {
      headerSkipped = true
      continue
    }

    const cols = line.split(/\s{2,}/)
    const id = cols[0]?.trim() ?? ''
    if (/^[0-9a-f]+$/.test(id)) {
      currentSection.nodes.push({
        id,
        hostname: cols[1]?.trim() ?? '',
        address: cols[2]?.trim() ?? '',
        role: cols.slice(3).join(' ').trim() || i18n('No role assigned'),
      })
    }
  }

  return sections
}

export const clusterStatus = sdk.Action.withoutInput(
  'cluster-status',

  async ({ effects }) => ({
    name: i18n('Cluster Status'),
    description: i18n('Show the status of the Garage cluster'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)

    const result = await sub.execFail(['/garage', 'status'], { env })

    const output = String(result.stdout || '').trim()
    const sections = parseStatusOutput(output)
    const healthySection = sections.find((s) => s.name === 'HEALTHY NODES')
    const nodeCount = healthySection?.nodes.length ?? 0

    if (sections.length === 0 || nodeCount === 0) {
      return {
        version: '1' as const,
        title: i18n('Cluster Status'),
        message: i18n('No healthy nodes found.'),
        result: null,
      }
    }

    return {
      version: '1' as const,
      title: i18n('Cluster Status'),
      message: i18n('Found ${count} healthy node(s).', { count: nodeCount }),
      result: {
        type: 'group' as const,
        value: sections
          .filter((s) => s.nodes.length > 0)
          .map((s) => ({
            type: 'group' as const,
            name: s.name === 'HEALTHY NODES'
              ? i18n('Healthy Nodes')
              : s.name === 'FAILED NODES'
                ? i18n('Failed Nodes')
                : s.name,
            description: null,
            value: s.nodes.map((node) => ({
              type: 'group' as const,
              name: node.hostname || node.id,
              description: null,
              value: [
                {
                  type: 'single' as const,
                  name: i18n('Node ID'),
                  description: null,
                  value: node.id,
                  masked: false,
                  copyable: true,
                  qr: false,
                },
                {
                  type: 'single' as const,
                  name: i18n('Address'),
                  description: null,
                  value: node.address,
                  masked: false,
                  copyable: true,
                  qr: false,
                },
                {
                  type: 'single' as const,
                  name: i18n('Role'),
                  description: null,
                  value: node.role,
                  masked: false,
                  copyable: false,
                  qr: false,
                },
              ],
            })),
          })),
      },
    }
  },
)
