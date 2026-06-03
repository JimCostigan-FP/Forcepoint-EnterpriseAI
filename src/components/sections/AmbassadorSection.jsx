import { PORTAL_DATA } from '../../data/portal.js'
import { ArrowRight } from '../ui/icons.jsx'

export default function AmbassadorSection({ active, onAskQuick }) {
  const { intro, roster, whatTheyDo, mission } = PORTAL_DATA.ambassador

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>AI Ambassador program</h2>
          <p>{intro}</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('I want to become an AI Ambassador at Forcepoint. What are the steps and who do I contact?')}
          >
            Get involved
            <ArrowRight size={13} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onAskQuick('Explain the AI Ambassador skill governance process at Forcepoint')}
          >
            How skills get built
          </button>
        </div>
      </div>

      <h3 className="amb-subhead">Your AI Ambassadors</h3>
      <div className="card-grid">
        {roster.map((p) => (
          <div className="amb-card" key={p.email}>
            <h3>{p.name}</h3>
            <p className="amb-role">{p.role}</p>
            <p className="amb-dept">{p.department}</p>
            <a className="amb-email" href={`mailto:${p.email}`}>{p.email}</a>
          </div>
        ))}
      </div>

      <h3 className="amb-subhead">What they do</h3>
      <div className="amb-prose">
        <p><strong>{whatTheyDo.lead}</strong></p>
        <ul className="amb-list">
          {whatTheyDo.points.map((pt, i) => <li key={i}>{pt}</li>)}
        </ul>
      </div>

      <h3 className="amb-subhead">AI Ambassador mission</h3>
      <div className="card-grid">
        {mission.map((m) => (
          <div className="amb-card" key={m.title}>
            <h3>{m.title}</h3>
            <ul className="amb-list">
              {m.points.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
