import { SearchIcon, BellIcon, SunIcon, MoonIcon, SparkleIcon } from './icons.jsx'

export default function Topbar({
  activeLabel, theme, onToggleTheme, onAskAI, onSearch, searchValue,
}) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar-breadcrumb" aria-label="Breadcrumb">
        <span className="topbar-breadcrumb-item">Forcepoint AI</span>
        <span className="topbar-breadcrumb-sep">/</span>
        <span className="topbar-breadcrumb-current topbar-breadcrumb-item">{activeLabel}</span>
      </div>

      <div className="topbar-search">
        <SearchIcon size={16} className="topbar-search-icon" />
        <input
          type="search"
          className="topbar-search-input"
          placeholder="Search skills, prompts, docs…"
          value={searchValue ?? ''}
          onChange={e => onSearch?.(e.target.value)}
          aria-label="Search portal"
        />
        <span className="topbar-search-kbd" aria-hidden="true">⌘K</span>
      </div>

      <div className="topbar-actions">
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

        <button
          type="button"
          className="ask-ai-btn"
          onClick={onAskAI}
          aria-label="Ask AI"
          title="Ask AI (⌘K)"
        >
          <SparkleIcon size={14} className="ask-ai-btn-icon" />
          <span className="ask-ai-btn-label">Ask AI</span>
        </button>
      </div>
    </header>
  )
}
