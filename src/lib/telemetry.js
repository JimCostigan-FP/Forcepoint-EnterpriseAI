// Skill-creator telemetry shim.
// v0: console.log only. v1 swaps in the real sink (Jim's dashboard).
//
// Event names match the brief: draft_started, draft_abandoned,
// test_run, draft_submitted. Don't rename without updating the brief.

const sink = (event, payload) => {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-console
  console.info('[telemetry]', event, payload)
}

export const telemetry = {
  draftStarted:   (payload = {}) => sink('draft_started',   { ts: Date.now(), ...payload }),
  draftAbandoned: (payload = {}) => sink('draft_abandoned', { ts: Date.now(), ...payload }),
  testRun:        (payload = {}) => sink('test_run',        { ts: Date.now(), ...payload }),
  draftSubmitted: (payload = {}) => sink('draft_submitted', { ts: Date.now(), ...payload }),
}
