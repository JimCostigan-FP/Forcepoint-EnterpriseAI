import {
  HomeIcon, BookIcon, NewsIcon, SkillsIcon, PromptIcon,
  EventIcon, TeamIcon, ArchIcon, SignalIcon, PanelLeftIcon,
} from './icons.jsx'

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
  {
    label: 'Workspace',
    items: ['home', 'skills', 'prompts'],
  },
  {
    label: 'Learn',
    items: ['howtos', 'events'],
  },
  {
    label: 'Program',
    items: ['news', 'ambassador', 'architecture', 'signal'],
  },
]

const BADGES = {
  news:   { label: 'New', tone: 'teal' },
  signal: { label: '#1' },
}

export default function Sidebar({ tabs, activeSection, onShowSection, collapsed, onToggleCollapse }) {
  const labelById = Object.fromEntries(tabs.map(t => [t.id, t.label]))

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">FP</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">Enterprise AI</span>
          <span className="sidebar-brand-sub">Forcepoint · IT</span>
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftIcon size={16} />
        </button>
      </div>

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
                  {Icon && <Icon size={18} className="sidebar-item-icon" />}
                  <span className="sidebar-item-label">{label}</span>
                  {badge && (
                    <span className="sidebar-item-badge">{badge.label}</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" role="button" tabIndex={0} title="Account">
          <div className="sidebar-avatar">JC</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Jim Costigan</span>
            <span className="sidebar-user-role">AI Program Manager</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
