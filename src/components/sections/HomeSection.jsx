import { useState } from 'react'
import { PORTAL_DATA } from '../../data.js'
import {
  ArrowRight, ArrowUpRight, TrendUp, SparkleIcon, PinIcon,
  CustomizeIcon, BookIcon, SkillsIcon, PromptIcon, EventIcon,
  TeamIcon, ArchIcon,
} from '../icons.jsx'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const STATS = [
  { label: 'Approved skills',    value: '12', delta: '+2',  deltaTone: 'teal',    foot: 'this month' },
  { label: 'Active ambassadors', value: '24', delta: '6 teams', deltaTone: 'neutral', foot: 'across departments' },
  { label: 'Showcase prompts',   value: '32', delta: '+8',  deltaTone: 'teal',    foot: 'peer-reviewed' },
  { label: 'Avg. token savings', value: '47%', delta: '↑',  deltaTone: 'teal',    foot: 'vs. baseline' },
]

const PINNED = [
  { id: 'skills',    title: 'Skills library',    desc: 'Approved, production-ready AI skills.',         icon: 'S', tone: 'teal' },
  { id: 'prompts',   title: 'Prompt showcase',   desc: 'Peer-reviewed prompts you can run today.',       icon: 'P', tone: 'amber' },
  { id: 'howtos',    title: 'How-tos & tips',    desc: 'Practical guidance for everyday AI work.',       icon: 'H', tone: 'navy' },
  { id: 'events',    title: 'Events calendar',   desc: 'Brown bags, workshops, AI Council sessions.',    icon: 'E', tone: 'violet' },
  { id: 'ambassador',title: 'AI Ambassador',     desc: 'Program structure, roles, and how to join.',     icon: 'A', tone: 'teal' },
  { id: 'architecture',title:'Architecture & IT',desc: 'How to integrate cleanly with the platform.',    icon: 'IT',tone: 'navy' },
]

