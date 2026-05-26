import './Header.css'

export default function Header({ activeSection, tabs, onShowSection, onAskQuick }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="site-logo">
          <div className="site-logo-mark">FP</div>
          <div className="site-logo-text">
            <span className="site-logo-title">Forcepoint Enterprise AI</span>
            <span className="site-logo-sub">IT Enterprise AI team · CIO Organization</span>
          </div>
        </div>
        <nav className="header-nav" aria-label="Quick links">
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('What AI tools are approved for use at Forcepoint?') }}>Tools</a>
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('How do I get started with the AI Ambassador program?') }}>Ambassador</a>
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('What is the Forcepoint AI governance policy?') }}>Policy</a>
        </nav>
      </div>

      <div className="site-hero">
        <div className="site-hero-eyebrow">Your AI guide, built for Forcepoint</div>
        <h1 className="site-hero-headline">Know more.<br />Work smarter.<br />Stay secure.</h1>
        <p className="site-hero-body">Everything you need to use AI confidently at Forcepoint — tools, skills, prompts, events and expert guidance, in one place.</p>
        <div className="site-hero-actions">
          <button className="site-hero-cta" onClick={() => onShowSection('skills')}>Browse skills →</button>
          <button className="site-hero-cta site-hero-cta-ghost" onClick={() => onShowSection('howtos')}>How-tos &amp; tips</button>
          <button className="site-hero-cta site-hero-cta-ghost" onClick={() => onShowSection('events')}>Events calendar</button>
        </div>
      </div>

      <nav className="tab-nav" aria-label="Section navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab${activeSection === tab.id ? ' active' : ''}`}
            onClick={() => onShowSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
