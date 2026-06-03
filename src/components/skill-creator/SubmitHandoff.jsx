import { useState } from 'react'
import { ArrowRight, UploadCloudIcon, CheckIcon } from '../ui/icons.jsx'

// Final stage. Assembles the manifest.json + README.md + {name}.md bundle
// the governance intake expects and hands off to SkillSubmit via the
// prefill prop. No second submission path.

export default function SubmitHandoff({ canSubmit, validation, onSubmit }) {
  const [submitting, setSubmitting] = useState(false)

  const click = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    await Promise.resolve(onSubmit())
    setSubmitting(false)
  }

  return (
    <div className="sc-submit">
      <div className="sc-submit-head">
        <UploadCloudIcon size={14} className="sc-submit-icon" />
        <div>
          <div className="sc-submit-title">Submit to governance</div>
          <div className="sc-submit-sub">
            Routes the assembled files through the existing governance intake pipeline. No second submission path.
          </div>
        </div>
      </div>

      <ul className="sc-submit-checklist">
        {validation.map((v, i) => (
          <li key={i} className={`sc-submit-check${v.ok ? ' ok' : ''}`}>
            <span className="sc-submit-check-mark" aria-hidden="true">
              {v.ok ? <CheckIcon size={11} /> : <span className="sc-submit-check-dot" />}
            </span>
            <span>{v.label}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="sb-btn-primary sb-btn-lg sc-submit-btn"
        disabled={!canSubmit || submitting}
        onClick={click}
      >
        {submitting ? 'Opening intake…' : (
          <>
            Hand off to governance intake
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </div>
  )
}
