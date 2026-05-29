import { useMemo } from 'react'
import { SparkleIcon, PlusIcon, XIcon, ArrowRight } from '../ui/icons.jsx'
import { deriveTriggers } from '../../lib/skillTemplate.js'

// Stage 1 — Capture intent from example prompts.
//
// The /skill-creator playbook starts here: instead of asking the submitter to
// list trigger keywords up front, we ask for 3-5 real prompts a user would
// type. Triggers, scope hints, and even the description tone fall out of
// those prompts. The submitter still confirms each piece before we move on.

const MIN_PROMPTS = 3
const MAX_PROMPTS = 8

export default function IntentCapture({
  intent, onIntentChange,
  prompts, onPromptsChange,
  connection, onConnectionChange,
  onAdvance,
}) {
  const suggestedTriggers = useMemo(
    () => deriveTriggers(prompts.filter(p => p.trim()), intent),
    [prompts, intent],
  )

  const updatePrompt = (i, value) => {
    const next = [...prompts]
    next[i] = value
    onPromptsChange(next)
  }
  const addPrompt = () => {
    if (prompts.length >= MAX_PROMPTS) return
    onPromptsChange([...prompts, ''])
  }
  const removePrompt = (i) => {
    if (prompts.length <= 1) return
    onPromptsChange(prompts.filter((_, idx) => idx !== i))
  }

  const filledPrompts = prompts.filter(p => p.trim().length > 10)
  const intentOk      = intent.trim().length >= 20
  const promptsOk     = filledPrompts.length >= MIN_PROMPTS
  const canAdvance    = intentOk && promptsOk

  return (
    <div className="sc-intent">
      <div className="sc-intent-head">
        <SparkleIcon size={14} className="sc-intent-icon" />
        <div>
          <div className="sc-intent-title">Capture intent</div>
          <div className="sc-intent-sub">
            Start with real prompts. The builder pulls triggers, scope, and tone from how your users actually phrase the ask — not from a keyword list you write in the abstract.
          </div>
        </div>
      </div>

      <div className="sc-intent-field">
        <label className="sb-label sc-intent-label">
          What should this skill enable?
          <span className="sc-intent-hint">One or two sentences. Who it's for, what it does.</span>
        </label>
        <textarea
          className="sb-input sc-intent-textarea"
          rows={2}
          value={intent}
          onChange={e => onIntentChange(e.target.value)}
          placeholder="Cut Salesforce query time for the Sales team by caching opportunity and account schemas so Claude can answer pipeline questions without a round trip."
        />
        <div className={`sc-intent-counter${intentOk ? ' ok' : ''}`}>
          {intent.trim().length} / 20 chars minimum
        </div>
      </div>

      <div className="sc-intent-field">
        <label className="sb-label sc-intent-label">
          Example prompts that should trigger this skill
          <span className="sc-intent-hint">
            Paste 3–5 prompts a real user would type. Concrete is better than generic — include file paths, column names, company context, casual phrasing.
          </span>
        </label>

        <div className="sc-intent-prompts">
          {prompts.map((p, i) => (
            <div key={i} className="sc-intent-prompt-row">
              <span className="sc-intent-prompt-num">{i + 1}</span>
              <textarea
                className="sb-input sc-intent-prompt-input"
                rows={2}
                value={p}
                onChange={e => updatePrompt(i, e.target.value)}
                placeholder={i === 0
                  ? "What's our Q4 pipeline by region? Pull from the OpportunityHistory object."
                  : i === 1
                  ? "Forecast revenue this quarter assuming the 'Negotiation' stage closes at 60%."
                  : "Show me which closed-won deals slipped from Q3 to Q4 and why."}
                aria-label={`Example prompt ${i + 1}`}
              />
              {prompts.length > 1 && (
                <button
                  type="button"
                  className="sc-intent-prompt-remove"
                  onClick={() => removePrompt(i)}
                  aria-label={`Remove prompt ${i + 1}`}
                >
                  <XIcon size={12} />
                </button>
              )}
            </div>
          ))}

          {prompts.length < MAX_PROMPTS && (
            <button type="button" className="sb-btn-ghost sc-intent-add" onClick={addPrompt}>
              <PlusIcon size={12} />
              Add another prompt
            </button>
          )}
        </div>

        <div className={`sc-intent-counter${promptsOk ? ' ok' : ''}`}>
          {filledPrompts.length} / {MIN_PROMPTS} prompts (10+ chars each)
        </div>
      </div>

      {suggestedTriggers.length > 0 && (
        <div className="sc-intent-derived">
          <div className="sc-intent-derived-label">Triggers we'll pull from these prompts:</div>
          <div className="sc-intent-chips">
            {suggestedTriggers.map(t => (
              <span key={t} className="sc-intent-chip">{t}</span>
            ))}
          </div>
          <div className="sc-intent-derived-foot">
            You can edit these on the draft page before submitting.
          </div>
        </div>
      )}

      <div className="sc-intent-field">
        <label className="sb-label sc-intent-label">
          Data sources or systems touched <span className="sc-intent-opt">(optional)</span>
        </label>
        <textarea
          className="sb-input sc-intent-textarea"
          rows={2}
          value={connection}
          onChange={e => onConnectionChange(e.target.value)}
          placeholder="Salesforce — Opportunity, OpportunityHistory, Account objects via CData connector. Read-only."
        />
      </div>

      <div className="sc-intent-actions">
        <button
          type="button"
          className="sb-btn-primary sc-intent-advance"
          onClick={onAdvance}
          disabled={!canAdvance}
        >
          Draft the skill
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
