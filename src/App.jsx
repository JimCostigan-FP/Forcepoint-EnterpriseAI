import { useState } from 'react'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import HomeSection from './components/sections/HomeSection.jsx'
import HowtosSection from './components/sections/HowtosSection.jsx'
import NewsSection from './components/sections/NewsSection.jsx'
import SkillsSection from './components/sections/SkillsSection.jsx'
import PromptsSection from './components/sections/PromptsSection.jsx'
import EventsSection from './components/sections/EventsSection.jsx'
import AmbassadorSection from './components/sections/AmbassadorSection.jsx'
import ArchitectureSection from './components/sections/ArchitectureSection.jsx'
import SignalSection from './components/sections/SignalSection.jsx'

const TABS = [
  { id: 'home',         label: 'Overview' },
  { id: 'skills',       label: 'Skills library' },
  { id: 'prompts',      label: 'Prompt showcase' },
  { id: 'howtos',       label: 'How-tos & tips' },
  { id: 'events',       label: 'Events' },
  { id: 'news',         label: 'Latest news' },
  { id: 'ambassador',   label: 'AI Ambassador' },
  { id: 'architecture', label: 'Architecture & IT' },
  { id: 'signal',       label: 'The Signal' },
]

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [globalQuery, setGlobalQuery]     = useState('')
  const [toast, setToast]                 = useState(null)

  function showSection(id) {
    setActiveSection(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function notify(label) {
    setToast(label)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 2200)
  }
  function askQuick(/* question */) { notify('AI assistant — coming soon') }

  return (
    <>
      <Header
        activeSection={activeSection}
        tabs={TABS}
        onShowSection={showSection}
        onAskQuick={askQuick}
      />

      <main className="portal-body" id="main-content">
        <HomeSection         active={activeSection === 'home'}         onShowSection={showSection} onAskQuick={askQuick} />
        <HowtosSection       active={activeSection === 'howtos'}       onAskQuick={askQuick} />
        <NewsSection         active={activeSection === 'news'} />
        <SkillsSection
          active={activeSection === 'skills'}
          onAskQuick={askQuick}
          query={globalQuery}
          onQueryChange={setGlobalQuery}
        />
        <PromptsSection      active={activeSection === 'prompts'}      onAskQuick={askQuick} />
        <EventsSection       active={activeSection === 'events'}       onAskQuick={askQuick} />
        <AmbassadorSection   active={activeSection === 'ambassador'}   onAskQuick={askQuick} />
        <ArchitectureSection active={activeSection === 'architecture'} onAskQuick={askQuick} />
        <SignalSection       active={activeSection === 'signal'} />
      </main>

      <Footer />

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  )
}
