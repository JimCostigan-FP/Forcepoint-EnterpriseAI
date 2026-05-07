import { SparkleIcon } from '../ui/icons.jsx'
import './AskAIFloat.css'

export default function AskAIFloat({ onClick }) {
  return (
    <button
      type="button"
      className="ask-ai-float"
      onClick={onClick}
      aria-label="Ask AI"
      title="Ask AI"
    >
      <span className="ask-ai-float-glyph">
        <SparkleIcon size={12} />
      </span>
      <span className="ask-ai-float-label">Ask AI</span>
    </button>
  )
}
