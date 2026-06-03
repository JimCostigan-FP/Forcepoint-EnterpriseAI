/**
 * AskAiPanel — bottom-right surface that shows the result of `askQuick`.
 *
 * App.jsx fires `POST /api/ask` (Anthropic proxy in api/ask/index.js) when
 * any "Ask AI" affordance is clicked and hands the in-flight state to this
 * panel: question, answer, loading flag, error. Single Q/A per open — the
 * panel is closable; the next askQuick replaces the contents.
 *
 * No streaming yet — the backend returns the full completion. When DLP
 * hooks (TODO in api/ask) start blocking prompts, the error branch already
 * surfaces the message verbatim.
 */

import { useEffect, useRef } from 'react'
import { SparkleIcon, XIcon } from '../ui/icons.jsx'
import './askAi.css'

export default function AskAiPanel({ state, onClose }) {
  const dialogRef = useRef(null)

  // Close on Escape and trap focus loosely (no full focus-trap — this is
  // a side panel, not a modal blocking the rest of the page).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!state) return null
  const { question, answer, loading, error } = state

  return (
    <div className="askai-panel" role="dialog" aria-label="Ask AI response" ref={dialogRef}>
      <div className="askai-head">
        <div className="askai-head-title">
          <SparkleIcon size={14} />
          Ask AI
        </div>
        <button
          type="button"
          className="askai-close"
          onClick={onClose}
          aria-label="Close Ask AI"
        >
          <XIcon size={14} />
        </button>
      </div>

      <div className="askai-body">
        <div className="askai-question">
          <div className="askai-label">You asked</div>
          <div className="askai-question-text">{question}</div>
        </div>

        <div className="askai-answer">
          <div className="askai-label">Forcepoint Intelligence Platform</div>
          {loading && (
            <div className="askai-loading">
              <span className="askai-spinner" aria-hidden="true" />
              Thinking…
            </div>
          )}
          {error && !loading && (
            <div className="askai-error">{error}</div>
          )}
          {answer && !loading && (
            <div className="askai-answer-text">{answer}</div>
          )}
        </div>
      </div>

      <div className="askai-foot">
        Powered by the Forcepoint Intelligence Platform · responses can be inaccurate.
      </div>
    </div>
  )
}
