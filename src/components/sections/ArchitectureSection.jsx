import { PORTAL_DATA } from '../../data/portal.js'
import { ArrowRight, FileIcon, ExternalLinkIcon } from '../ui/icons.jsx'
import './ArchitectureSection.css'

// Two reference PDFs live in /public and ride the page as the lead heroes.
// Using encodeURI on the filename keeps spaces and parens valid in the href
// without forcing a rename of the source file.
const DOC_HEROES = [
  {
    eyebrow: 'Document · Draft',
    title:   'Architecture Design Document',
    meta:    'ADD · v2.7 · Draft L1',
    desc:    'The full architecture spec for Forcepoint Enterprise AI — MCP platform, LangGraph, NMAP, Claude integration, and how the pieces fit.',
    file:    'Architecture Design Document (ADD) draft l1. v2.7.pdf',
  },
  {
    eyebrow: 'Standard · Draft',
    title:   'Enterprise AI Standard',
    meta:    'Standard · v1.1.1 · Draft',
    desc:    'The policy and review standard that governs every skill, prompt, and integration shipped on the platform.',
    file:    'Forcepoint_Enterprise_AI_Standard_v1_1_1_Draft.pdf',
  },
]

export default function ArchitectureSection({ active, onAskQuick }) {
  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="arch-doc-heroes">
        {DOC_HEROES.map((d) => (
          <a
            key={d.file}
            className="arch-doc-hero"
            href={`/${encodeURI(d.file)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="arch-doc-hero-eyebrow">
              <FileIcon size={12} />
              {d.eyebrow}
            </span>
            <div className="arch-doc-hero-title">{d.title}</div>
            <div className="arch-doc-hero-meta">{d.meta}</div>
            <div className="arch-doc-hero-desc">{d.desc}</div>
            <span className="arch-doc-hero-cta">
              Open PDF
              <ExternalLinkIcon size={12} />
            </span>
          </a>
        ))}
      </div>

      <div className="section-header">
        <div className="section-header-text">
          <h2>Architecture &amp; IT guidance</h2>
          <p>How to work with IT on AI integration, what IT owns and where the boundaries are.</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAskQuick('Explain the Forcepoint Enterprise AI architecture — what is the MCP platform, LangGraph and NMAP, and how do they relate to Claude?')}
          >
            Explore the architecture
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {PORTAL_DATA.architecture.map((block, i) => (
        <div className={`arch-block${block.colorClass ? ` ${block.colorClass}` : ''}`} key={i}>
          <div className="arch-title">{block.title}</div>
          <div className="arch-items">{block.items.join(' · ')}</div>
        </div>
      ))}
    </section>
  )
}
