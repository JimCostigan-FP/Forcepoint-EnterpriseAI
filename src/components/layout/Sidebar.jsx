import {
  HomeIcon, BookIcon, NewsIcon, SkillsIcon, PromptIcon,
  EventIcon, TeamIcon, ArchIcon, SignalIcon,
} from '../ui/icons.jsx'
import './Sidebar.css'

const ICONS = {
  home:         HomeIcon,
  howtos:       BookIcon,
  news:         NewsIcon,
  skills:       SkillsIcon,
  prompts:      PromptIcon,
  events:       EventIcon,
  ambassador:   TeamIcon,
  architecture: ArchIcon,
  signal:       SignalIcon,
}

const GROUPS = [
  { label: 'Workspace', items: ['home', 'skills', 'prompts'] },
  { label: 'Learn',     items: ['howtos', 'events'] },
  { label: 'Program',   items: ['news', 'ambassador', 'architecture', 'signal'] },
]

const BADGES = {
  news:   { label: 'New' },
  signal: { label: '#1' },
}

export default function Sidebar({ tabs, activeSection, onShowSection }) {
  const labelById = Object.fromEntries(tabs.map(t => [t.id, t.label]))

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav className="sidebar-nav">
        {GROUPS.map(group => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map(id => {
              const Icon = ICONS[id]
              const label = labelById[id]
              const badge = BADGES[id]
              const active = activeSection === id
              return (
                <button
                  key={id}
                  type="button"
                  className={`sidebar-item${active ? ' active' : ''}`}
                  onClick={() => onShowSection(id)}
                  aria-current={active ? 'page' : undefined}
                  title={label}
                >
                  {Icon && <Icon size={17} className="sidebar-item-icon" />}
                  <span className="sidebar-item-label">{label}</span>
                  {badge && <span className="sidebar-item-badge">{badge.label}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
