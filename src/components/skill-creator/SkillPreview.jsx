import { useState } from 'react'
import { FileCodeIcon, CopyIcon } from '../ui/icons.jsx'

// Inline preview: shows the assembled SKILL.md and lets the submitter
// edit it. Edits flow back through onChange so tier + test stay in sync.

export default function SkillPreview({ markdown, onChange }) {
  const [mode, setMode] = useState('rendered')
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(markdown).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <div className="sc-preview">
      <div className="sc-preview-head">
        <div className="sc-preview-title">
          <FileCodeIcon size={14} />
          SKILL.md preview
        </div>
        <div className="sc-preview-actions">
          <div className="sc-segmented" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'rendered'}
              className={`sc-segmented-btn${mode === 'rendered' ? ' is-active' : ''}`}
              onClick={() => setMode('rendered')}
            >
              Rendered
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'edit'}
              className={`sc-segmented-btn${mode === 'edit' ? ' is-active' : ''}`}
              onClick={() => setMode('edit')}
            >
              Edit raw
            </button>
          </div>
          <button type="button" className="sb-btn-ghost sb-btn-xs" onClick={copy}>
            <CopyIcon size={11} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {mode === 'rendered' ? (
        <pre className="sc-preview-code">{markdown}</pre>
      ) : (
        <textarea
          className="sb-input sc-preview-edit"
          value={markdown}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          aria-label="Edit raw skill markdown"
        />
      )}
    </div>
  )
}
