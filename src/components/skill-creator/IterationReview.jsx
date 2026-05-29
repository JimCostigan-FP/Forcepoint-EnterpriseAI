import { CheckIcon, XIcon, ArrowRight, ChevronLeft, TrendUp } from '../ui/icons.jsx'

// Stage 4 — Review iteration results. The /skill-creator skill puts a
// human-review step between each test pass and any further edits; this is
// that surface. If the submitter has failing cases, nudge them to iterate.
// If everything passes, let them advance to submit.

export default function IterationReview({
  iteration, cases, previousPassRate,
  onIterate, onAdvance,
}) {
  const ran    = cases.filter(c => c.result)
  const passes = cases.filter(c => c.judgement === 'pass')
  const fails  = cases.filter(c => c.judgement === 'fail')
  const passRate = ran.length ? (passes.length / ran.length) : 0
  const delta    = previousPassRate == null ? null : (passRate - previousPassRate)

  return (
    <div className="sc-iter">
      <div className="sc-iter-head">
        <div className="sc-iter-title">Iteration {iteration} review</div>
        <div className="sc-iter-sub">
          A skill that works on a few prompts but not others isn't ready. Decide whether to revise the draft and re-test, or hand it off as-is.
        </div>
      </div>

      <div className="sc-iter-stats">
        <div className="sc-iter-stat">
          <div className="sc-iter-stat-val">{passes.length}</div>
          <div className="sc-iter-stat-label">Pass</div>
        </div>
        <div className="sc-iter-stat">
          <div className="sc-iter-stat-val">{fails.length}</div>
          <div className="sc-iter-stat-label">Fail</div>
        </div>
        <div className="sc-iter-stat">
          <div className="sc-iter-stat-val">{Math.round(passRate * 100)}%</div>
          <div className="sc-iter-stat-label">
            Pass rate
            {delta != null && (
              <span className={`sc-iter-delta${delta >= 0 ? ' up' : ' down'}`}>
                <TrendUp size={10} />
                {delta >= 0 ? '+' : ''}{Math.round(delta * 100)} pts
              </span>
            )}
          </div>
        </div>
      </div>

      {fails.length > 0 && (
        <div className="sc-iter-fails">
          <div className="sc-iter-fails-title">Prompts that didn't land</div>
          <ul className="sc-iter-fails-list">
            {fails.map(c => (
              <li key={c.id} className="sc-iter-fail">
                <div className="sc-iter-fail-prompt">"{c.prompt}"</div>
                {c.note && <div className="sc-iter-fail-note">→ {c.note}</div>}
                {!c.note && (
                  <div className="sc-iter-fail-hint">
                    {c.result?.verdict === 'would-not-trigger'
                      ? 'Triggers didn\'t match — consider adding terms from this prompt to the draft.'
                      : 'Response missed the mark — refine the purpose / connection sections.'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fails.length === 0 && passes.length > 0 && (
        <div className="sc-iter-clean">
          <CheckIcon size={14} className="sc-iter-clean-icon" />
          Every prompt you judged passed. Hand off when you're ready.
        </div>
      )}

      <div className="sc-iter-actions">
        <button
          type="button"
          className="sb-btn-ghost"
          onClick={onIterate}
        >
          <ChevronLeft size={13} />
          Revise the draft
        </button>
        <button
          type="button"
          className="sb-btn-primary"
          onClick={onAdvance}
          disabled={passes.length === 0}
        >
          Continue to submit
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
