import { useEffect, useRef, useState } from 'react'
import { PORTAL_DATA } from '../../data/portal.js'
import SkillSubmit from '../skills/SkillSubmit.jsx'
import SkillBuilder from '../skills/SkillBuilder.jsx'
import GoSacBuilder from '../skills/GoSacBuilder.jsx'
import { PlusIcon, SparkleIcon, ArrowRight } from '../ui/icons.jsx'

export default function SkillsSection({
  active, onAskQuick, onShowSection, query = '', onQueryChange,
  submitPrefill, onSubmitPrefillConsumed,
  user,
}) {
  const [goSacVisible, setGoSacVisible] = useState(false)
  const [submitOpen,   setSubmitOpen]   = useState(false)
  const submitRef = useRef(null)

  // When the skill creator hands off a draft, open the governance panel and
  // scroll it into view so the submitter sees the prefilled fields land.
  useEffect(() => {
    if (!submitPrefill) return
    setSubmitOpen(true)
    requestAnimationFrame(() => {
      submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [submitPrefill])

  const filtered = PORTAL_DATA.skills.filter(s => {
    const q = (query || '').trim().toLowerCase()
    if (!q) return true
    return (s.searchText + ' ' + s.title.toLowerCase()).includes(q)
  })

  function openSubmit() {
    setSubmitOpen(true)
    // Wait for the panel to expand before scrolling, then center it in view.
    requestAnimationFrame(() => {
      submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>

      <div className="section-header">
        <div className="section-header-text">
          <h2>Enterprise skills library</h2>
          <p>Approved, production-ready skills governed by the Enterprise AI architecture team. Submit new skills via the governance pipeline below.</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={openSubmit}
          >
            <PlusIcon size={14} />
            Submit a skill
          </button>
        </div>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search skills…"
        value={query}
        onChange={e => onQueryChange?.(e.target.value)}
        aria-label="Search skills"
      />

      <div className="list-items">
        {filtered.map((item, i) => (
          <div className="list-item" key={i}>
            <div className="list-body">
              <span className={`badge ${item.badgeClass}`}>{item.badge}</span>
              <div className="list-title">{item.title}</div>
              <div className="list-desc">{item.desc}</div>
              <div className="skill-tags">
                {item.tags.map(t => <span className="skill-tag" key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="list-item">
            <div className="list-body">
              <div className="list-title">No matching skills</div>
              <div className="list-desc">
                Try a different search term, or{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => onQueryChange?.('')}
                >
                  clear the search
                </button>{' '}
                to see the full library.
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={submitRef}>
        <SkillSubmit
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          prefill={submitPrefill}
          onPrefillConsumed={onSubmitPrefillConsumed}
          user={user}
        />
      </div>

      <SkillBuilder onFirstDownload={() => setGoSacVisible(true)} />

      {goSacVisible && <GoSacBuilder />}

      {/* ── Skill creator feature tile ─────────────────────────
          Primary entry to /skill-creator. Sits at the bottom of the
          Skills Library. HIDDEN for now — the skill creator flow is
          not ready to ship. Flip the `false` guard back to render it
          once the feature is complete. */}
      {false && (
        <div className="hero-feature">
          <div className="hero-feature-body">
            <span className="hero-feature-eyebrow">
              <SparkleIcon size={12} />
              New · Build a skill
            </span>
            <div className="hero-feature-title">
              Shape an idea into an enterprise skill — without leaving this portal.
            </div>
            <div className="hero-feature-desc">
              A guided refiner asks the open-ended questions, you preview the SKILL.md, fire a sample prompt, see the review tier, and submit. One page, one path.
            </div>
            <div className="hero-feature-bullets">
              <span className="hero-feature-bullet">No round-trip through Claude</span>
              <span className="hero-feature-bullet">Test before submit</span>
              <span className="hero-feature-bullet">Tier &amp; SLA shown at creation</span>
            </div>
          </div>
          <div className="hero-feature-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onShowSection?.('skill-creator')}
            >
              <SparkleIcon size={14} />
              Open skill creator
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
