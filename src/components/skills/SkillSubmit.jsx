import { useEffect, useRef, useState, Fragment } from 'react'
import JSZip from 'jszip'
import {
  ShieldIcon, ScalesIcon, LockIcon, DocCheckIcon, WrenchIcon, BranchIcon,
  UploadCloudIcon, FileIcon, FileJsonIcon, FileCodeIcon,
  CheckIcon, XIcon, ChevronDown, GithubIcon, ArrowRight,
  PlusIcon, InfoIcon,
} from '../ui/icons.jsx'
import './skills.css'

// Defaults target Forcepoint's GitHub Enterprise (BTS/EAI-claude-skills).
// Override host/owner/repo via VITE_GITHUB_* in .env. The PAT is collected
// per-submission in the UI and validated against the submitter's email —
// never bundled, never persisted.
const GITHUB_CONFIG = {
  HOST:  import.meta.env.VITE_GITHUB_HOST  || 'https://github.cicd.cloud.fpdev.io',
  API:   import.meta.env.VITE_GITHUB_API   || 'https://github.cicd.cloud.fpdev.io/api/v3',
  OWNER: import.meta.env.VITE_GITHUB_OWNER || 'BTS',
  REPO:  import.meta.env.VITE_GITHUB_REPO  || 'EAI-claude-skills',
}

const PIPELINE_STEPS = [
  { id: 0, Icon: ShieldIcon,    label: 'Security scan',         detail: 'Secrets, credentials, hard-coded PII, and API key detection.' },
  { id: 1, Icon: ScalesIcon,    label: 'Compliance check',      detail: 'Forcepoint AI Policy (FP-IS-AI) and data classification review.' },
  { id: 2, Icon: LockIcon,      label: 'DLP review',            detail: 'No regulated data (PII, PHI, proprietary) embedded in skill content.' },
  { id: 3, Icon: DocCheckIcon,  label: 'Template compliance',   detail: 'manifest.json, README.md, and {skill-name}.md present and valid.' },
  { id: 4, Icon: WrenchIcon,    label: 'Engineering review',    detail: 'Skills Engineering — technical review, trust-tier assignment, pilot planning.' },
  { id: 5, Icon: BranchIcon,    label: 'GitHub PR queue',       detail: 'Pull request opened in EAI-claude-skills for IT review and merge.' },
]

// ── PIPELINE STUBS — replace bodies with real service calls ──
async function checkSecurity(inventory)               { return { ok: true } }  // eslint-disable-line no-unused-vars
async function checkCompliance(inventory)             { return { ok: true } }  // eslint-disable-line no-unused-vars
async function checkDlp(inventory)                    { return { ok: true } }  // eslint-disable-line no-unused-vars
async function checkDocQuality(inventory, skillName)  {
  const missing = []
  if (!inventory.manifest) missing.push('manifest.json')
  if (!inventory.readme)   missing.push('README.md')
  if (!inventory.skillMd)  missing.push(`${skillName}.md`)
  return missing.length ? { ok: false, error: `Missing: ${missing.join(', ')}` } : { ok: true }
}

const pause = ms => new Promise(r => setTimeout(r, ms))

