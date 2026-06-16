import { useState } from 'react'
import Header from './components/layout/Header.jsx'
import HomeSection from './components/sections/HomeSection.jsx'
import HowtosSection from './components/sections/HowtosSection.jsx'
import NewsSection from './components/sections/NewsSection.jsx'
import SkillsSection from './components/sections/SkillsSection.jsx'
import PromptsSection from './components/sections/PromptsSection.jsx'
import EventsSection from './components/sections/EventsSection.jsx'
import AmbassadorSection from './components/sections/AmbassadorSection.jsx'
import ArchitectureSection from './components/sections/ArchitectureSection.jsx'
import SignalSection from './components/sections/SignalSection.jsx'
import ProjectSection from './components/sections/ProjectSection.jsx'
import LoginPage from './components/auth/LoginPage.jsx'
import { useCurrentUser } from './lib/auth.js'
import SkillCreatorSection from './components/sections/SkillCreatorSection.jsx'

// Events, Latest news and The Signal are hidden in production but shown in
// local dev (import.meta.env.DEV) so they can be worked on. To restore them
// in production too, move these entries out of the DEV-only spreads below.
const DEV = import.meta.env.DEV

const TABS = [
  { id: 'home',         label: 'Overview' },
  { id: 'skills',       label: 'Skills library' },
  { id: 'prompts',      label: 'Prompt showcase' },
  { id: 'howtos',       label: 'How-tos & tips' },
  ...(DEV ? [
    { id: 'events',     label: 'Events' },
    { id: 'news',       label: 'Latest news' },
  ] : []),
  { id: 'ambassador',   label: 'AI Ambassador' },
  { id: 'architecture', label: 'Architecture & IT' },
  ...(DEV ? [{ id: 'signal', label: 'The Signal' }] : []),
  { id: 'project',      label: 'Project', badge: 'In development' },
]

export default function App() {
  const auth = useCurrentUser()
  const [activeSection, setActiveSection] = useState('home')
  const [globalQuery, setGlobalQuery]     = useState('')
  const [toast, setToast]                 = useState(null)
  // Prefill payload the skill creator hands to SkillSubmit on submit. Routing
  // the assembled draft through the existing AI-471 intake keeps a single
  // submission path — there is no separate creator endpoint.
  const [creatorPrefill, setCreatorPrefill] = useState(null)

  function showSection(id) {
    setActiveSection(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCreatorHandoff(payload) {
    setCreatorPrefill(payload)
    showSection('skills')
  }

  function notify(label) {
    setToast(label)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 2200)
  }
  function askQuick(/* question */) { notify('AI assistant — coming soon') }

  // ── Auth gate ──────────────────────────────────────────────────────
  // Avoid flashing the LoginPage before /api/auth/me resolves.
  if (auth.status === 'loading') {
    return (
      <div className="auth-splash" role="status" aria-live="polite">
        <div className="auth-splash-mark">FP</div>
        <div className="auth-splash-label">Loading Forcepoint Enterprise AI…</div>
      </div>
    )
  }

  // Anonymous (or error reading the session) → LoginPage owns the viewport.
  // Logging out redirects to /, which lands back here in the anonymous state.
  if (auth.status !== 'authenticated') {
    return (
      <LoginPage
        features={auth.features}
        onDevLogin={auth.signInAsDev}
        returnTo="/"
      />
    )
  }

  return (
    <>
      <Header
        activeSection={activeSection}
        tabs={TABS}
        onShowSection={showSection}
        onAskQuick={askQuick}
        auth={auth}
      />

      <main className="portal-body" id="main-content">
        <HomeSection         active={activeSection === 'home'}         onShowSection={showSection} onAskQuick={askQuick} user={auth.user} />
        <HowtosSection       active={activeSection === 'howtos'}       onAskQuick={askQuick} />
        <NewsSection         active={activeSection === 'news'} />
        <SkillsSection
          active={activeSection === 'skills'}
          onAskQuick={askQuick}
          onShowSection={showSection}
          query={globalQuery}
          onQueryChange={setGlobalQuery}
          submitPrefill={creatorPrefill}
          onSubmitPrefillConsumed={() => setCreatorPrefill(null)}
          user={auth.user}
        />
        <PromptsSection      active={activeSection === 'prompts'}      onAskQuick={askQuick} />
        <EventsSection       active={activeSection === 'events'}       onAskQuick={askQuick} />
        <AmbassadorSection   active={activeSection === 'ambassador'}   onAskQuick={askQuick} />
        <ArchitectureSection active={activeSection === 'architecture'} onAskQuick={askQuick} />
        <SignalSection       active={activeSection === 'signal'} />
        <ProjectSection      active={activeSection === 'project'} user={auth.user} />
        <SkillCreatorSection
          active={activeSection === 'skill-creator'}
          onShowSection={showSection}
          onHandoff={handleCreatorHandoff}
        />
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  )
}
