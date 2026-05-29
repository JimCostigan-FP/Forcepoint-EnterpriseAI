import { ArrowRight, SparkleIcon } from '../ui/icons.jsx'

// Entry panel on the Skills Library tab. Sits under SkillBuilder + GoSacBuilder.
// Discovery surface only — the heavy lifting lives on the skill-creator section.

export default function SkillCreatorPanel({ onLaunch }) {
  return (
    <div className="sc-entry-wrap" role="region" aria-label="Skill creator">
      <div className="sc-entry-body">
        <div>
          <div className="sc-entry-title">Skill creator — guided draft, test, and submit</div>
          <div className="sc-entry-sub">
            Build, test, and submit a skill without leaving Iris. A refiner asks the open-ended questions; you preview the SKILL.md, fire a sample prompt, see the review tier, and hand off to governance — one page, one path.
          </div>
          <div className="sc-entry-bullets">
            <span className="sc-entry-bullet">No round-trip through Claude</span>
            <span className="sc-entry-bullet">Test before submit</span>
            <span className="sc-entry-bullet">Tier shown at creation</span>
            <span className="badge badge-design">Beta · v0 stubs</span>
          </div>
        </div>
        <button
          type="button"
          className="sb-btn-primary sb-btn-lg sc-entry-cta"
          onClick={onLaunch}
        >
          <SparkleIcon size={14} />
          Open skill creator
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
