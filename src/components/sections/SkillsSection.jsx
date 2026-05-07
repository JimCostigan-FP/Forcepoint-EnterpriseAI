import { useRef, useState } from 'react'
import { PORTAL_DATA } from '../../data/portal.js'
import SkillSubmit from '../skills/SkillSubmit.jsx'
import SkillBuilder from '../skills/SkillBuilder.jsx'
import GoSacBuilder from '../skills/GoSacBuilder.jsx'
import { PlusIcon } from '../ui/icons.jsx'

export default function SkillsSection({ active, onAskQuick, query = '', onQueryChange }) {
  const [goSacVisible, setGoSacVisible] = useState(false)
  const [submitOpen,   setSubmitOpen]   = useState(false)
  const submitRef = useRef(null)

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
        <SkillSubmit open={submitOpen} onOpenChange={setSubmitOpen} />
      </div>

      <SkillBuilder onFirstDownload={() => setGoSacVisible(true)} />

      {goSacVisible && <GoSacBuilder />}
    </section>
  )
}
