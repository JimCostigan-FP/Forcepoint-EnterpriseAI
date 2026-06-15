import { useEffect, useState } from 'react'
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
import AskAiSection from './components/sections/AskAiSection.jsx'

const TABS = [
  { id: 'home',         label: 'Overview' },
  { id: 'ask',          label: 'Ask AI' },
  { id: 'skills',       label: 'Skills library' },
  { id: 'prompts',      label: 'Prompt showcase' },
  { id: 'howtos',       label: 'How-tos & tips' },
  // Events, Latest news and The Signal are hidden for now — uncomment to restore.
  // { id: 'events',       label: 'Events' },
  // { id: 'news',         label: 'Latest news' },
  { id: 'ambassador',   label: 'AI Ambassador' },
  { id: 'architecture', label: 'Architecture & IT' },
  // { id: 'signal',       label: 'The Signal' },
  { id: 'project',      label: 'Project', badge: 'In development' },
]

// Each section has its own URL path: home → "/", everything else → "/<id>".
// The Node server's SPA fallback serves index.html for these paths, so deep
// links and refreshes land on the right page.
const SECTION_IDS = [
  'home', 'ask', 'skills', 'prompts', 'howtos', 'ambassador',
  'architecture', 'project', 'news', 'events', 'signal', 'skill-creator',
]
const pathFromSection = (id) => (id === 'home' ? '/' : `/${id}`)
function sectionFromPath(pathname) {
  const seg = (pathname || '/').replace(/^\/+|\/+$/g, '').split('/')[0]
  if (!seg) return 'home'
  return SECTION_IDS.includes(seg) ? seg : 'home'
}

export default function App() {
  const auth = useCurrentUser()
  const [activeSection, setActiveSection] = useState(() => sectionFromPath(window.location.pathname))
  const [globalQuery, setGlobalQuery]     = useState('')
  const [toast, setToast]                 = useState(null)
  // Prefill payload the skill creator hands to SkillSubmit on submit. Routing
  // the assembled draft through the existing governance intake keeps a single
  // submission path — there is no separate creator endpoint.
  const [creatorPrefill, setCreatorPrefill] = useState(null)
  // A question routed into the dedicated Ask AI chat page from anywhere in the
  // portal (hero CTA, header links, section "try" buttons). The AskAiSection
  // auto-sends it once when it becomes active, then clears it.
  const [pendingAsk, setPendingAsk] = useState(null)

  function showSection(id) {
    setActiveSection(id)
    const path = pathFromSection(id)
    if (window.location.pathname !== path) {
      window.history.pushState({ section: id }, '', path)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Keep the active section in sync with browser back/forward navigation.
  useEffect(() => {
    const onPop = () => setActiveSection(sectionFromPath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function handleCreatorHandoff(payload) {
    setCreatorPrefill(payload)
    showSection('skills')
  }

  function notify(label) {
    setToast(label)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 2200)
  }

  // askQuick(question) — routes a question into the dedicated Ask AI chat page
  // and switches to it. The page (AskAiSection) streams the grounded answer
  // from /api/ask. Keeping this prop name means the existing "Ask AI"
  // affordances across the portal need no changes.
  function askQuick(question) {
    const q = (question || '').trim()
    setPendingAsk(q || ' ')   // a bare space still opens the page (empty state)
    showSection('ask')
  }

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
        <AskAiSection
          active={activeSection === 'ask'}
          user={auth.user}
          pendingAsk={pendingAsk}
          onPendingConsumed={() => setPendingAsk(null)}
        />
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
        <ProjectSection      active={activeSection === 'project'} />
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
