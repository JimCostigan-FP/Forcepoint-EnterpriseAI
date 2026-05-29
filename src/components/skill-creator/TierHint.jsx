import { ScalesIcon } from '../ui/icons.jsx'
import { TIERS } from '../../lib/skillTemplate.js'

// Read-only tier panel. Updates as the skill body changes. The label,
// SLA, and tone come from the inferred tier; the table below shows the
// other options so the submitter can see what scope they're sitting in.

export default function TierHint({ tier }) {
  return (
    <div className="sc-tier">
      <div className="sc-tier-head">
        <ScalesIcon size={14} className="sc-tier-icon" />
        <div>
          <div className="sc-tier-title">Review tier (inferred)</div>
          <div className="sc-tier-sub">Heuristic v0 — final tier is set in engineering review.</div>
        </div>
      </div>

      <div className={`sc-tier-badge sc-tier-${tier.tone}`}>
        <span className="sc-tier-label">{tier.label}</span>
        <span className="sc-tier-sla">SLA · {tier.sla}</span>
      </div>

      <div className="sc-tier-grid">
        {TIERS.map(t => (
          <div
            key={t.id}
            className={`sc-tier-cell${t.id === tier.id ? ' is-active' : ''}`}
          >
            <div className="sc-tier-cell-label">{t.label}</div>
            <div className="sc-tier-cell-sla">{t.sla}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
