import { SearchIcon, BellIcon, SunIcon, MoonIcon, ChevronDown } from './icons.jsx'

export default function Topbar({
  activeLabel, theme, onToggleTheme,
  onSearch, searchValue, onSearchSubmit, onToggleSidebar,
}) {
  return (
    <header className="topbar" role="banner">

      {/* ── Left: brand + breadcrumb ─────────────────────── */}
      <div className="topbar-zone topbar-zone-left">
        <button
          type="button"
          className="topbar-brand"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          title="Toggle navigation"
        >
          <span className="topbar-brand-mark" aria-hidden="true">FP</span>
          <span className="topbar-brand-text">
            <span className="topbar-brand-title">Enterprise AI</span>
            <span className="topbar-brand-sub">Forcepoint · IT</span>
          </span>
        </button>

        <div className="topbar-divider" aria-hidden="true" />

        <nav aria-label="Breadcrumb" className="topbar-breadcrumb">
          <span className="topbar-breadcrumb-current">{activeLabel}</span>
        </nav>
      </div>

      {/* ── Center: command-palette-style search ─────────── */}
      <div className="topbar-zone topbar-zone-center">
        <form
          className="topbar-search"
          onSubmit={e => { e.preventDefault(); onSearchSubmit?.() }}
          role="search"
        >
          <SearchIcon size={15} className="topbar-search-icon" />
          <input
            type="search"
            className="topbar-search-input"
            placeholder="Search skills, prompts, docs…"
            value={searchValue ?? ''}
            onChange={e => onSearch?.(e.target.value)}
            aria-label="Search portal"
          />
          <kbd className="topbar-search-kbd" aria-hidden="true">⌘K</kbd>
        </form>
      </div>

      {/* ── Right: status actions + user ─────────────────── */}
      <div className="topbar-zone topbar-zone-right">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>

        <button
          type="button"
          className="icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <BellIcon size={16} />
          <span className="icon-dot" aria-hidden="true" />
        </button>

        <div className="topbar-divider" aria-hidden="true" />

        <button
          type="button"
          className="topbar-profile"
          aria-label="Account menu"
          title="Jim Costigan · AI Program Manager"
        >
          <span className="topbar-profile-avatar" aria-hidden="true">JC</span>
          <span className="topbar-profile-text">
            <span className="topbar-profile-name">Jim Costigan</span>
            <span className="topbar-profile-role">AI Program Manager</span>
          </span>
          <ChevronDown size={14} className="topbar-profile-chevron" />
        </button>
      </div>
    </header>
  )
}