const ACTIVITY = [
  { tone: 'teal',   text: <><strong>Salesforce CData Query Cache</strong> v1 published to the skills library.</>, meta: '2 hours ago · David Burden' },
  { tone: 'navy',   text: <><strong>AI Policy v1.1</strong> updated — review required for all personnel.</>,        meta: 'Today · Compliance' },
  { tone: 'amber',  text: <><strong>DLP Incident Response Triage</strong> moved to pilot stage.</>,                  meta: 'Yesterday · Security team' },
  { tone: 'violet', text: <><strong>The Signal #1</strong> issue published — connector status update.</>,           meta: '2 days ago · Jim Costigan' },
]

const SUGGESTED_PROMPTS = [
  { label: 'Summarize this DLP incident report for an executive audience',
    ask:   'Summarise the key risks in this DLP incident report for a non-technical executive audience. Use plain language. Highlight the top three actions required.' },
  { label: 'Draft a customer follow-up email after a security demo',
    ask:   'You are an expert in B2B cybersecurity sales. Draft a follow-up email after a product demo. Focus on value and next steps.' },
  { label: 'Review this code for compliance and security risk',
    ask:   'Review this code for security issues, readability and performance. Flag any patterns that could create compliance risk.' },
]

export default function HomeSection({ active, onShowSection, onAskQuick }) {
  const [pinned, setPinned] = useState(['skills', 'prompts', 'howtos', 'events'])

  function togglePin(id, e) {
    e.stopPropagation()
    setPinned(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const upcoming = PORTAL_DATA.events.slice(0, 3)
  const news     = PORTAL_DATA.news.slice(0, 3)

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>

      {/* ── Compact hero ───────────────────────────────────── */}
      <div className="hero">
        <div className="hero-row">
          <div className="hero-greeting">
            <span className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Live · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h1 className="hero-title">{greeting()}, Jim.</h1>
            <p className="hero-subtitle">
              Here's what's moving in Forcepoint AI today — three new skills updates, two pilot reviews, and one fresh issue of The Signal.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onAskQuick('Summarize the latest changes in the Forcepoint Enterprise AI program')}>
              <SparkleIcon size={14} />
              Ask AI
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onShowSection('skills')}>
              Browse skills
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="hero-stats" role="list">
          {STATS.map(s => (
            <div className="hero-stat" role="listitem" key={s.label}>
              <span className="hero-stat-label">{s.label}</span>
              <div className="hero-stat-row">
                <span className="hero-stat-value">{s.value}</span>
                <span className={`hero-stat-delta ${s.deltaTone}`}>
                  {s.deltaTone === 'teal' && <TrendUp size={12} />}
                  {s.delta}
                </span>
              </div>
              <span className="hero-stat-foot">{s.foot}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dashboard grid ─────────────────────────────────── */}
      <div className="dash-grid">

        {/* Left column — primary widgets */}
        <div className="dash-col">

          {/* Pinned tools */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-title">
                <PinIcon size={14} className="card-head-icon" />
                Pinned tools
              </div>
              <button
                type="button"
                className="card-head-link"
                onClick={() => onAskQuick('Help me customize my Forcepoint AI portal dashboard')}
                title="Customize"
              >
                <CustomizeIcon size={14} />
                Customize
              </button>
            </div>
            <div className="pinned-grid">
              {PINNED.map(t => {
                const isPinned = pinned.includes(t.id)
                return (
                  <div
                    className="tool-card"
                    key={t.id}
                    onClick={() => onShowSection(t.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') onShowSection(t.id) }}
                  >
                    <div className="tool-card-row">
                      <div className={`tool-card-icon ${t.tone}`}>{t.icon}</div>
                      <button
                        type="button"
                        className={`tool-card-pin${isPinned ? ' active' : ''}`}
                        onClick={e => togglePin(t.id, e)}
                        aria-label={isPinned ? 'Unpin' : 'Pin'}
                        title={isPinned ? 'Unpin' : 'Pin'}
                      >
                        <PinIcon size={13} />
                      </button>
                    </div>
                    <div className="tool-card-title">{t.title}</div>
                    <div className="tool-card-desc">{t.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-title">Recent activity</div>
              <button
                type="button"
                className="card-head-link"
                onClick={() => onShowSection('news')}
              >
                View all
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="activity-feed">
              {ACTIVITY.map((a, i) => (
                <div className="activity-item" key={i}>
                  <span className={`activity-bullet ${a.tone}`} aria-hidden="true" />
                  <div className="activity-body">
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-meta">{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — contextual / AI */}
        <div className="dash-col">

          {/* AI insight callout */}
          <div className="insight-callout">
            <div className="insight-eyebrow">
              <SparkleIcon size={12} className="insight-icon" />
              AI insight
            </div>
            <div className="insight-title">
              Sales team prompts are trending up 34% this week.
            </div>
            <div className="insight-body">
              The "B2B follow-up" and "deal risk review" prompts are seeing the most reuse. Consider pinning them for your Sales Ambassador board.
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onShowSection('prompts')}
            >
              Open prompts
              <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Suggested prompts */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-title">
                <PromptIcon size={14} className="card-head-icon" />
                Recommended for you
              </div>
            </div>
            <div className="suggest-list">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  type="button"
                  key={i}
                  className="suggest-item"
                  onClick={() => onAskQuick(p.ask)}
                >
                  <span style={{ flex: 1 }}>{p.label}</span>
                  <span className="suggest-arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-title">
                <EventIcon size={14} className="card-head-icon" />
                Upcoming
              </div>
              <button
                type="button"
                className="card-head-link"
                onClick={() => onShowSection('events')}
              >
                Calendar
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="list-items" style={{ border: 'none', borderRadius: 0 }}>
              {upcoming.map((e, i) => (
                <div className="list-item" key={i}>
                  <div className={`event-dot ${e.dotClass}`} aria-hidden="true" />
                  <div className="list-body">
                    <div className="list-meta">{e.meta}</div>
                    <div className="list-title">{e.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Owner strip ────────────────────────────────────── */}
      <div className="owner-strip">
        <div className="owner-info">
          <div className="owner-label">Program owner</div>
          <div className="owner-name">
            IT Enterprise AI team · ITEnterpriseAIteam@forcepoint.com · Jim Costigan, AI Program Manager
          </div>
        </div>
        <button
          className="owner-btn"
          onClick={() => onAskQuick('Tell me about the Forcepoint Enterprise AI program')}
        >
          Learn more
          <ArrowRight size={13} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </section>
  )
}
