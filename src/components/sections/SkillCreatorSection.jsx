import { useEffect, useMemo, useState } from 'react'
import Stepper           from '../skill-creator/Stepper.jsx'
import IntentCapture     from '../skill-creator/IntentCapture.jsx'
import SkillPreview      from '../skill-creator/SkillPreview.jsx'
import BatchTestHarness  from '../skill-creator/BatchTestHarness.jsx'
import IterationReview   from '../skill-creator/IterationReview.jsx'
import TierHint          from '../skill-creator/TierHint.jsx'
import SubmitHandoff     from '../skill-creator/SubmitHandoff.jsx'
import { ChevronLeft, ArrowRight } from '../ui/icons.jsx'
import { useIdentity } from '../../lib/identity.js'
import { telemetry } from '../../lib/telemetry.js'
import {
  buildSkillMarkdown, buildManifest, buildReadme,
  inferTier, deriveTriggers, slugify, TIERS,
} from '../../lib/skillTemplate.js'
import '../skill-creator/skillCreator.css'

const DEFAULT_VERSION = '1.0'

const STAGES = [
  { id: 'intent',  label: 'Capture intent', sub: 'Prompts & purpose' },
  { id: 'draft',   label: 'Draft skill',    sub: 'Assembled SKILL.md' },
  { id: 'test',    label: 'Test prompts',   sub: 'Run & judge' },
  { id: 'review',  label: 'Review',         sub: 'Iterate or ship' },
  { id: 'submit',  label: 'Submit',         sub: 'Hand off' },
]

function emptyCase(prompt = '') {
  return {
    id: `c-${Math.random().toString(36).slice(2, 9)}`,
    prompt,
    result: null,
    judgement: null,
    note: '',
  }
}

