import { useState } from 'react'
import { FlaskIcon, PlayIcon, PlusIcon, CheckIcon, XIcon, ArrowRight } from '../ui/icons.jsx'

// Stage 3 — Run the example prompts (and any new ones) against the draft and
// have the submitter mark each as pass/fail. This is the loop the
// /skill-creator skill describes: don't trust a single output; check a
// portfolio of realistic prompts and capture qualitative judgement against
// each one. v0 simulates triggering via keyword match; v1 swaps in a real
// /skill-test endpoint.

function extractTriggers(markdown) {
  const m = markdown.match(/^triggers:\s*\[([^\]]*)\]/m)
  if (!m) return []
  return m[1].split(',').map(s => s.trim()).filter(Boolean)
}
function extractName(markdown) {
  const m = markdown.match(/^name:\s*(\S+)/m)
  return m ? m[1] : 'this-skill'
}

function simulate(markdown, prompt) {
  const triggers = extractTriggers(markdown)
  const lower = prompt.toLowerCase()
  const hits = triggers.filter(t => lower.includes(t.toLowerCase()))
  const name = extractName(markdown)

  if (!hits.length) {
    return {
      verdict: 'would-not-trigger',
      summary: `No triggers from \`${name}\` matched.`,
      detail:  `Configured triggers: ${triggers.join(', ') || '(none)'}.\nClaude would fall back to its default behavior.`,
    }
  }
  return {
    verdict: 'would-trigger',
    summary: `Skill \`${name}\` would activate.`,
    detail:  `Matched: ${hits.join(', ')}.\n\nSimulated response (v0 placeholder):\n"Consulting ${name}. I'd reach for the sections referenced in the SKILL.md before composing an answer."`,
  }
}

export default function BatchTestHarness({
  markdown,
  cases, onCasesChange,
  onTestRun,
  onAdvance,
}) {
  const [running, setRunning] = useState(false)

  const updateCase = (id, patch) => {
    onCasesChange(cases.map(c => c.id === id ? { ...c, ...patch } : c))
  }
  const addCase = () => {
    const id = `c-${Date.now()}`
    onCasesChange([...cases, { id, prompt: '', result: null, judgement: null, note: '' }])
  }
  const removeCase = (id) => {
    if (cases.length <= 1) return
    onCasesChange(cases.filter(c => c.id !== id))
  }

  const runOne = (id) => {
    const c = cases.find(x => x.id === id)
    if (!c || !c.prompt.trim()) return
    const result = simulate(markdown, c.prompt)
    onTestRun?.({ prompt: c.prompt, verdict: result.verdict })
    updateCase(id, { result })
  }
  const runAll = async () => {
    setRunning(true)
    const next = cases.map(c => {
      if (!c.prompt.trim()) return c
      const result = simulate(markdown, c.prompt)
      onTestRun?.({ prompt: c.prompt, verdict: result.verdict })
      return { ...c, result }
    })
    onCasesChange(next)
    setRunning(false)
  }

  const ranAny  = cases.some(c => c.result)
  const judged  = cases.filter(c => c.result && c.judgement)
  const allRunsJudged = ranAny && judged.length === cases.filter(c => c.result).length
  const canAdvance = ranAny && allRunsJudged

  return (
    <div className="sc-batch">
      <div className="sc-batch-head">
        <FlaskIcon size={14} className="sc-batch-icon" />
        <div>
          <div className="sc-batch-title">Test against your prompts</div>
          <div className="sc-batch-sub">
            Run each prompt and mark whether the result is what you'd want a user to see. v0 simulates the trigger check; the real Claude response is a v1 dependency.
          </div>
        </div>
        <button
          type="button"
          className="sb-btn-primary sc-batch-runall"
          onClick={runAll}
          disabled={running || cases.every(c => !c.prompt.trim())}
        >
          <PlayIcon size={11} />
          Run all
        </button>
      </div>

      <div className="sc-batch-list">
        {cases.map((c, i) => (
          <div key={c.id} className="sc-batch-case">
            <div className="sc-batch-case-head">
              <span className="sc-batch-case-num">Prompt {i + 1}</span>
              {cases.length > 1 && (
                <button
                  type="button"
                  className="sc-batch-case-remove"
                  onClick={() => removeCase(c.id)}
                  aria-label="Remove prompt"
                >
                  <XIcon size={11} />
                </button>
              )}
            </div>

            <textarea
              className="sb-input sc-batch-case-input"
              rows={2}
              value={c.prompt}
              onChange={e => updateCase(c.id, { prompt: e.target.value, result: null, judgement: null })}
              placeholder="Type a prompt you want this skill to handle…"
            />

            <div className="sc-batch-case-actions">
              <button
                type="button"
                className="sb-btn-ghost sb-btn-xs"
                onClick={() => runOne(c.id)}
                disabled={!c.prompt.trim()}
              >
                <PlayIcon size={10} />
                Run
              </button>

              {c.result && (
                <div className="sc-batch-case-judge">
                  <span className="sc-batch-case-judge-label">Looks right?</span>
                  <button
                    type="button"
                    className={`sc-batch-judge-btn sc-batch-judge-pass${c.judgement === 'pass' ? ' is-active' : ''}`}
                    onClick={() => updateCase(c.id, { judgement: 'pass' })}
                    aria-label="Mark as pass"
                  >
                    <CheckIcon size={11} />
                    Pass
                  </button>
                  <button
                    type="button"
                    className={`sc-batch-judge-btn sc-batch-judge-fail${c.judgement === 'fail' ? ' is-active' : ''}`}
                    onClick={() => updateCase(c.id, { judgement: 'fail' })}
                    aria-label="Mark as fail"
                  >
                    <XIcon size={11} />
                    Fail
                  </button>
                </div>
              )}
            </div>

            {c.result && (
              <div className={`sc-batch-case-result sc-test-result-${c.result.verdict}`}>
                <div className="sc-test-verdict">{c.result.summary}</div>
                <pre className="sc-test-detail">{c.result.detail}</pre>
              </div>
            )}

            {c.judgement === 'fail' && (
              <input
                type="text"
                className="sb-input sc-batch-case-note"
                value={c.note}
                onChange={e => updateCase(c.id, { note: e.target.value })}
                placeholder="What went wrong? (carries into the next iteration)"
              />
            )}
          </div>
        ))}

        <button type="button" className="sb-btn-ghost sc-batch-add" onClick={addCase}>
          <PlusIcon size={12} />
          Add another prompt
        </button>
      </div>

      <div className="sc-batch-foot">
        <div className="sc-batch-summary">
          {ranAny ? (
            <>
              <span className="sc-batch-stat sc-batch-stat-pass">
                {cases.filter(c => c.judgement === 'pass').length} pass
              </span>
              <span className="sc-batch-stat sc-batch-stat-fail">
                {cases.filter(c => c.judgement === 'fail').length} fail
              </span>
              <span className="sc-batch-stat">
                {cases.filter(c => c.result && !c.judgement).length} unjudged
              </span>
            </>
          ) : (
            <span className="sc-batch-stat">Run at least one prompt to advance.</span>
          )}
        </div>

        <button
          type="button"
          className="sb-btn-primary"
          onClick={onAdvance}
          disabled={!canAdvance}
        >
          Review iteration
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
