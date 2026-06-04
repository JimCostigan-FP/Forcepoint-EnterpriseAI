import { useState } from 'react'
import './ProjectSection.css'

const PROMPTS = [
  {
    key: 'expected',
    label: 'What did you expect to find here?',
    placeholder: 'When you clicked the Project tab, what were you hoping to see?',
  },
  {
    key: 'wish',
    label: 'What do you wish was here?',
    placeholder: 'The thing that would make this page genuinely useful to you…',
  },
  {
    key: 'ideas',
    label: 'What are your ideas for here?',
    placeholder: 'Anything goes — features, content, links, tools, layout…',
  },
]

export default function ProjectSection({ active, user }) {
  const [values, setValues] = useState({ expected: '', wish: '', ideas: '' })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState(null)
  const [ref, setRef] = useState(null)
  const [anonymous, setAnonymous] = useState(false)

  const firstName = (user?.name || '').trim().split(/\s+/)[0] || ''
  const hasInput = Object.values(values).some(v => v.trim())

  function update(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!hasInput || status === 'submitting') return
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch('/api/project-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...values, anonymous }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Something went wrong (HTTP ${res.status}).`)
      }
      setRef(data.ref)
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Could not submit your feedback. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Project</h2>
          <p>
            This space is under construction — and we're building it for you. <em>YOU</em> have a
            voice here; we'd love to hear what you want from it. Your input shapes what we build.
          </p>
        </div>
        <div className="section-header-actions">
          <span className="badge badge-new">In development</span>
        </div>
      </div>

      {status === 'success' ? (
        <div className="proj-panel proj-panel-success">
          <div className="proj-panel-title">Thanks{firstName ? `, ${firstName}` : ''} — got it.</div>
          <p>
            Your input has been recorded and will help shape the Project area. We appreciate you
            taking the time.
          </p>
          {ref && <div className="proj-ref">Reference: <code>{ref}</code></div>}
        </div>
      ) : (
        <form className="proj-form" onSubmit={handleSubmit}>
          {PROMPTS.map(p => (
            <div className="proj-field" key={p.key}>
              <label className="proj-label" htmlFor={`proj-${p.key}`}>{p.label}</label>
              <textarea
                id={`proj-${p.key}`}
                className="proj-textarea"
                rows={3}
                placeholder={p.placeholder}
                value={values[p.key]}
                onChange={e => update(p.key, e.target.value)}
                disabled={status === 'submitting'}
              />
            </div>
          ))}

          {status === 'error' && error && (
            <div className="proj-error" role="alert">{error}</div>
          )}

          {(user?.name || user?.email) && (
            <div className="proj-identity">
              <label className="proj-anon">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  disabled={status === 'submitting'}
                />
                Submit anonymously
              </label>
              <span className="proj-identity-note">
                {anonymous
                  ? 'Your name and email will not be attached to this submission.'
                  : <>Submitting as <strong>{user.name || user.email}</strong>{user.name && user.email ? ` (${user.email})` : ''}.</>}
              </span>
            </div>
          )}

          <div className="proj-actions">
            <button
              type="submit"
              className="proj-btn"
              disabled={!hasInput || status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending…' : 'Share your input'}
            </button>
            <span className="proj-hint">Answer one prompt or all three — whatever you've got.</span>
          </div>
        </form>
      )}
    </section>
  )
}