export default function SkillCreatorSection({ active, onShowSection, onHandoff }) {
  const identity = useIdentity()

  // Stage navigation. `furthest` is the highest stage the user has reached,
  // so the stepper can offer back/forward jumps without letting them skip
  // ahead past unfinished work.
  const [stage,    setStage]    = useState(0)
  const [furthest, setFurthest] = useState(0)

  // Stage 1 — captured intent
  const [intent,     setIntent]     = useState('')
  const [prompts,    setPrompts]    = useState(['', '', ''])
  const [connection, setConnection] = useState('')

  // Stage 2 — assembled draft
  const [name,    setName]    = useState('my-skill')
  const [version, setVersion] = useState(DEFAULT_VERSION)
  const [rawMd,   setRawMd]   = useState('')
  const [rawDirty, setRawDirty] = useState(false)

  // Stage 3/4 — test cases & iteration history
  const [cases,     setCases]     = useState([])
  const [iteration, setIteration] = useState(1)
  const [prevPass,  setPrevPass]  = useState(null)

  // Telemetry: fire draft_started when the section first becomes active,
  // and draft_abandoned on unmount if there is any captured work that
  // wasn't submitted. SkillSubmit clears prompts on handoff so we don't
  // double-count.
  useEffect(() => {
    if (!active) return
    telemetry.draftStarted({ surface: 'section' })
    return () => {
      const hasDraft = intent.trim() || prompts.some(p => p.trim()) || rawMd.trim()
      if (hasDraft) telemetry.draftAbandoned({ hadDraft: true, stage: STAGES[stage]?.id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Derive name slug from the intent's first phrase once, when the user
  // first advances past intent. After that they can edit it freely.
  const [nameTouched, setNameTouched] = useState(false)
  useEffect(() => {
    if (nameTouched) return
    if (stage < 1) return
    const guess = slugify(intent.split(/[.!?]/)[0] || 'my-skill') || 'my-skill'
    setName(guess)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // Re-assemble the markdown from intent + prompts whenever those change,
  // unless the user is hand-editing the raw view.
  const assembled = useMemo(() => {
    const triggers = deriveTriggers(prompts.filter(Boolean), intent)
    return buildSkillMarkdown({
      name,
      description: intent.trim() || 'No description yet — return to step 1.',
      triggers,
      sections: {
        purpose:    intent.trim(),
        connection: connection.trim(),
      },
    })
  }, [name, intent, prompts, connection])

  useEffect(() => {
    if (!rawDirty) setRawMd(assembled)
  }, [assembled, rawDirty])

  const tier = useMemo(() => inferTier({
    description: intent,
    sections: { purpose: intent, connection },
  }), [intent, connection])

  // When the user first reaches the test stage, seed cases from their intent
  // prompts. If they later revise and come back, keep their judgements but
  // wipe the cached `result` so they're forced to re-run.
  useEffect(() => {
    if (stage !== 2) return
    setCases(prev => {
      if (prev.length) {
        return prev.map(c => ({ ...c, result: null, judgement: null }))
      }
      const seeded = prompts.filter(p => p.trim().length > 0).map(p => emptyCase(p))
      return seeded.length ? seeded : [emptyCase()]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const goTo = (i) => {
    if (i > furthest) return
    setStage(i)
  }
  const advance = (to) => {
    const next = to ?? stage + 1
    setStage(next)
    setFurthest(f => Math.max(f, next))
  }

  const iterate = () => {
    // Capture pass rate so the next review can show delta.
    const ran    = cases.filter(c => c.result)
    const passes = cases.filter(c => c.judgement === 'pass').length
    setPrevPass(ran.length ? passes / ran.length : null)
    setIteration(n => n + 1)
    setStage(1) // back to draft
  }

  // Submission validation. Lifted from the prior version, plus a pass-rate
  // floor so the user can't ship a skill where every prompt failed.
  const passes = cases.filter(c => c.judgement === 'pass').length
  const ranAny = cases.some(c => c.result)
  const validation = [
    { ok: /^[a-z0-9-]+$/.test(name),                    label: 'Skill name uses lowercase letters, numbers, and hyphens.' },
    { ok: intent.trim().length >= 20,                   label: 'Intent is at least 20 characters.' },
    { ok: prompts.filter(p => p.trim()).length >= 3,    label: '3+ example prompts captured.' },
    { ok: rawMd.trim().length > 0,                      label: 'SKILL.md has content.' },
    { ok: ranAny && passes > 0,                         label: 'At least one test prompt was run and marked pass.' },
  ]
  const canSubmit = validation.every(v => v.ok)

  const handleSubmit = () => {
    const triggers = deriveTriggers(prompts.filter(Boolean), intent)
    const manifest = buildManifest({
      name, version,
      description: intent,
      triggers,
      ownerEmail: identity.email,
    })
    const readme = buildReadme({ name, version, description: intent, ownerEmail: identity.email })

    telemetry.draftSubmitted({ name, version, tier: tier.id, iteration, passes, runs: cases.length })

    // Clear local draft so the cleanup effect doesn't fire draft_abandoned
    // on top of draft_submitted.
    setIntent('')
    setPrompts(['', '', ''])
    setConnection('')
    setCases([])

    onHandoff?.({
      name, version,
      intent,
      ownerEmail: identity.email,
      submitter: { name: identity.name, email: identity.email, dept: identity.dept },
      inventory: {
        manifest: { content: manifest, filename: 'manifest.json', source: 'generated' },
        readme:   { content: readme,   filename: 'README.md',     source: 'generated' },
        skillMd:  { content: rawMd,    filename: `${name}.md`,    source: 'generated' },
      },
      provenance: {
        iteration,
        testCases: cases.map(c => ({
          prompt: c.prompt, verdict: c.result?.verdict, judgement: c.judgement, note: c.note,
        })),
      },
    })
  }

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="sc-page-head">
        <button
          type="button"
          className="link-btn sc-back"
          onClick={() => onShowSection('home')}
        >
          <ChevronLeft size={13} />
          Back to overview
        </button>
        <h2>Skill builder</h2>
        <p>
          Walk a vague idea to a submittable skill by starting with the prompts your users actually type. The builder pulls triggers, scope, and tone from those prompts, then loops you through draft, test, and review before the governance handoff.
        </p>
      </div>

      <div className="sc-identity">
        <span className="sc-identity-label">Submitter</span>
        <span className="sc-identity-name">{identity.name}</span>
        <span className="sc-identity-meta">{identity.email} · {identity.dept}</span>
        {identity.source === 'placeholder' && (
          <span className="badge badge-design">Placeholder · Okta TBD</span>
        )}
      </div>

      <Stepper
        stages={STAGES}
        active={stage}
        furthest={furthest}
        onJump={goTo}
      />

      <div className="sc-grid">
        <div className="sc-col sc-col-main">
          {stage === 0 && (
            <IntentCapture
              intent={intent}      onIntentChange={setIntent}
              prompts={prompts}    onPromptsChange={setPrompts}
              connection={connection} onConnectionChange={setConnection}
              onAdvance={() => advance(1)}
            />
          )}

          {stage === 1 && (
            <>
              <SkillPreview
                markdown={rawMd}
                onChange={(next) => { setRawMd(next); setRawDirty(true) }}
              />
              <div className="sc-stage-nav">
                <button type="button" className="sb-btn-ghost" onClick={() => goTo(0)}>
                  <ChevronLeft size={13} />
                  Back to intent
                </button>
                <button
                  type="button"
                  className="sb-btn-primary"
                  onClick={() => advance(2)}
                  disabled={rawMd.trim().length === 0}
                >
                  Test the draft
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}

          {stage === 2 && (
            <BatchTestHarness
              markdown={rawMd}
              cases={cases}
              onCasesChange={setCases}
              onTestRun={(payload) => telemetry.testRun({ ...payload, iteration })}
              onAdvance={() => advance(3)}
            />
          )}

          {stage === 3 && (
            <IterationReview
              iteration={iteration}
              cases={cases}
              previousPassRate={prevPass}
              onIterate={iterate}
              onAdvance={() => advance(4)}
            />
          )}

          {stage === 4 && (
            <SubmitHandoff
              canSubmit={canSubmit}
              validation={validation}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <div className="sc-col sc-col-side">
          <div className="sc-meta-card">
            <div className="sc-meta-row">
              <label className="sb-label">Skill name</label>
              <input
                type="text"
                className="sb-input"
                value={name}
                onChange={e => { setName(e.target.value); setNameTouched(true) }}
                placeholder="my-skill"
                spellCheck={false}
              />
            </div>
            <div className="sc-meta-row">
              <label className="sb-label">Version</label>
              <input
                type="text"
                className="sb-input"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1.0"
                spellCheck={false}
              />
            </div>
            <div className="sc-meta-foot">
              Iteration {iteration} · Stage {stage + 1} of {STAGES.length}
            </div>
          </div>

          <TierHint tier={tier} />

          <div className="sc-flags">
            <div className="sc-flag-title">v0 stubs (replace in v1)</div>
            <ul className="sc-flag-list">
              <li>Triggers are derived heuristically from your prompts.</li>
              <li>Test harness simulates trigger matching; no real Claude runtime.</li>
              <li>Tier is heuristic; final tier set in engineering review.</li>
              <li>Telemetry emits to console; real sink TBD.</li>
              <li>Submitter identity is placeholder until Okta SSO is wired.</li>
              <li>Submission reuses the existing GHE PR flow — no separate AI-471 endpoint exists yet.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export { TIERS }
