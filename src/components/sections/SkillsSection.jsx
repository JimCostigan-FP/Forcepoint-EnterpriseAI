import { useEffect, useState } from 'react'
import { PORTAL_DATA } from '../../data.js'
import SkillSubmit from '../SkillSubmit.jsx'
import SkillBuilder from '../SkillBuilder.jsx'
import GoSacBuilder from '../GoSacBuilder.jsx'
import { ArrowRight, PlusIcon } from '../icons.jsx'

export default function SkillsSection({ active, onAskQuick, initialQuery = '' }) {
  const [query, setQuery] = useState('')
  const [goSacVisible, setGoSacVisible] = useState(false)

  // Sync from global topbar search when we navigate into this section
  useEffect(() => {
    if (active && initialQuery) setQuery(initialQuery)
  }, [active, initialQuery])

  const filtered = PORTAL_DATA.skills.filter(s => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (s.searchText + ' ' + s.title.toLowerCase()).includes(q)
  })

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Enterprise skills library</h2>
          <p>Approved, production-ready skills governed by the Enterprise AI architecture team. Submit new skills via Jira (AI project).</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('How do I submit a new AI skill for review in the Enterprise AI skills governance process?')}
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
        onChange={e => setQuery(e.target.value)}
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
              <div className="list-desc">Try a different search term, or browse the full library by clearing the search.</div>
            </div>
          </div>
        )}
      </div>

      <SkillSubmit />

      <SkillBuilder onFirstDownload={() => setGoSacVisible(true)} />

      {goSacVisible && <GoSacBuilder />}
    </section>
  )
}
