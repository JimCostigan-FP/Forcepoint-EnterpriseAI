// v0 interpretation of the Standardized Skill Template referenced in the
// May 27, 2026 brief as ADD v2.6 §2.7.2. The canonical doc is not in this
// repo; this file encodes the section list named in the brief and flags
// itself as v0 so a follow-up can replace it once the doc is available.

export const TEMPLATE_VERSION = 'v0-from-brief'

export const TEMPLATE_SECTIONS = [
  { key: 'purpose',      label: 'Purpose / description (with triggers)' },
  { key: 'connection',   label: 'Connection reference' },
  { key: 'objects',      label: 'Core object schemas' },
  { key: 'picklists',    label: 'Picklist values' },
  { key: 'queries',      label: 'Query templates' },
  { key: 'routing',      label: 'Routing rules' },
  { key: 'performance',  label: 'Performance tips' },
  { key: 'maintenance',  label: 'Maintenance notes' },
  { key: 'deprecation',  label: 'Deprecation criteria' },
]

// Trim sections that have no content. The brief is explicit: "If a section
// isn't applicable, omit it cleanly; do not emit placeholder cruft."
function nonEmpty(s) {
  return typeof s === 'string' && s.trim().length > 0
}

export function buildSkillMarkdown({ name, description, triggers, sections }) {
  const fmTriggers = (triggers || []).filter(Boolean).join(', ')
  const front = `---\nname: ${name}\ndescription: ${description.trim()}\n${
    fmTriggers ? `triggers: [${fmTriggers}]\n` : ''
  }template_version: ${TEMPLATE_VERSION}\n---\n`

  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const body  = [`# ${title}\n`]

  TEMPLATE_SECTIONS.forEach(({ key, label }) => {
    const v = sections?.[key]
    if (!nonEmpty(v)) return
    body.push(`## ${label}\n\n${v.trim()}\n`)
  })

  return front + '\n' + body.join('\n')
}

export function buildManifest({ name, version, description, triggers, ownerEmail }) {
  return JSON.stringify({
    name,
    version,
    description: description.trim(),
    triggers: (triggers || []).map(t => t.trim()).filter(Boolean),
    owner: ownerEmail,
    contributed_date: new Date().toISOString().split('T')[0],
    template_version: TEMPLATE_VERSION,
    source: 'iris-skill-creator',
    maintenance: {
      review_cadence: 'quarterly',
      skill_owner: ownerEmail,
    },
    status: 'active',
  }, null, 2)
}

export function buildReadme({ name, version, description, ownerEmail }) {
  const today = new Date().toISOString().split('T')[0]
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return [
    `# ${title} v${version}`,
    ``,
    `**Authored by:** ${ownerEmail}  `,
    `**Date:** ${today}  `,
    `**Source:** Forcepoint Intelligence Platform skill-creator (template ${TEMPLATE_VERSION})`,
    ``,
    `## What this skill does`,
    ``,
    description.trim(),
    ``,
    `## Review cadence`,
    ``,
    `Quarterly.`,
    ``,
  ].join('\n')
}

// Tier inference. Heuristic only. The brief asks for personal / team /
// department / company-wide with an SLA hint at creation time.
const TIER_TABLE = [
  { id: 'company',    label: 'Company-wide', sla: '5 business days', tone: 'navy' },
  { id: 'department', label: 'Department',   sla: '3 business days', tone: 'teal' },
  { id: 'team',       label: 'Team',         sla: '2 business days', tone: 'amber' },
  { id: 'personal',   label: 'Personal',     sla: 'Self-serve',      tone: 'violet' },
]

export function inferTier({ description, sections }) {
  const text = (description + ' ' + Object.values(sections || {}).join(' ')).toLowerCase()
  const hits = (re) => re.test(text)

  if (hits(/\b(company[- ]wide|enterprise|all (employees|forcepoint)|production|regulated|pii|phi|gdpr)\b/)) {
    return TIER_TABLE[0]
  }
  if (hits(/\b(department|sales team|engineering team|finance|hr|legal|marketing|security team)\b/)) {
    return TIER_TABLE[1]
  }
  if (hits(/\b(team|squad|pod|group|shared with)\b/)) {
    return TIER_TABLE[2]
  }
  return TIER_TABLE[3]
}

export const TIERS = TIER_TABLE

// Common English stopwords + boilerplate verbs that show up in every prompt
// and so carry no signal as triggers. Tuned for the "what should make Claude
// reach for this skill" question, not for general NLP.
const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','of','to','in','on','for','from',
  'with','at','by','as','is','are','was','were','be','been','being','this','that',
  'these','those','it','its','my','our','your','their','his','her','i','me','we',
  'you','they','can','could','would','should','will','shall','do','does','did',
  'have','has','had','having','what','which','who','whom','how','when','where','why',
  'show','tell','give','make','please','need','want','help','use','using','about',
  'into','over','under','out','up','down','here','there','also','just','only','very',
  'so','than','more','most','some','any','all','no','not','one','two','three','new',
])

export function deriveTriggers(prompts, intent = '') {
  const text = [...(prompts || []), intent].join(' ')
  if (!text.trim()) return []

  const tokens = text
    .toLowerCase()
    .replace(/['']/g, '')
    .split(/[^a-z0-9-]+/)
    .filter(Boolean)
    .filter(w => w.length >= 4)
    .filter(w => !STOPWORDS.has(w))

  const counts = new Map()
  tokens.forEach(t => counts.set(t, (counts.get(t) || 0) + 1))

  // Surface terms that recur across the prompts first; fall back to unique
  // domain-looking words so a single-prompt entry still yields suggestions.
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)

  return sorted.slice(0, 8)
}

export function slugify(input) {
  if (!input) return ''
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
