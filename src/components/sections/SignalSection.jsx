import { useEffect, useState } from 'react'
import ISSUE_5_HTML from '../../content/signal/signal-issue-05.html?raw'
import ISSUE_1_HTML from '../../content/signal/signal_newsletter_issue1.html?raw'

// The newsletters render inside a sandboxed iframe, so the app's
// [data-theme="dark"] on <html> can't cascade in. We inject the current
// theme onto the iframe's <html> plus a dark-mode override sheet keyed off
// it. Both issues share the same class vocabulary, so one sheet themes all.
const SIGNAL_DARK_CSS = `
html[data-theme="dark"] body{background:#0b0f15;color:#e6e9ee;}
html[data-theme="dark"] .issue-title h1{color:#e6e9ee;}
html[data-theme="dark"] .issue-title .eyebrow{color:#5eead4;}
html[data-theme="dark"] .issue-title .issue-meta{color:#8b949e;}
html[data-theme="dark"] .emerging{background:rgba(0,175,154,0.10);color:#e6e9ee;}
html[data-theme="dark"] .emerging strong,
html[data-theme="dark"] .first-time strong{color:#5eead4;}
html[data-theme="dark"] .sec-label{color:#5eead4;border-bottom-color:#0d9488;}
html[data-theme="dark"] .data-note{background:#161b22;border-color:#2d333b;color:#9aa4b2;}
html[data-theme="dark"] .cc,
html[data-theme="dark"] .win-item,
html[data-theme="dark"] .sk-card,
html[data-theme="dark"] .feedback,
html[data-theme="dark"] .first-time{background:#161b22;border-color:#2d333b;box-shadow:none;}
html[data-theme="dark"] .cn,
html[data-theme="dark"] .sk-name{color:#f0f3f6;}
html[data-theme="dark"] .sk-det,
html[data-theme="dark"] .win-item p,
html[data-theme="dark"] .up-text,
html[data-theme="dark"] .feedback,
html[data-theme="dark"] .first-time{color:#c9d1d9;}
html[data-theme="dark"] .csys,
html[data-theme="dark"] .csrc,
html[data-theme="dark"] .sk-src,
html[data-theme="dark"] .wsrc,
html[data-theme="dark"] .up-src,
html[data-theme="dark"] .footer-text{color:#8b949e;}
html[data-theme="dark"] .done{color:#34d399;}
html[data-theme="dark"] .prog{color:#60a5fa;}
html[data-theme="dark"] .req{color:#9ca3af;}
`

// Stamp the iframe doc with the active theme and append the dark overrides.
function buildSrcDoc(html, theme) {
  return html
    .replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`)
    .replace('</head>', `<style>${SIGNAL_DARK_CSS}</style></head>`)
}

const ISSUES = [
  {
    number: 5,
    date: 'June 14, 2026',
    title: 'Fourteen teams. Four patterns. The company shows us what to build.',
    summary: 'Hackathon Round 1 wraps — 14 submissions across four architectural patterns · Five projects fast-tracked to architecture review · PowerPoint branding skill ready for limited beta · Enterprise AI Standard under AI Council review.',
    html: ISSUE_5_HTML,
  },
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

  // Track the app theme. The toggle only sets data-theme on <html> (and uses
  // per-component state), so we observe the attribute directly rather than
  // routing through useTheme — this catches a toggle from anywhere.
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark' : 'light'
  )
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const obs = new MutationObserver(() =>
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    )
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

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
              srcDoc={buildSrcDoc(ISSUES[viewing].html, theme)}
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
