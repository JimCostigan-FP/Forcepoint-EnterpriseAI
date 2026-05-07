import { useState } from 'react'
import ISSUE_1_HTML from '../../../signal/signal_newsletter_issue1.html?raw'

const ISSUES = [
  {
    number: 1,
    date: 'May 1, 2026',
    title: 'Connector status, first wins, and the skills governance launch',
    summary: 'Three connectors live (M365, Atlassian, Salesforce) · Workday and Zuora in progress · salesforce-cdata-cache v1 published · Skills governance lifecycle goes live.',
    html: ISSUE_1_HTML,
  },
]

export default function SignalSection({ active }) {
  const [viewing, setViewing] = useState(null)

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      {viewing === null ? (
        <>
          <div className="section-header">
            <div className="section-header-text">
              <h2>The Signal</h2>
              <p>Enterprise AI Weekly — the official broadcast from the Forcepoint AI program. Published every week by Jim Costigan, AI Program Manager.</p>
            </div>
          </div>

          <div className="list-items">
            {ISSUES.map((issue, i) => (
              <div
                className="list-item"
                key={i}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewing(i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setViewing(i) }}
              >
                <div className="list-date">
                  <div className="day" style={{ fontSize: 14 }}>#{issue.number}</div>
                  <div className="month">Issue</div>
                </div>
                <div className="list-body">
                  <span className="badge badge-policy">Newsletter</span>
                  <div className="list-title">{issue.title}</div>
                  <div className="list-desc" style={{ marginBottom: 6 }}>{issue.summary}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{issue.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4, color: 'var(--text-tertiary)', fontSize: 18 }}>
                  ›
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: 'var(--space-4)' }}
            onClick={() => setViewing(null)}
          >
            ← All issues
          </button>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'var(--bg-surface)',
            }}
          >
            <iframe
              srcDoc={ISSUES[viewing].html}
              title={`The Signal Issue #${ISSUES[viewing].number}`}
              style={{ width: '100%', height: '85vh', border: 'none', display: 'block' }}
              sandbox="allow-same-origin"
            />
          </div>
        </>
      )}
    </section>
  )
}
