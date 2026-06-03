export default function ProjectSection({ active }) {
  return (
    <section className={`portal-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div className="section-header-text">
          <h2>Project</h2>
          <p>This space is under active development. It will host project tracking and updates for the Enterprise AI program — check back soon.</p>
        </div>
        <div className="section-header-actions">
          <span className="badge badge-new">In development</span>
        </div>
      </div>

      <div className="list-items">
        <div className="list-item">
          <div className="list-body">
            <span className="badge badge-new">In development</span>
            <div className="list-title">Coming soon</div>
            <div className="list-desc">
              The Project area isn't ready yet — we're building it out now. Content will appear here as it comes online.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
