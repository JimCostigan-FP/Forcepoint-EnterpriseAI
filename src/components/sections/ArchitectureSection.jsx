import { PORTAL_DATA } from '../../data/portal.js'
import { ArrowRight } from '../ui/icons.jsx'

export default function ArchitectureSection({ active, onAskQuick }) {
  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Architecture &amp; IT guidance</h2>
          <p>How to work with IT on AI integration, what IT owns and where the boundaries are.</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('Explain the Forcepoint Enterprise AI architecture — what is the MCP platform, LangGraph and NMAP, and how do they relate to Claude?')}
          >
            Explore the architecture
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {PORTAL_DATA.architecture.map((block, i) => (
        <div className={`arch-block${block.colorClass ? ` ${block.colorClass}` : ''}`} key={i}>
          <div className="arch-title">{block.title}</div>
          <div className="arch-items">{block.items.join(' · ')}</div>
        </div>
      ))}
    </section>
  )
}