// ── GITHUB IDENTITY CHECK — confirms the PAT belongs to the submitter ──
// Calls GET /user and GET /user/emails; requires the PAT to have `user:email`
// scope. Falls back to user.email (profile) when /user/emails is forbidden.
async function verifyGitHubIdentity(pat, formEmail) {
  const headers = {
    'Authorization':        `Bearer ${pat}`,
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  try {
    const userRes = await fetch(`${GITHUB_CONFIG.API}/user`, { headers })
    if (userRes.status === 401) return { ok: false, error: 'GitHub token is invalid or expired.' }
    if (!userRes.ok)            return { ok: false, error: `GitHub auth check failed (HTTP ${userRes.status}).` }
    const user = await userRes.json()

    const emailRes = await fetch(`${GITHUB_CONFIG.API}/user/emails`, { headers })
    let verifiedEmails = []
    if (emailRes.ok) {
      const list = await emailRes.json()
      verifiedEmails = list.filter(e => e.verified).map(e => e.email.toLowerCase())
    } else if (user.email) {
      verifiedEmails = [user.email.toLowerCase()]
    } else {
      return { ok: false, error: 'Token is missing the user:email scope. Mint a new PAT with repo + user:email scopes.' }
    }

    if (!verifiedEmails.includes(formEmail.toLowerCase())) {
      return { ok: false, error: `Token belongs to ${user.login}, whose verified emails do not include ${formEmail}. Use a token from the GitHub account tied to your Forcepoint email.` }
    }
    return { ok: true, login: user.login }
  } catch (e) {
    return { ok: false, error: e.message || 'Network error reaching GitHub.' }
  }
}

// ── GITHUB PUSH — uploads all three files from inventory ──
// `extras` carries Iris MVP enrichments (AI-471): the IRIS-style tracking
// reference, optional trust tier, and optional use-case text. All three
// surface in the PR body so reviewers see the routing/context upfront.
async function pushInventoryToGitHub(skillName, version, inventory, committer, intent, pat, extras = {}) {
  const apiBase = `${GITHUB_CONFIG.API}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}`
  const branch  = `skill/${skillName}/v${version}`
  const headers = {
    'Authorization':        `Bearer ${pat}`,
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type':         'application/json',
  }

  const toBase64 = str => btoa(unescape(encodeURIComponent(str)))

  try {
    const refRes = await fetch(`${apiBase}/git/ref/heads/main`, { headers })
    if (!refRes.ok) return { ok: false, error: `Could not read main branch (HTTP ${refRes.status})` }
    const mainSha = (await refRes.json()).object.sha

    const branchRes = await fetch(`${apiBase}/git/refs`, {
      method: 'POST', headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainSha }),
    })
    if (!branchRes.ok && branchRes.status !== 422) {
      const bErr = await branchRes.json().catch(() => ({}))
      return { ok: false, error: `Branch creation failed: ${bErr.message || `HTTP ${branchRes.status}`}` }
    }

    const files = [
      { name: 'manifest.json',      content: inventory.manifest.content },
      { name: 'README.md',          content: inventory.readme.content },
      { name: `${skillName}.md`,    content: inventory.skillMd.content },
    ]
    for (const f of files) {
      const path = `skills/${skillName}/v${version}/${f.name}`
      const existing = await fetch(`${apiBase}/contents/${path}?ref=${branch}`, { headers })
      const existingSha = existing.ok ? (await existing.json()).sha : undefined

      const res = await fetch(`${apiBase}/contents/${path}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          message: `feat: add ${skillName} v${version} — ${f.name}`,
          content: toBase64(f.content),
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: `Upload failed for ${f.name}: ${err.message || `HTTP ${res.status}`}` }
      }
    }

    const irisRef = extras.irisRef ? `**Tracking ref:** \`${extras.irisRef}\`\n` : ''
    const tierLine = extras.tier ? `**Trust tier:** ${extras.tier}\n` : ''
    const useCaseBlock = extras.useCase
      ? `\n### Use case / business value\n${extras.useCase}\n`
      : ''
    const prBody =
      `## Skill Submission: \`${skillName}\` v${version}\n\n` +
      `**Submitter:** ${committer}\n` +
      `${irisRef}${tierLine}` +
      `\n### What does this skill do?\n${intent}\n` +
      useCaseBlock +
      `\n---\n_Submitted via the Forcepoint Enterprise AI (Iris). Files at \`skills/${skillName}/v${version}/\`._`

    const prRes = await fetch(`${apiBase}/pulls`, {
      method: 'POST', headers,
      body: JSON.stringify({
        title: `Skill Submission: ${skillName} v${version}`,
        body:  prBody,
        head: branch, base: 'main',
      }),
    })

    let pr
    if (!prRes.ok) {
      if (prRes.status === 422) {
        const existing = await fetch(`${apiBase}/pulls?head=${GITHUB_CONFIG.OWNER}:${branch}&state=open`, { headers })
        const list = existing.ok ? await existing.json() : []
        if (list.length) { pr = list[0] }
        else return { ok: false, error: `PR creation failed and no existing PR found for branch ${branch}.` }
      } else {
        const pErr = await prRes.json().catch(() => ({}))
        return { ok: false, error: `PR creation failed: ${pErr.message || `HTTP ${prRes.status}`}` }
      }
    } else {
      pr = await prRes.json()
    }
    await fetch(`${apiBase}/issues/${pr.number}/labels`, {
      method: 'POST', headers,
      body: JSON.stringify({ labels: ['Skill-Submission'] }),
    }).catch(() => {})
    return { ok: true, prUrl: pr.html_url, prNumber: pr.number, branch }
  } catch (e) {
    return { ok: false, error: e.message || 'Network error' }
  }
}

// ── MANIFEST MODAL ─────────────────────────────────────────
// Inputs that already exist on the Step 1 form (owner email, baseline/skill
// tokens, default description) are passed in as props rather than asked for
// again. The modal focuses on the fields that are *manifest-specific*:
// triggers, connection, model, deprecation criteria.
function ManifestModal({
  skillName, version, ownerEmail,
  defaultDescription = '',
  baseTokens, setBaseTokens,
  skillTokens, setSkillTokens,
  onSave, onClose,
}) {
  const today = new Date().toISOString().split('T')[0]
  // Seed description from the Step 1 intent — the submitter just wrote
  // exactly this; don't ask again. They can still edit if the manifest
  // description needs a tighter one-liner.
  const [desc,         setDesc]         = useState(defaultDescription)
  const [triggers,     setTriggers]     = useState('')
  const [catalog,      setCatalog]      = useState('')
  const [connSchema,   setConnSchema]   = useState('')
  // Forcepoint Intelligence Platform model tier the skill is authored for —
  // matches the three tiers in "How to Request a Custom Skill"
  // (Skill_Request_Guide_2.docx, Step 1). Sonnet 4.6 is the recommended
  // default and covers the majority of skills.
  const [model,        setModel]        = useState('claude-sonnet-4-6')
  const [deprecText,   setDeprecText]   = useState('')
  const [error,        setError]        = useState('')

  const generate = () => {
    if (!desc.trim())     { setError('Description is required.'); return }
    if (!triggers.trim()) { setError('At least one trigger keyword is required.'); return }
    if (!ownerEmail || !ownerEmail.trim()) {
      setError('Owner email is missing on the form. Sign in with Okta or fill the email in Step 1.')
      return
    }

    const base = parseInt(baseTokens) || null
    const skill = parseInt(skillTokens) || null

    const manifest = {
      name:             skillName,
      version,
      description:      desc.trim(),
      triggers:         triggers.split(',').map(t => t.trim()).filter(Boolean),
      owner:            ownerEmail.trim(),
      contributed_date: today,
      token_efficiency: (() => {
        const b = base  || 1
        const s = (base && skill) ? skill : 0
        return { baseline_tokens: b, skill_tokens: s, reduction_percent: Math.round((1 - s / b) * 100) }
      })(),
      connection: {
        catalog: catalog.trim() || 'default',
        schema:  connSchema.trim() || 'default',
      },
      model:            model,
      maintenance: {
        review_cadence:       'quarterly',
        deprecation_criteria: deprecText.trim() || 'Review if trigger keywords change significantly.',
        skill_owner:          ownerEmail.trim(),
      },
      status: 'active',
    }
    onSave(JSON.stringify(manifest, null, 2))
  }

  return (
    <div className="sb-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sb-modal sb-modal-form">
        <div className="sb-modal-form-head">
          <FileJsonIcon size={18} className="sb-modal-form-icon" />
          <div>
            <h3 className="sb-modal-title">Generate manifest.json</h3>
            <p className="sb-modal-sub">Machine-readable metadata for {skillName || 'your skill'} v{version}</p>
          </div>
          <button type="button" className="sb-modal-x" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <div className="sb-modal-body-grid">
          {/* Owner is taken from Step 1 (Forcepoint email, pre-filled from
              Okta) — no need to re-enter. Shown here as a read-only badge
              so the submitter sees who will be attributed in the manifest. */}
          {ownerEmail && (
            <div className="sb-modal-owner">
              <span className="sb-modal-owner-label">Owner</span>
              <strong>{ownerEmail}</strong>
              <span className="sb-modal-owner-hint">from your Forcepoint sign-in (edit in Step 1)</span>
            </div>
          )}

          <div className="sb-field">
            <label className="sb-label">Description <span className="sb-req">required</span></label>
            <textarea className="sb-input" rows={2} placeholder="Eliminates redundant discovery calls by caching…" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="sb-hint">Pre-filled from your Step 1 intent. Tighten to a one-liner for the manifest if you like.</div>
          </div>
          <div className="sb-field">
            <label className="sb-label">Trigger keywords <span className="sb-req">required</span></label>
            <input type="text" className="sb-input" placeholder="Salesforce, pipeline, opportunity, revenue" value={triggers} onChange={e => setTriggers(e.target.value)} />
            <div className="sb-hint">Comma-separated. The platform activates this skill when these words appear in a query.</div>
          </div>

          <div className="sb-row-2">
            <div className="sb-field">
              <label className="sb-label">Baseline tokens <span className="sb-opt">optional</span></label>
              <input type="number" className="sb-input" placeholder="22000" value={baseTokens} onChange={e => setBaseTokens(e.target.value)} />
            </div>
            <div className="sb-field">
              <label className="sb-label">Skill tokens <span className="sb-opt">optional</span></label>
              <input type="number" className="sb-input" placeholder="3000" value={skillTokens} onChange={e => setSkillTokens(e.target.value)} />
              {baseTokens && skillTokens && parseInt(baseTokens) > 0 && (
                <div className="sb-hint sb-hint-ok">
                  → {Math.round((1 - parseInt(skillTokens) / parseInt(baseTokens)) * 100)}% reduction
                </div>
              )}
            </div>
          </div>

          <div className="sb-row-2">
            <div className="sb-field">
              <label className="sb-label">Connection catalog <span className="sb-opt">optional</span></label>
              <input type="text" className="sb-input" placeholder="Salesforce" value={catalog} onChange={e => setCatalog(e.target.value)} />
            </div>
            <div className="sb-field">
              <label className="sb-label">Connection schema <span className="sb-opt">optional</span></label>
              <input type="text" className="sb-input" placeholder="Salesforce" value={connSchema} onChange={e => setConnSchema(e.target.value)} />
            </div>
          </div>

          <div className="sb-field">
            <label className="sb-label">Model <span className="sb-req">required</span></label>
            <select className="sb-input" value={model} onChange={e => setModel(e.target.value)}>
              <option value="claude-haiku-4-5">Haiku 4.5 — fast (quick, repetitive, high-volume tasks)</option>
              <option value="claude-sonnet-4-6">Sonnet 4.6 — balanced (recommended default)</option>
              <option value="claude-opus-4-8">Opus 4.8 — most capable (complex reasoning, long documents)</option>
            </select>
            <div className="sb-hint">
              Which Forcepoint Intelligence Platform model the skill is authored for. When in doubt, choose Sonnet 4.6 — it handles the majority of skill types well. Only escalate to Opus 4.8 if Sonnet's output consistently falls short on a complex task.
            </div>
          </div>

          <div className="sb-field">
            <label className="sb-label">Deprecation criteria <span className="sb-opt">optional</span></label>
            <input type="text" className="sb-input" placeholder="If schema changes >20% of cached columns" value={deprecText} onChange={e => setDeprecText(e.target.value)} />
          </div>
        </div>

        {error && <div className="sb-validation sb-val-error">{error}</div>}

        <div className="sb-modal-actions">
          <button type="button" className="sb-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="sb-btn-primary" onClick={generate}>
            Generate &amp; add
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── README MODAL ───────────────────────────────────────────
// Like ManifestModal, the README generator inherits identity (owner email)
// and token-efficiency numbers from the parent so the submitter doesn't
// re-enter them. Usage description seeds from the Step 1 intent.
function ReadmeModal({
  skillName, version, ownerEmail,
  defaultUsage = '',
  baseTokens, setBaseTokens,
  skillTokens, setSkillTokens,
  onSave, onClose,
}) {
  const today = new Date().toISOString().split('T')[0]
  const [covers,   setCovers]   = useState('')
  const [deferred, setDeferred] = useState('')
  const [usage,    setUsage]    = useState(defaultUsage)
  const [error,    setError]    = useState('')

  const generate = () => {
    if (!covers.trim()) { setError('Please describe what this skill covers.'); return }

    const bulletList = text =>
      text.split('\n').map(l => l.trim()).filter(Boolean).map(l => `- ${l}`).join('\n')

    const tokenSection = baseTokens && skillTokens
      ? `\n## Token efficiency\n\n| Metric | Value |\n| --- | --- |\n| Baseline (no skill) | ~${parseInt(baseTokens).toLocaleString()} tokens |\n| With skill | ~${parseInt(skillTokens).toLocaleString()} tokens |\n| Reduction | ${Math.round((1 - parseInt(skillTokens) / parseInt(baseTokens)) * 100)}% |\n`
      : ''

    const md = `# ${skillName} v${version}\n\n**Authored by:** ${ownerEmail}  \n**Date:** ${today}  \n**Owner:** ${ownerEmail}\n\n## What this skill covers\n\n${bulletList(covers)}\n${deferred.trim() ? `\n## What is NOT in v${version.split('.')[0]} (deferred)\n\n${bulletList(deferred)}\n` : ''}${usage.trim() ? `\n## Usage\n\n${usage.trim()}\n` : ''}${tokenSection}\n## Review cadence\n\nQuarterly.\n`
    onSave(md)
  }

  return (
    <div className="sb-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sb-modal sb-modal-form">
        <div className="sb-modal-form-head">
          <FileIcon size={18} className="sb-modal-form-icon" />
          <div>
            <h3 className="sb-modal-title">Generate README.md</h3>
            <p className="sb-modal-sub">Human-readable summary for {skillName || 'your skill'} v{version}</p>
          </div>
          <button type="button" className="sb-modal-x" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <div className="sb-modal-body-grid">
          {ownerEmail && (
            <div className="sb-modal-owner">
              <span className="sb-modal-owner-label">Authored by</span>
              <strong>{ownerEmail}</strong>
              <span className="sb-modal-owner-hint">from your Forcepoint sign-in</span>
            </div>
          )}
          <div className="sb-field">
            <label className="sb-label">What this skill covers <span className="sb-req">required</span></label>
            <textarea className="sb-input" rows={4} placeholder={"Cached Opportunity and Account schemas\nAll picklist values for StageName\nSeven pre-baked query templates"} value={covers} onChange={e => setCovers(e.target.value)} />
            <div className="sb-hint">One item per line — each becomes a bullet point.</div>
          </div>
          <div className="sb-field">
            <label className="sb-label">Deferred to a future version <span className="sb-opt">optional</span></label>
            <textarea className="sb-input" rows={3} placeholder={"Product2 and PricebookEntry schemas\nCampaign and Lead schemas"} value={deferred} onChange={e => setDeferred(e.target.value)} />
            <div className="sb-hint">One item per line.</div>
          </div>
          <div className="sb-field">
            <label className="sb-label">Usage description <span className="sb-opt">optional</span></label>
            <textarea className="sb-input" rows={2} placeholder="Triggered automatically when queries involve the keywords in manifest.json…" value={usage} onChange={e => setUsage(e.target.value)} />
            <div className="sb-hint">Pre-filled from your Step 1 intent — tweak if the README needs a different angle.</div>
          </div>
          <div className="sb-row-2">
            <div className="sb-field">
              <label className="sb-label">Baseline tokens <span className="sb-opt">optional</span></label>
              <input type="number" className="sb-input" placeholder="22000" value={baseTokens} onChange={e => setBaseTokens(e.target.value)} />
            </div>
            <div className="sb-field">
              <label className="sb-label">Skill tokens <span className="sb-opt">optional</span></label>
              <input type="number" className="sb-input" placeholder="3000" value={skillTokens} onChange={e => setSkillTokens(e.target.value)} />
              {baseTokens && skillTokens && parseInt(baseTokens) > 0 && (
                <div className="sb-hint sb-hint-ok">
                  → {Math.round((1 - parseInt(skillTokens) / parseInt(baseTokens)) * 100)}% reduction
                </div>
              )}
            </div>
          </div>
          <div className="sb-hint" style={{ marginTop: -6 }}>Token numbers are shared with the manifest — edit them in either modal and both stay in sync.</div>
        </div>

        {error && <div className="sb-validation sb-val-error">{error}</div>}

        <div className="sb-modal-actions">
          <button type="button" className="sb-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="sb-btn-primary" onClick={generate}>
            Generate &amp; add
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PIPELINE STATUS PILL ───────────────────────────────────
function StatusPill({ state, label }) {
  const tone = state === 'pass' ? 'pass' : state === 'fail' ? 'fail' : state === 'running' ? 'running' : 'queued'
  return <span className={`ss-pipe-status tone-${tone}`}>{label}</span>
}

// ── PIPELINE NOTE — replaces dangerouslySetInnerHTML usage ──
function PipelineNote({ kind, children }) {
  return <div className={`ss-note ss-note-${kind}`}>{children}</div>
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function SkillSubmit({ open, onOpenChange, prefill, onPrefillConsumed, user }) {
  const fileInputRef = useRef(null)

  // Support both controlled (open + onOpenChange from parent) and uncontrolled use.
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = (next) => {
    const value = typeof next === 'function' ? next(isOpen) : next
    if (isControlled) onOpenChange?.(value)
    else setInternalOpen(value)
  }
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [dept,      setDept]      = useState('')
  const [pat,       setPat]       = useState('')
  const [intent,    setIntent]    = useState('')
  const [skillName, setSkillName] = useState('')
  const [version,   setVersion]   = useState('1.0')
  // ── Iris MVP enrichments (AI-471) — optional context that feeds the PR body
  const [tier,      setTier]      = useState('')
  const [useCase,   setUseCase]   = useState('')

  // ── Identity pre-fill from Okta (AI-468) — name and email come straight
  // from the SSO session so the submitter isn't re-typing what we already
  // know. They can still override (e.g. preferred form of their name).
  useEffect(() => {
    if (user?.name  && !name)  setName(user.name)
    if (user?.email && !email) setEmail(user.email)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // File inventory: each slot = { content, filename, source } | null
  const [inventory, setInventory] = useState({ manifest: null, readme: null, skillMd: null })
  const [dragOver,  setDragOver]  = useState(false)

  // Token efficiency lives at the parent so both the manifest and the README
  // generator see the same numbers — typing them once is enough.
  const [baseTokens,  setBaseTokens]  = useState('')
  const [skillTokens, setSkillTokens] = useState('')

  const [showManifest, setShowManifest] = useState(false)
  const [showReadme,   setShowReadme]   = useState(false)

  const [valMsg,         setValMsg]         = useState(null)
  const [infoMsg,        setInfoMsg]        = useState(null)
  const [submitted,      setSubmitted]      = useState(false)
  const [refNum,         setRefNum]         = useState('')
  const [pipeSteps,      setPipeSteps]      = useState(PIPELINE_STEPS.map(() => ({ state: 'queued', label: 'queued' })))
  const [pipeNotes,      setPipeNotes]      = useState([])
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [prResult,       setPrResult]       = useState(null)

  // Apply a draft handed off from the skill creator. Fires once per payload —
  // the parent clears the prefill via onPrefillConsumed so this effect doesn't
  // re-overwrite the form when the user edits a field. PAT is intentionally
  // not prefilled: it's per-submission and never persisted.
  useEffect(() => {
    if (!prefill) return
    if (prefill.submitter) {
      if (prefill.submitter.name)  setName(prefill.submitter.name)
      if (prefill.submitter.email) setEmail(prefill.submitter.email)
      if (prefill.submitter.dept)  setDept(prefill.submitter.dept)
    }
    if (prefill.intent)    setIntent(prefill.intent)
    if (prefill.name)      setSkillName(prefill.name)
    if (prefill.version)   setVersion(prefill.version)
    if (prefill.inventory) setInventory(prev => ({ ...prev, ...prefill.inventory }))
    setValMsg(null)
    setInfoMsg('Draft loaded from the skill creator. Add your GitHub token and submit.')
    onPrefillConsumed?.()
  }, [prefill, onPrefillConsumed])

  const setStep = (idx, state, label) =>
    setPipeSteps(steps => steps.map((s, i) => i === idx ? { state, label } : s))

  const readText = file => new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = e => res(e.target.result)
    r.onerror = rej
    r.readAsText(file)
  })

  const ingestFiles = async (fileList) => {
    const sName = skillName.trim()
    const updates = {}
    for (const file of fileList) {
      const lower = file.name.toLowerCase()
      if (lower.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file).catch(() => null)
        if (!zip) { setValMsg('Could not read ZIP file.'); continue }
        for (const entry of Object.values(zip.files)) {
          if (entry.dir) continue
          const fname   = entry.name.split('/').pop()
          const content = await entry.async('string')
          classifyFile(fname, content, 'uploaded', updates, sName)
        }
        continue
      }
      const content = await readText(file).catch(() => null)
      if (content !== null) classifyFile(file.name, content, 'uploaded', updates, sName)
    }
    if (Object.keys(updates).length) {
      setInventory(prev => ({ ...prev, ...updates }))
      setValMsg(null)
    }
  }

  const classifyFile = (fname, content, source, updates, sName) => {
    if (fname === 'manifest.json')                            updates.manifest = { content, filename: fname, source }
    else if (fname === 'README.md')                           updates.readme   = { content, filename: fname, source }
    else if (fname.endsWith('.md') && fname !== 'README.md')  updates.skillMd  = { content, filename: fname, source }
  }

  const onDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) await ingestFiles(Array.from(e.dataTransfer.files))
  }

  const onPickFiles = async (e) => {
    if (e.target.files.length) {
      await ingestFiles(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const removeSlot = (slot) =>
    setInventory(prev => ({ ...prev, [slot]: null }))

  const validateForm = () => {
    if (!name.trim())                                          { setValMsg('Full name is required.'); return false }
    if (!email.trim() || !email.includes('@forcepoint.com'))   { setValMsg('A valid @forcepoint.com email is required.'); return false }
    if (!dept)                                                 { setValMsg('Please select your department.'); return false }
    if (!pat.trim())                                           { setValMsg('GitHub personal access token is required.'); return false }
    if (!intent.trim() || intent.trim().length < 20)           { setValMsg('Please describe what the skill does (at least 20 characters).'); return false }
    if (!skillName.trim())                                     { setValMsg('Skill name is required.'); return false }
    if (!/^[a-z0-9-]+$/.test(skillName.trim()))                { setValMsg('Skill name must be lowercase letters, numbers, and hyphens only.'); return false }
    if (!version.trim() || !/^\d+\.\d+(\.\d+)?$/.test(version.trim())) { setValMsg('Version must be in major.minor or major.minor.patch format (e.g. 1.0 or 1.0.3).'); return false }
    if (!inventory.manifest || !inventory.readme || !inventory.skillMd) {
      setValMsg('All three files are required. Use the Generate buttons to create any that are missing.')
      return false
    }
    return true
  }

  const submit = async () => {
    setInfoMsg(null)
    if (!validateForm()) return
    setValMsg('Verifying your GitHub identity…')
    const identity = await verifyGitHubIdentity(pat.trim(), email.trim())
    if (!identity.ok) { setValMsg(identity.error); return }
    setValMsg(null)

    // Two refs: legacy SKL-* (kept for backward compatibility with anything
    // that already references it) and an IRIS-* tracking ref (AI-471) that
    // matches the format the low-friction /api/iris-intake endpoint emits,
    // so submitters across both paths quote the same shape of identifier.
    const ref     = 'SKL-' + Date.now().toString(36).toUpperCase().slice(-6)
    const irisRef = 'IRIS-' + Date.now().toString(36).toUpperCase() +
                    '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const sName = skillName.trim()
    const sVer  = version.trim()
    setRefNum(ref)
    setSubmitted(true)
    setSubmitDisabled(true)
    setValMsg(null)
    setPrResult(null)
    setPipeNotes([
      { kind: 'meta', name, dept, email, sName, sVer, time: new Date().toLocaleString() },
    ])

    const run = async (idx, checkFn, ...args) => {
      setStep(idx, 'running', 'scanning…')
      await pause(550)
      const result = await checkFn(...args)
      await pause(700)
      if (!result.ok) {
        setStep(idx, 'fail', 'failed')
        setPipeNotes(n => [...n, { kind: 'fail', label: PIPELINE_STEPS[idx].label, detail: PIPELINE_STEPS[idx].detail, error: result.error }])
        return false
      }
      setStep(idx, 'pass', 'pass')
      setPipeNotes(n => [...n, { kind: 'pass', label: PIPELINE_STEPS[idx].label, detail: PIPELINE_STEPS[idx].detail }])
      return true
    }

    if (!await run(0, checkSecurity,   inventory))             return
    if (!await run(1, checkCompliance, inventory))             return
    if (!await run(2, checkDlp,        inventory))             return
    if (!await run(3, checkDocQuality, inventory, sName))      return

    setStep(4, 'running', 'assigned')
    setStep(5, 'running', 'uploading…')
    const committer = `${name} (${dept}) <${email}>`
    const result    = await pushInventoryToGitHub(sName, sVer, inventory, committer, intent.trim(), pat.trim(),
      { irisRef, tier: tier || null, useCase: useCase.trim() || null })

    if (!result.ok) {
      setSubmitted(false)
      setSubmitDisabled(false)
      setPipeSteps(PIPELINE_STEPS.map(() => ({ state: 'queued', label: 'queued' })))
      setPipeNotes([])
      setValMsg(`GitHub upload failed: ${result.error}`)
      return
    }

    setStep(4, 'pass', 'assigned')
    setStep(5, 'pass', `PR #${result.prNumber}`)
    setPrResult({ ...result, ref, irisRef, tier, useCase, name, dept, sName, sVer })
    setSubmitDisabled(false)
  }

  const resetForNewSubmission = () => {
    setIntent('')
    setSkillName('')
    setVersion('1.0')
    setInventory({ manifest: null, readme: null, skillMd: null })
    setSubmitted(false)
    setSubmitDisabled(false)
    setRefNum('')
    setPipeSteps(PIPELINE_STEPS.map(() => ({ state: 'queued', label: 'queued' })))
    setPipeNotes([])
    setPrResult(null)
    setValMsg(null)
    setInfoMsg(null)
  }

  const sName = skillName.trim()
  const slots = [
    { key: 'manifest', filename: 'manifest.json',                            label: 'Machine-readable metadata', Icon: FileJsonIcon, canCreate: true,  onCreate: () => setShowManifest(true) },
    { key: 'readme',   filename: 'README.md',                                label: 'Human-readable summary',    Icon: FileIcon,     canCreate: true,  onCreate: () => setShowReadme(true) },
    { key: 'skillMd',  filename: sName ? `${sName}.md` : '{skill-name}.md',  label: 'Skill content file',        Icon: FileCodeIcon, canCreate: false, onCreate: null },
  ]

  const allPresent = inventory.manifest && inventory.readme && inventory.skillMd

  return (
    <>
      <div className="skill-submit-wrap">
        <button
          type="button"
          className={`skill-submit-header${isOpen ? ' is-open' : ''}`}
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
        >
          <div className="ss-header-left">
            <div className="ss-header-icon">
              <UploadCloudIcon size={16} />
            </div>
            <div className="ss-header-text">
              <div className="ss-header-title">Submit a skill for enterprise review</div>
              <div className="ss-header-sub">Upload or generate the three required files — auto-enters the governance pipeline</div>
            </div>
          </div>
          <div className="ss-header-right">
            <span className="badge badge-policy">Governance</span>
            <ChevronDown size={16} className={`ss-chevron${isOpen ? ' open' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="skill-submit-body">

            {/* Step 1 */}
            <div className={`ss-section${submitted ? ' is-locked' : ''}`}>
              <div className="ss-step-head">
                <span className="ss-step-num">1</span>
                <div className="ss-step-text">
                  <div className="ss-step-label">Submitter information</div>
                  <div className="ss-step-sub">Tells the architecture review team who to contact and which department this skill comes from.</div>
                </div>
              </div>

              {/* Identity pill (AI-468) — confirms the Okta-signed-in user
                  who will be attributed on the PR. Pre-fills name + email
                  in the inputs below; the submitter can still edit either. */}
              {user?.email && (
                <div className="ss-identity">
                  <div className="ss-identity-pill">
                    <CheckIcon size={12} />
                    Signed in as <strong>{user.email}</strong>
                    <span className="ss-identity-provider">
                      {user.provider === 'okta' ? 'Okta SSO' : 'Dev session'}
                    </span>
                  </div>
                </div>
              )}

              {/* All Step 1 inputs share one 12-col grid so multi-column
                  rows (Name/Email/Department, Trust tier/Use case) line up
                  with the full-width rows (PAT, Intent). Trust tier + Use
                  case sit in the main grid rather than hidden behind a
                  toggle — they're clearly marked optional and short enough
                  that always-visible is cleaner than a disclosure click. */}
              <div className="ss-form-grid ss-form-grid-12">
                <div className="sb-field" style={{ gridColumn: 'span 4' }}>
                  <label className="sb-label">Full name</label>
                  <input type="text" className="sb-input" placeholder={user?.name || 'Jane Smith'} value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="sb-field" style={{ gridColumn: 'span 4' }}>
                  <label className="sb-label">Forcepoint email</label>
                  <input type="email" className="sb-input" placeholder={user?.email || 'jane.smith@forcepoint.com'} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="sb-field" style={{ gridColumn: 'span 4' }}>
                  <label className="sb-label">Department</label>
                  <select className="sb-input" value={dept} onChange={e => setDept(e.target.value)}>
                    <option value="">Select department…</option>
                    {['Sales','Engineering','Customer Support','Human Resources','Finance','Legal','Marketing','IT / Enterprise AI','Security','Other'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="sb-field" style={{ gridColumn: 'span 12' }}>
                  <label className="sb-label">
                    GitHub personal access token <span className="sb-opt">used once per submission, not stored</span>
                  </label>
                  <div className="sb-input-row">
                    <input
                      type="password"
                      className="sb-input"
                      placeholder="Paste your Enterprise GitHub PAT"
                      value={pat}
                      onChange={e => setPat(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <a
                      className="sb-input-action"
                      href={`${GITHUB_CONFIG.HOST}/settings/tokens/new?scopes=repo,user:email&description=Forcepoint%20Enterprise%20AI%20-%20Skill%20Submit`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open GitHub Enterprise in a new tab to mint a token"
                    >
                      <GithubIcon size={13} />
                      Generate PAT
                    </a>
                  </div>
                  <div className="sb-hint">
                    Required scopes: <code className="ss-code">repo</code> + <code className="ss-code">user:email</code>. Validated against your Forcepoint email before any commit; never stored or sent off-host.
                  </div>
                </div>

                <div className="sb-field" style={{ gridColumn: 'span 12' }}>
                  <label className="sb-label">What does this skill do?</label>
                  <textarea className="sb-input" rows={3} placeholder="Describe the problem this skill solves, who will use it, and what data or systems it accesses…" value={intent} onChange={e => setIntent(e.target.value)} />
                  <div className="sb-hint">Becomes the body of the GitHub PR. Aim for 1–2 paragraphs.</div>
                </div>

                <div className="sb-field" style={{ gridColumn: 'span 4' }}>
                  <label className="sb-label">Trust tier <span className="sb-opt">optional</span></label>
                  <select className="sb-input" value={tier} onChange={e => setTier(e.target.value)}>
                    <option value="">Not yet decided</option>
                    <option>T1 — Personal</option>
                    <option>T2 — Team</option>
                    <option>T3 — Department</option>
                    <option>T4 — Enterprise</option>
                  </select>
                  <div className="sb-hint">Where this skill sits on the trust scale. Reviewers use it for routing.</div>
                </div>
                <div className="sb-field" style={{ gridColumn: 'span 8' }}>
                  <label className="sb-label">Use case / business value <span className="sb-opt">optional</span></label>
                  <textarea className="sb-input" rows={2} placeholder="Who benefits and how — even one line helps triage." value={useCase} onChange={e => setUseCase(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`ss-section${submitted ? ' is-locked' : ''}`}>
              <div className="ss-step-head">
                <span className="ss-step-num">2</span>
                <div className="ss-step-text">
                  <div className="ss-step-label">Skill identity &amp; files</div>
                  <div className="ss-step-sub">
                    Three files will be committed to{' '}
                    <code className="ss-code">skills/{sName || '{name}'}/v{version}/</code>
                    {' '}on a new branch and opened as a pull request.
                  </div>
                </div>
              </div>

              <div className="ss-form-grid ss-form-grid-12">
                <div className="sb-field" style={{ gridColumn: 'span 8' }}>
                  <label className="sb-label">Skill name <span className="sb-opt">lowercase, hyphens only</span></label>
                  <input type="text" className="sb-input" placeholder="e.g. jira-connector" value={skillName} onChange={e => setSkillName(e.target.value)} />
                </div>
                <div className="sb-field" style={{ gridColumn: 'span 4' }}>
                  <label className="sb-label">Version</label>
                  <input type="text" className="sb-input" placeholder="1.0" value={version} onChange={e => setVersion(e.target.value)} />
                </div>
              </div>

              {/* File inventory */}
              <div className="ss-inventory">
                {/* Drop zone */}
                <div
                  className={`ss-dropzone${dragOver ? ' drag-over' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                >
                  <UploadCloudIcon size={22} className="ss-drop-icon" />
                  <div className="ss-drop-title">Drop files or a ZIP here</div>
                  <div className="ss-drop-sub">Accepts <code>.zip</code>, <code>.md</code>, <code>manifest.json</code> — or generate any missing file below</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".zip,.md,.json"
                    style={{ display: 'none' }}
                    onChange={onPickFiles}
                  />
                </div>

                {/* Required file slots */}
                <ul className="ss-slots" aria-label="Required files">
                  {slots.map(slot => {
                    const item = inventory[slot.key]
                    const SlotIcon = slot.Icon
                    return (
                      <li key={slot.key} className={`ss-slot${item ? ' is-filled' : ''}`}>
                        <div className="ss-slot-left">
                          <span className={`ss-slot-state${item ? ' ok' : ''}`} aria-hidden="true">
                            {item ? <CheckIcon size={12} /> : <span className="ss-slot-dot" />}
                          </span>
                          <SlotIcon size={16} className="ss-slot-file-icon" />
                          <div className="ss-slot-text">
                            <div className="ss-slot-name">{slot.filename}</div>
                            <div className="ss-slot-meta">
                              {item
                                ? `${item.source === 'generated' ? 'Generated' : 'Uploaded'} · ${(item.content.length / 1024).toFixed(1)} KB`
                                : slot.label}
                            </div>
                          </div>
                        </div>
                        <div className="ss-slot-actions">
                          {item ? (
                            <button type="button" className="sb-btn-ghost sb-btn-xs" onClick={() => removeSlot(slot.key)}>
                              <XIcon size={11} />
                              Remove
                            </button>
                          ) : slot.canCreate ? (
                            <button
                              type="button"
                              className="sb-btn-primary sb-btn-xs"
                              onClick={slot.onCreate}
                              disabled={!sName}
                              title={!sName ? 'Enter a skill name first' : 'Open generator'}
                            >
                              <PlusIcon size={11} />
                              Generate
                            </button>
                          ) : (
                            <span className="ss-slot-empty">{sName ? 'Upload above' : 'Enter skill name first'}</span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="ss-info">
                <InfoIcon size={14} className="ss-info-icon" />
                <span>
                  Files are committed to <code className="ss-code">skills/{sName || '{name}'}/v{version}/</code>{' '}
                  on branch <code className="ss-code">skill/{sName || '{name}'}/v{version}</code>.
                  Reviewed within 3 business days. See{' '}
                  <a href={`${GITHUB_CONFIG.HOST}/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
                    CONTRIBUTING.md
                  </a>.
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="ss-actions">
              {infoMsg && <div className="sb-validation sb-val-ok">{infoMsg}</div>}
              {valMsg && <div className="sb-validation sb-val-error">{valMsg}</div>}
              {prResult ? (
                <button
                  type="button"
                  className="sb-btn-primary sb-btn-lg"
                  onClick={resetForNewSubmission}
                >
                  <PlusIcon size={14} />
                  Submit another skill
                </button>
              ) : (
                <button
                  type="button"
                  className="sb-btn-primary sb-btn-lg"
                  disabled={submitDisabled}
                  onClick={allPresent ? submit : () => fileInputRef.current?.click()}
                >
                  {submitDisabled ? (
                    'Running governance pipeline…'
                  ) : allPresent ? (
                    <>
                      Submit to governance pipeline
                      <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon size={14} />
                      Add all three files to submit
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pipeline tracker */}
            {submitted && (
              <div className="ss-pipeline">
                <div className="ss-pipeline-head">
                  <div className="ss-pipeline-title">Governance pipeline</div>
                  <code className="ss-pipeline-ref">{refNum}</code>
                </div>

                <div className="ss-pipeline-track">
                  {PIPELINE_STEPS.map((step, i) => {
                    const StepIcon = step.Icon
                    const state = pipeSteps[i].state
                    return (
                      <Fragment key={step.id}>
                        <div className={`ss-pipe-step state-${state}`}>
                          <div className="ss-pipe-icon">
                            <StepIcon size={16} />
                          </div>
                          <div className="ss-pipe-label">{step.label}</div>
                          <StatusPill state={state} label={pipeSteps[i].label} />
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && <span className="ss-pipe-arrow" aria-hidden="true">›</span>}
                      </Fragment>
                    )
                  })}
                </div>

                <div className="ss-pipeline-notes">
                  {pipeNotes.map((n, i) => {
                    if (n.kind === 'meta') return (
                      <PipelineNote key={i} kind="meta">
                        Submitted by <strong>{n.name}</strong> ({n.dept}) · {n.email} ·{' '}
                        <code className="ss-code">{n.sName} v{n.sVer}</code> · {n.time}
                      </PipelineNote>
                    )
                    if (n.kind === 'pass') return (
                      <PipelineNote key={i} kind="pass">
                        <CheckIcon size={12} /> <strong>{n.label}</strong> — {n.detail}
                      </PipelineNote>
                    )
                    if (n.kind === 'fail') return (
                      <PipelineNote key={i} kind="fail">
                        <XIcon size={12} /> <strong>{n.label}</strong> — {n.error}
                      </PipelineNote>
                    )
                    return null
                  })}

                  {prResult && (
                    <div className="ss-success-card">
                      <div className="ss-success-head">
                        <CheckIcon size={14} />
                        All checks passed — pull request opened
                      </div>
                      <a className="ss-success-link" href={prResult.prUrl} target="_blank" rel="noreferrer">
                        <GithubIcon size={14} />
                        {prResult.prUrl}
                      </a>

                      {/* Iris tracking ref (AI-471) — human-readable handle
                          submitters can quote when chasing status, matching
                          the shape emitted by /api/iris-intake. */}
                      {prResult.irisRef && (
                        <div className="ss-success-ref">
                          <span className="ss-success-ref-label">Tracking reference</span>
                          <code className="ss-success-ref-value">{prResult.irisRef}</code>
                        </div>
                      )}

                      <div className="ss-success-meta">
                        Branch <code className="ss-code">skill/{prResult.sName}/v{prResult.sVer}</code> →{' '}
                        <code className="ss-code">main</code>
                        {prResult.tier ? <>{' · '}Tier <strong>{prResult.tier}</strong></> : null}
                        {' · '}PR Reference <strong>{prResult.ref}</strong>
                        {' · '}<a href="https://forcepoint.atlassian.net/jira/software/c/projects/AI/boards/4837" target="_blank" rel="noreferrer">Track in AI Jira board</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals — owner email, description/usage, and token numbers all
          flow through from the Step 1 form so the submitter doesn't re-type
          anything they've already filled in. */}
      {showManifest && (
        <ManifestModal
          skillName={sName}
          version={version}
          ownerEmail={email}
          defaultDescription={intent.trim()}
          baseTokens={baseTokens}    setBaseTokens={setBaseTokens}
          skillTokens={skillTokens}  setSkillTokens={setSkillTokens}
          onSave={content => { setInventory(p => ({ ...p, manifest: { content, filename: 'manifest.json', source: 'generated' } })); setShowManifest(false) }}
          onClose={() => setShowManifest(false)}
        />
      )}
      {showReadme && (
        <ReadmeModal
          skillName={sName}
          version={version}
          ownerEmail={email}
          defaultUsage={intent.trim()}
          baseTokens={baseTokens}    setBaseTokens={setBaseTokens}
          skillTokens={skillTokens}  setSkillTokens={setSkillTokens}
          onSave={content => { setInventory(p => ({ ...p, readme: { content, filename: 'README.md', source: 'generated' } })); setShowReadme(false) }}
          onClose={() => setShowReadme(false)}
        />
      )}
    </>
  )
}
