import { PORTAL_DATA } from '../../data/portal.js'
import { ArrowRight, PlusIcon } from '../ui/icons.jsx'
import './PromptsSection.css'

export default function PromptsSection({ active, onAskQuick }) {
  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Prompt showcase</h2>
          <p>Community-sourced prompts, peer-reviewed and rated by your colleagues. Try them directly in Claude.</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('I want to submit a prompt to the Forcepoint AI Enablement portal showcase. Help me format it correctly.')}
          >
            <PlusIcon size={14} />
            Submit a prompt
          </button>
        </div>
      </div>

      {PORTAL_DATA.prompts.map((item, i) => (
        <div className="prompt-card" key={i}>
          <span className={`badge ${item.badgeClass}`}>{item.badge}</span>
          <div className="prompt-q">{item.prompt}</div>
          <div className="prompt-meta">
            <span>By {item.submittedBy}</span>
            <span>· Rated highly useful</span>
          </div>
          <button className="try-btn" onClick={() => onAskQuick(item.ask)}>
            Try this prompt
            <ArrowRight size={12} />
          </button>
        </div>
      ))}
    </section>
  )
}
