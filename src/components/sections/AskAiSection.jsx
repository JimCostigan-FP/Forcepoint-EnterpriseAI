/**
 * AskAiSection — the dedicated, full-page Ask AI chat experience.
 *
 * A self-contained multi-turn chat surface that streams answers token-by-token
 * from the portal's contained Ask AI service via `POST /api/ask` (Server-Sent
 * Events). Every answer is grounded in internal sources and renders the
 * citations it used.
 *
 * Wiring:
 *  - App.jsx routes every "Ask AI" affordance here via `pendingAsk` — when this
 *    section becomes active with a pending question, it auto-sends it once.
 *  - SSE events: `sources` (citations), `delta` (text chunks), `done`, `error`.
 *  - Conversation history is sent on each turn so the backend has context; the
 *    backend re-grounds on the latest user message.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { SparkleIcon } from '../ui/icons.jsx'
import '../ai/askAi.css'

const SUGGESTIONS = [
  'What data am I not allowed to share with AI tools?',
  'How do I get started with the AI Ambassador program?',
  'What skills are available in the library right now?',
  'Give me tips for writing an effective prompt in Claude.',
]

const SOURCE_LABELS = {
  skill:      'Skill',
  portal:     'Portal',
  sharepoint: 'SharePoint',
  confluence: 'Confluence',
}

let _mid = 0
const nextId = () => `m${++_mid}`

// Fallback first-name derivation when the server didn't supply one.
// Handles "Last, First" (Okta/AD), "First Last", and email local parts.
function firstNameOf(nameOrEmail) {
  if (!nameOrEmail) return ''
  const raw = String(nameOrEmail).trim()
  if (!raw) return ''
  const local = raw.includes('@')
    ? raw.split('@')[0].replace(/[._-]+/g, ' ').trim()
    : raw
  const candidate = local.includes(',')
    ? local.slice(local.indexOf(',') + 1).trim().split(/\s+/)[0]
    : local.split(/\s+/)[0]
  return candidate ? candidate.charAt(0).toUpperCase() + candidate.slice(1) : ''
}
const pickFirstName = (user) => user?.firstName || firstNameOf(user?.name || user?.email)

function SourceChips({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null
  return (
    <div className="chat-sources">
      <span className="chat-sources-label">Sources</span>
      {sources.map((s) => {
        const label = SOURCE_LABELS[s.type] || s.type || 'Source'
        const title = s.title || `Source ${s.n}`
        const inner = (
          <>
            <span className="chat-source-num">[{s.n}]</span>
            <span className="chat-source-tag">{label}</span>
            <span className="chat-source-title">{title}</span>
          </>
        )
        return s.url ? (
          <a key={s.n} className="chat-source" href={s.url} target="_blank" rel="noreferrer" title={title}>{inner}</a>
        ) : (
          <span key={s.n} className="chat-source" title={title}>{inner}</span>
        )
      })}
    </div>
  )
}

export default function AskAiSection({ active, user, pendingAsk, onPendingConsumed }) {
  const [messages, setMessages] = useState([])  // {id, role, content, sources, streaming, error}
  const [input, setInput]       = useState('')
  const [busy, setBusy]         = useState(false)

  const scrollRef   = useRef(null)
  const textareaRef = useRef(null)
  const abortRef    = useRef(null)
  const busyRef     = useRef(false)
  // Mirror of `messages` so send() can read the latest history without
  // pulling it into useCallback deps (which would re-create the handler on
  // every keystroke) and without relying on setState-updater timing
  // (which is async in React 18 and was dropping the array on subsequent sends).
  const messagesRef = useRef([])

  const firstName = pickFirstName(user)

  // Auto-scroll to the newest content as it streams in, and keep the
  // ref in sync so send() always sees the latest turns.
  useEffect(() => {
    messagesRef.current = messages
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-grow the composer textarea.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  const send = useCallback(async (text) => {
    const q = (text || '').trim()
    if (!q || busyRef.current) return

    const userMsg = { id: nextId(), role: 'user', content: q }
    const aiMsg   = { id: nextId(), role: 'assistant', content: '', sources: [], streaming: true }

    // Snapshot the history to forward (prior turns + this user turn).
    // Read from the ref so we get the freshest state synchronously —
    // setState updater closures don't run in time for the fetch body below.
    const history = [...messagesRef.current, userMsg].map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg, aiMsg])
    setInput('')
    setBusy(true); busyRef.current = true

    const controller = new AbortController()
    abortRef.current = controller

    const patchAi = (patch) =>
      setMessages((prev) => prev.map((m) =>
        m.id === aiMsg.id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m))

    try {
      const res = await fetch('/api/ask', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ messages: history }),
        signal:      controller.signal,
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        patchAi({ streaming: false, error: data.error || `HTTP ${res.status}` })
        return
      }

      // Parse the SSE stream: events separated by a blank line.
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      const handleEvent = (raw) => {
        let event = 'message'
        const dataLines = []
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim()
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
        }
        if (dataLines.length === 0) return
        let data
        try { data = JSON.parse(dataLines.join('\n')) } catch { return }

        if (event === 'sources') {
          patchAi({ sources: Array.isArray(data.sources) ? data.sources : [] })
        } else if (event === 'delta') {
          patchAi((m) => ({ content: m.content + (data.text || '') }))
        } else if (event === 'error') {
          patchAi((m) => ({ streaming: false, error: data.message || 'Ask AI error', content: m.content }))
        } else if (event === 'done') {
          patchAi({ streaming: false })
        }
      }

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let idx
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const raw = buf.slice(0, idx)
          buf = buf.slice(idx + 2)
          if (raw.trim()) handleEvent(raw)
        }
      }
      // Ensure the bubble leaves the streaming state even if no `done` arrived.
      patchAi((m) => (m.streaming ? { streaming: false } : {}))
    } catch (err) {
      if (controller.signal.aborted) {
        patchAi((m) => ({ streaming: false, content: m.content || '', stopped: true }))
      } else {
        patchAi({ streaming: false, error: err.message || 'Network error reaching the Ask AI service.' })
      }
    } finally {
      setBusy(false); busyRef.current = false
      abortRef.current = null
    }
  }, [])

  function stop() {
    if (abortRef.current) abortRef.current.abort()
  }

  function newChat() {
    if (busyRef.current) stop()
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  function onSubmit(e) {
    e.preventDefault()
    send(input)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // Auto-send a question routed in from elsewhere in the portal.
  useEffect(() => {
    if (active && pendingAsk) {
      send(pendingAsk)
      onPendingConsumed?.()
    }
  }, [active, pendingAsk, send, onPendingConsumed])

  // Focus the composer when the page opens.
  useEffect(() => {
    if (active) textareaRef.current?.focus()
  }, [active])

  const empty = messages.length === 0

  return (
    <section className={`portal-section askai-section${active ? ' active' : ''}`} aria-label="Ask AI">
      <div className="chat">
        <div className="chat-head">
          <div className="chat-head-title">
            <span className="chat-head-mark" aria-hidden="true"><SparkleIcon size={16} /></span>
            <div>
              <div className="chat-head-name">Ask AI</div>
              <div className="chat-head-sub">Grounded in Forcepoint's internal sources · Forcepoint Intelligence Platform</div>
            </div>
          </div>
          <button type="button" className="chat-newbtn" onClick={newChat} disabled={empty && !busy}>
            New chat
          </button>
        </div>

        <div className="chat-scroll" ref={scrollRef}>
          {empty ? (
            <div className="chat-empty">
              <div className="chat-empty-mark" aria-hidden="true"><SparkleIcon size={26} /></div>
              <h2 className="chat-empty-title">
                {firstName ? `Hi ${firstName}, how can I help?` : 'How can I help?'}
              </h2>
              <p className="chat-empty-sub">
                Ask anything about AI at Forcepoint — policy, tools, skills, prompts and programs.
                Answers are grounded in approved internal sources and cite where they came from.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chat-suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-thread">
              {messages.map((m) => (
                <div key={m.id} className={`chat-msg chat-msg-${m.role}`}>
                  {m.role === 'assistant' && (
                    <span className="chat-avatar" aria-hidden="true"><SparkleIcon size={14} /></span>
                  )}
                  <div className="chat-bubble-wrap">
                    {m.role === 'assistant' && <div className="chat-role">Ask AI</div>}
                    <div className="chat-bubble">
                      {m.content && <span className="chat-text">{m.content}</span>}
                      {m.streaming && <span className="chat-caret" aria-hidden="true" />}
                      {m.role === 'assistant' && m.streaming && !m.content && (
                        <span className="chat-typing" aria-label="Thinking">
                          <span /><span /><span />
                        </span>
                      )}
                      {m.error && <span className="chat-error">{m.error}</span>}
                    </div>
                    {m.role === 'assistant' && !m.streaming && <SourceChips sources={m.sources} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={onSubmit}>
          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              className="chat-input"
              rows={1}
              placeholder="Ask anything about AI at Forcepoint…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message Ask AI"
            />
            {busy ? (
              <button type="button" className="chat-send is-stop" onClick={stop} aria-label="Stop generating" title="Stop">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
              </button>
            ) : (
              <button type="submit" className="chat-send" disabled={!input.trim()} aria-label="Send message" title="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
          <div className="chat-disclaimer">
            Ask AI can make mistakes. Verify important details and never share Protected Information, source code or customer PII.
          </div>
        </form>
      </div>
    </section>
  )
}
