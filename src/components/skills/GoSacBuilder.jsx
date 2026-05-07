import { useState, useEffect, useRef } from 'react'
import JSZip from 'jszip'
import { ChevronDown, DownloadIcon, SparkleIcon } from '../ui/icons.jsx'
import './skills.css'

const SKILL_MD = `---
name: go-sac
description: Trigger ONLY when user says "go sac". Fetch the next Sacramento Republic FC game and return date, time, opponent, and location. Nothing else.
author: Jim Costigan, AI Program Manager — Enterprise AI
---

# Go Sac

Trigger: user says **"go sac"**

1. Fetch \`https://www.sacrepublicfc.com/schedule/\`
2. Find the next future game
3. Return only:

\`\`\`
📅 [Date]
🕐 [Time PT]
🆚 [Opponent]
📍 [Location]
\`\`\`
`

export default function GoSacBuilder() {
  const wrapRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('Click to download your Go Sac skill ZIP.')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fade in on mount
    requestAnimationFrame(() => setVisible(true))
    setTimeout(() => {
      wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }, [])

  const download = async () => {
    const zip = new JSZip()
    zip.folder('go-sac').file('SKILL.md', SKILL_MD)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'go-sac.zip'; a.click()
    URL.revokeObjectURL(url)
    setStatus('go-sac.zip downloaded — install it at claude.ai/customize/skills and type "go sac" to try it!')
  }

  return (
    <div
      ref={wrapRef}
      className="skill-builder-wrap"
      style={{ marginTop: '1rem', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      <button
        type="button"
        className={`skill-builder-header${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <div className="ss-header-left">
          <div className="ss-header-icon ss-header-icon-teal">2</div>
          <div className="ss-header-text">
            <div className="ss-header-title">Skill #2 — Go Sac</div>
            <div className="ss-header-sub">A live-data skill: type "go sac" → get the next Sacramento Republic FC game</div>
          </div>
        </div>
        <div className="ss-header-right">
          <span className="badge badge-design">Live data</span>
          <ChevronDown size={16} className={`sb-chevron${isOpen ? ' open' : ''}`} />
        </div>
      </button>

      <div className={`skill-builder-body${isOpen ? '' : ' collapsed'}`}>
        {/* Left: explainer + download */}
        <div className="skill-builder-form">
          <p className="gosac-intro">
            This skill goes beyond static responses — it fetches <strong>live data from the web</strong>.
            When you type <code className="ss-code">go sac</code> in Claude,
            it visits the Sacramento Republic FC schedule and returns only:
          </p>

          <ul className="gosac-list">
            <li>Date of the next game</li>
            <li>Kickoff time (Pacific)</li>
            <li>Opponent</li>
            <li>Venue / location</li>
          </ul>

          <div className="gosac-callout">
            <div className="gosac-callout-head">
              <SparkleIcon size={14} />
              What makes this different
            </div>
            <p>
              Hello World showed you how to make Claude respond with fixed text.
              Go Sac shows you how to make Claude <em>go get something</em> — live from the internet — and return only what matters.
              That's the foundation of data-connected skills.
            </p>
          </div>

          <div className="sb-actions">
            <button type="button" className="sb-btn-primary" onClick={download}>
              <DownloadIcon size={12} />
              Download go-sac.skill
            </button>
          </div>
          <div className="sb-status">{status}</div>
        </div>

        {/* Right: SKILL.md preview */}
        <div className="skill-builder-preview">
          <div className="skill-preview-bar">
            <span className="skill-preview-dot"></span>
            <span className="skill-preview-dot"></span>
            <span className="skill-preview-dot"></span>
            <span className="skill-preview-name">SKILL.md</span>
          </div>
          <pre className="skill-preview-code">
            <span className="sp-sep">---</span>{'\n'}
            <span className="sp-key">name</span><span className="sp-sep">: </span><span className="sp-val">go-sac</span>{'\n'}
            <span className="sp-key">description</span><span className="sp-sep">: </span><span className="sp-val">Trigger ONLY when user says</span>{'\n'}
            <span className="sp-val">             "go sac". Fetch the next</span>{'\n'}
            <span className="sp-val">             Sacramento Republic FC game</span>{'\n'}
            <span className="sp-val">             and return date, time,</span>{'\n'}
            <span className="sp-val">             opponent, and location.</span>{'\n'}
            <span className="sp-sep">---</span>{'\n\n'}
            <span className="sp-heading"># Go Sac</span>{'\n\n'}
            <span className="sp-body">Trigger: user says <strong>go sac</strong></span>{'\n\n'}
            <span className="sp-num">1. </span><span className="sp-body">Fetch sacrepublicfc.com/schedule/</span>{'\n'}
            <span className="sp-num">2. </span><span className="sp-body">Find the next future game</span>{'\n'}
            <span className="sp-num">3. </span><span className="sp-body">Return only:</span>{'\n'}
            <span className="sp-body">   📅 Date  🕐 Time</span>{'\n'}
            <span className="sp-body">   🆚 Opponent  📍 Location</span>
          </pre>
        </div>
      </div>
    </div>
  )
}
