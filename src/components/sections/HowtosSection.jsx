import { PORTAL_DATA } from '../../data/portal.js'
import { ArrowRight } from '../ui/icons.jsx'

export default function HowtosSection({ active, onAskQuick }) {
  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>How-tos, hints &amp; tips</h2>
          <p>Practical, straightforward guidance for getting more done with AI — no jargon, no hype.</p>
        </div>
      </div>

      <div className="list-items">
        {PORTAL_DATA.howtos.map((item, i) => (
          <div className="list-item" key={i}>
            <div className="list-body">
              <span className={`badge ${item.badgeClass}`}>{item.badge}</span>
              <div className="list-title">{item.title}</div>
              <div className="list-desc">{item.desc}</div>
              <button className="try-btn" onClick={() => onAskQuick(item.ask)}>
                Show me how
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
