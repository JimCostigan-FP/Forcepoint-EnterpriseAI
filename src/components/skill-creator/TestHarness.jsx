import { useState } from 'react'
import { FlaskIcon, PlayIcon } from '../ui/icons.jsx'

// v0 test harness: deterministic. Matches trigger keywords against the
// sample prompt, echoes them back, and shows what "would" happen. The
// brief calls for a real runtime — v1 wires a /skill-test endpoint that
// accepts { skillBody, prompt } and returns Claude's response.

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
      summary: `No trigger keywords from \`${name}\` appeared in the prompt.`,
      detail:  `Configured triggers: ${triggers.join(', ') || '(none yet)'}.\nClaude would fall back to its default behavior.`,
    }
  }

  return {
    verdict: 'would-trigger',
    summary: `Skill \`${name}\` would activate.`,
    detail:  `Matched triggers: ${hits.join(', ')}.\n\nSample response (placeholder — real runtime is a v1 dependency):\n"Using the ${name} skill to answer this. Based on your description, I'd consult the cached schemas referenced in the SKILL.md before generating a query."`,
  }
}

export default function TestHarness({ markdown, onTestRun }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)

  const run = () => {
    const r = simulate(markdown, prompt)
    setResult(r)
    onTestRun?.({ prompt, verdict: r.verdict })
  }

  return (
    <div className="sc-test">
      <div className="sc-test-head">
        <FlaskIcon size={14} className="sc-test-icon" />
        <div>
          <div className="sc-test-title">Test harness</div>
          <div className="sc-test-sub">
            Fire a sample prompt at the draft before you submit. v0 is a static simulator — real Claude runtime is a v1 dependency.
          </div>
        </div>
      </div>

      <div className="sc-test-row">
        <textarea
          className="sb-input sc-test-input"
          rows={2}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="What's our Q4 pipeline by region?"
          aria-label="Sample prompt"
        />
        <button
          type="button"
          className="sb-btn-primary sc-test-run"
          onClick={run}
          disabled={!prompt.trim()}
        >
          <PlayIcon size={12} />
          Run
        </button>
      </div>

      {result && (
        <div className={`sc-test-result sc-test-result-${result.verdict}`}>
          <div className="sc-test-verdict">{result.summary}</div>
          <pre className="sc-test-detail">{result.detail}</pre>
        </div>
      )}
    </div>
  )
}
