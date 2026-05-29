import { CheckIcon } from '../ui/icons.jsx'

// Stage stepper for the skill builder. Renders the labelled stages with the
// active one highlighted, prior stages marked complete and clickable. The
// parent owns stage state; this component only reports clicks.

export default function Stepper({ stages, active, furthest, onJump }) {
  return (
    <ol className="sc-stepper" aria-label="Skill builder progress">
      {stages.map((s, i) => {
        const isActive   = i === active
        const isComplete = i < furthest
        const canJump    = i <= furthest
        const cls = [
          'sc-stepper-item',
          isActive   && 'is-active',
          isComplete && 'is-complete',
          canJump    && 'is-jumpable',
        ].filter(Boolean).join(' ')

        return (
          <li key={s.id} className={cls}>
            <button
              type="button"
              className="sc-stepper-btn"
              onClick={() => canJump && onJump(i)}
              disabled={!canJump}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="sc-stepper-dot" aria-hidden="true">
                {isComplete ? <CheckIcon size={11} /> : <span>{i + 1}</span>}
              </span>
              <span className="sc-stepper-meta">
                <span className="sc-stepper-label">{s.label}</span>
                <span className="sc-stepper-sub">{s.sub}</span>
              </span>
            </button>
            {i < stages.length - 1 && <span className="sc-stepper-rail" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
