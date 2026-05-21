import { useMemo, useState } from 'react'
import { PORTAL_DATA } from '../../data/portal.js'
import {
  parseLocalDate, ymd, formatTime, formatTimeRange, durationMinutes,
  todayLocal, MONTHS_LONG, MONTHS_SHORT, WEEKDAY_INITIALS,
} from '../../lib/date.js'
import {
  PlusIcon, ChevronLeft, ChevronRight, ArrowRight,
  VideoIcon, MapPinIcon, ClockIcon, UsersIcon,
  ExternalLinkIcon, EventIcon,
} from '../ui/icons.jsx'
import './EventsSection.css'

const TYPE_META = {
  'brown-bag':  { label: 'Brown bag',  tone: 'teal'   },
  'ai-council': { label: 'AI Council', tone: 'navy'   },
  'workshop':   { label: 'Workshop',   tone: 'amber'  },
  'sprint':     { label: 'Sprint',     tone: 'violet' },
}

const FORMAT_META = {
  'virtual':   { label: 'Virtual',   Icon: VideoIcon },
  'hybrid':    { label: 'Hybrid',    Icon: MapPinIcon },
  'in-person': { label: 'In person', Icon: MapPinIcon },
}

export default function EventsSection({ active, onAskQuick }) {
  const today = useMemo(todayLocal, [])

  // Default the calendar to "today's month".
  const [viewMonth, setViewMonth]   = useState(today.getMonth())
  const [viewYear,  setViewYear]    = useState(today.getFullYear())
  const [filter,    setFilter]      = useState('upcoming') // upcoming | past | all
  const [typeFilter,setTypeFilter]  = useState(new Set())  // empty = all
  const [activeDate,setActiveDate]  = useState(null)       // YYYY-MM-DD or null

  // ── Decorate events with computed fields ────────────────
  const events = useMemo(() => {
    return PORTAL_DATA.events
      .map(e => ({ ...e, _date: parseLocalDate(e.date) }))
      .sort((a, b) => a._date - b._date)
  }, [])

  // ── Counts per type (for filter chip badges) ────────────
  const typeCounts = useMemo(() => {
    const counts = {}
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1 })
    return counts
  }, [events])

  // ── Filtered list ───────────────────────────────────────
  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filter === 'upcoming' && e._date < today) return false
      if (filter === 'past'     && e._date >= today) return false
      if (typeFilter.size && !typeFilter.has(e.type)) return false
      if (activeDate && e.date !== activeDate) return false
      return true
    })
  }, [events, filter, typeFilter, activeDate, today])

  // ── Group by month for nice headers ─────────────────────
  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      const key = `${e._date.getFullYear()}-${e._date.getMonth()}`
      if (!map.has(key)) map.set(key, { year: e._date.getFullYear(), month: e._date.getMonth(), items: [] })
      map.get(key).items.push(e)
    }
    return Array.from(map.values())
  }, [filtered])

  // ── Featured event (next one within filter scope) ───────
  const featured = useMemo(() => {
    const upcoming = filtered.find(e => e._date >= today)
    if (upcoming) return upcoming
    return filtered.find(e => e.featured) || null
  }, [filtered, today])

  // ── Calendar dates with events (for dot indicators) ─────
  const eventDays = useMemo(() => {
    const set = new Set()
    events
      .filter(e => e._date.getFullYear() === viewYear && e._date.getMonth() === viewMonth)
      .forEach(e => set.add(e._date.getDate()))
    return set
  }, [events, viewMonth, viewYear])

  // ── Calendar grid for the current view month ────────────
  const calendarCells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startWeekday = first.getDay()
    const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewMonth, viewYear])

  function nudgeMonth(delta) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0)  { m = 11; y -= 1 }
    if (m > 11) { m = 0;  y += 1 }
    setViewMonth(m)
    setViewYear(y)
    setActiveDate(null)
  }

  function selectDay(day) {
    if (!day) return
    const d = new Date(viewYear, viewMonth, day)
    const key = ymd(d)
    setActiveDate(prev => prev === key ? null : key)
  }

  function toggleType(t) {
    setTypeFilter(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t); else next.add(t)
      return next
    })
  }

  const FILTERS = [
    { id: 'upcoming', label: 'Upcoming', count: events.filter(e => e._date >= today).length },
    { id: 'past',     label: 'Past',     count: events.filter(e => e._date <  today).length },
    { id: 'all',      label: 'All',      count: events.length },
  ]

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Events &amp; webinars</h2>
          <p>Brown bags, training, AI Council reviews, and design sprints. Open to all Forcepoint employees unless otherwise noted.</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('I want to propose a brown bag session on AI for the Forcepoint Enterprise AI Portal calendar. What information do I need to provide?')}
          >
            <PlusIcon size={14} />
            Propose a session
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="ev-filterbar">
        <div className="ev-tabs" role="tablist">
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`ev-tab${filter === f.id ? ' is-active' : ''}`}
              onClick={() => { setFilter(f.id); setActiveDate(null) }}
            >
              {f.label}
              <span className="ev-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="ev-chips" role="group" aria-label="Filter by type">
          {Object.entries(TYPE_META).map(([key, meta]) => {
            const active = typeFilter.has(key)
            const count  = typeCounts[key] || 0
            if (count === 0) return null
            return (
              <button
                key={key}
                type="button"
                className={`ev-chip ev-chip-${meta.tone}${active ? ' is-active' : ''}`}
                onClick={() => toggleType(key)}
                aria-pressed={active}
              >
                <span className="ev-chip-dot" aria-hidden="true" />
                {meta.label}
                <span className="ev-chip-count">{count}</span>
              </button>
            )
          })}
          {typeFilter.size > 0 && (
            <button type="button" className="ev-chip-clear" onClick={() => setTypeFilter(new Set())}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="ev-grid">
        {/* ── Left: featured + grouped list ───────────────── */}
        <div className="ev-list-col">
          {featured && filter !== 'past' && (
            <FeaturedCard event={featured} onAskQuick={onAskQuick} />
          )}

          {grouped.length === 0 ? (
            <div className="ev-empty">
              <EventIcon size={20} />
              <div className="ev-empty-title">No events match these filters</div>
              <div className="ev-empty-sub">
                Try switching tabs, clearing type filters, or{' '}
                <button type="button" className="link-btn" onClick={() => { setFilter('all'); setTypeFilter(new Set()); setActiveDate(null) }}>
                  reset all filters
                </button>.
              </div>
            </div>
          ) : (
            grouped.map(g => (
              <div className="ev-group" key={`${g.year}-${g.month}`}>
                <div className="ev-group-head">
                  {MONTHS_LONG[g.month]} {g.year}
                  <span className="ev-group-count">{g.items.length} {g.items.length === 1 ? 'event' : 'events'}</span>
                </div>
                <div className="ev-cards">
                  {g.items.map(e => (
                    <EventCard
                      key={e.id}
                      event={e}
                      isPast={e._date < today}
                      isFeatured={featured?.id === e.id && filter !== 'past'}
                      onAskQuick={onAskQuick}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right: calendar + insights ──────────────────── */}
        <aside className="ev-side-col">
          <div className="card ev-cal">
            <div className="ev-cal-head">
              <button
                type="button"
                className="icon-btn ev-cal-nav"
                onClick={() => nudgeMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="ev-cal-title">{MONTHS_LONG[viewMonth]} {viewYear}</div>
              <button
                type="button"
                className="icon-btn ev-cal-nav"
                onClick={() => nudgeMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="ev-cal-week">
              {WEEKDAY_INITIALS.map((w, i) => (
                <span key={i} className="ev-cal-wd">{w}</span>
              ))}
            </div>

            <div className="ev-cal-grid">
              {calendarCells.map((day, i) => {
                if (day === null) return <span key={i} className="ev-cal-cell is-blank" />
                const date = new Date(viewYear, viewMonth, day)
                const isToday   = date.getTime() === today.getTime()
                const hasEvent  = eventDays.has(day)
                const dateKey   = ymd(date)
                const isSelected = activeDate === dateKey
                return (
                  <button
                    key={i}
                    type="button"
                    className={[
                      'ev-cal-cell',
                      isToday    ? 'is-today'    : '',
                      hasEvent   ? 'has-event'   : '',
                      isSelected ? 'is-selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectDay(day)}
                    aria-label={`${MONTHS_LONG[viewMonth]} ${day}`}
                    aria-pressed={isSelected}
                    disabled={!hasEvent && !isToday}
                  >
                    {day}
                    {hasEvent && <span className="ev-cal-dot" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>

            {activeDate && (
              <button type="button" className="ev-cal-clear" onClick={() => setActiveDate(null)}>
                Clear date filter
              </button>
            )}
          </div>

          {/* Quick metrics card */}
          <div className="card ev-stats">
            <div className="card-head">
              <div className="card-head-title">
                <UsersIcon size={14} className="card-head-icon" />
                This quarter
              </div>
            </div>
            <div className="ev-stats-grid">
              <Stat label="Sessions"     value={events.length} />
              <Stat label="Brown bags"   value={typeCounts['brown-bag'] || 0} />
              <Stat label="Workshops"    value={typeCounts['workshop']  || 0} />
              <Stat label="AI Council"   value={typeCounts['ai-council']|| 0} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

/* ── FEATURED CARD ─────────────────────────────────────── */
function FeaturedCard({ event: e, onAskQuick }) {
  const tm = TYPE_META[e.type]
  const fm = FORMAT_META[e.format]
  const FmtIcon = fm?.Icon
  const date = parseLocalDate(e.date)
  return (
    <div className="ev-featured">
      <div className="ev-featured-eyebrow">
        <span className="ev-featured-dot" aria-hidden="true" />
        Next up
      </div>
      <div className="ev-featured-row">
        <DateChip date={date} large />
        <div className="ev-featured-body">
          <div className="ev-featured-meta">
            <span className={`badge badge-${tm.tone === 'navy' ? 'pilot' : tm.tone === 'amber' ? 'design' : tm.tone === 'violet' ? 'policy' : 'new'}`}>{tm.label}</span>
            {fm && <span className="ev-meta-tag">{FmtIcon && <FmtIcon size={12} />}{fm.label}</span>}
            <span className="ev-meta-tag"><ClockIcon size={12} />{formatTimeRange(e.start, e.end, e.tz)}</span>
          </div>
          <h3 className="ev-featured-title">{e.title}</h3>
          <p className="ev-featured-desc">{e.desc}</p>
          <div className="ev-featured-foot">
            <Speakers speakers={e.speakers} />
            <div className="ev-featured-actions">
              <button className="btn btn-primary" onClick={() => onAskQuick(`Register me for "${e.title}"`)}>
                Register
                <ArrowRight size={13} />
              </button>
              <button className="btn btn-secondary" onClick={() => onAskQuick(`Add "${e.title}" to my calendar`)}>
                Add to calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── EVENT CARD ────────────────────────────────────────── */
function EventCard({ event: e, isPast, isFeatured, onAskQuick }) {
  const tm = TYPE_META[e.type]
  const fm = FORMAT_META[e.format]
  const FmtIcon = fm?.Icon
  const date = parseLocalDate(e.date)
  const minutes = durationMinutes(e.start, e.end)
  const remaining = e.capacity ? e.capacity - e.registered : null

  return (
    <article className={`ev-card${isPast ? ' is-past' : ''}${isFeatured ? ' is-featured' : ''}`}>
      <DateChip date={date} />
      <div className="ev-card-body">
        <div className="ev-card-meta">
          <span className={`badge badge-${tm.tone === 'navy' ? 'pilot' : tm.tone === 'amber' ? 'design' : tm.tone === 'violet' ? 'policy' : 'new'}`}>{tm.label}</span>
          {fm && (
            <span className="ev-meta-tag">
              {FmtIcon && <FmtIcon size={12} />}
              {fm.label}{e.location ? ` · ${e.location}` : ''}
            </span>
          )}
          <span className="ev-meta-tag">
            <ClockIcon size={12} />
            {formatTime(e.start)} · {minutes} min
          </span>
        </div>
        <h4 className="ev-card-title">{e.title}</h4>
        <p className="ev-card-desc">{e.desc}</p>

        <div className="ev-card-foot">
          <Speakers speakers={e.speakers} />
          {e.capacity && !isPast && (
            <span className="ev-capacity">
              <UsersIcon size={12} />
              {remaining > 0 ? `${remaining} of ${e.capacity} seats left` : 'Waitlist'}
            </span>
          )}
        </div>
      </div>
      <div className="ev-card-actions">
        {isPast ? (
          <button className="btn btn-secondary btn-sm" onClick={() => onAskQuick(`Show me the recap for "${e.title}"`)}>
            View recap
            <ExternalLinkIcon size={12} />
          </button>
        ) : (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onAskQuick(`Register me for "${e.title}"`)}>
              Register
            </button>
            <button className="link-btn ev-card-secondary" onClick={() => onAskQuick(`Add "${e.title}" to my calendar`)}>
              Add to calendar
            </button>
          </>
        )}
      </div>
    </article>
  )
}

/* ── DATE CHIP ─────────────────────────────────────────── */
function DateChip({ date, large = false }) {
  return (
    <div className={`ev-datechip${large ? ' ev-datechip-lg' : ''}`}>
      <div className="ev-datechip-month">{MONTHS_SHORT[date.getMonth()]}</div>
      <div className="ev-datechip-day">{date.getDate()}</div>
      <div className="ev-datechip-wd">
        {date.toLocaleDateString('en-US', { weekday: 'short' })}
      </div>
    </div>
  )
}

/* ── SPEAKERS ──────────────────────────────────────────── */
function Speakers({ speakers }) {
  if (!speakers?.length) return null
  return (
    <div className="ev-speakers" title={speakers.map(s => s.name).join(', ')}>
      <div className="ev-speaker-avatars" aria-hidden="true">
        {speakers.slice(0, 3).map((s, i) => (
          <span key={i} className="ev-speaker-avatar" style={{ zIndex: speakers.length - i }}>
            {s.initials}
          </span>
        ))}
      </div>
      <div className="ev-speaker-text">
        <span className="ev-speaker-name">
          {speakers[0].name}
          {speakers.length > 1 && ` +${speakers.length - 1}`}
        </span>
        <span className="ev-speaker-role">{speakers[0].role}</span>
      </div>
    </div>
  )
}

/* ── STAT ──────────────────────────────────────────────── */
function Stat({ label, value }) {
  return (
    <div className="ev-stat">
      <div className="ev-stat-value">{value}</div>
      <div className="ev-stat-label">{label}</div>
    </div>
  )
}
