// Shared date helpers used across the portal (Events, Home upcoming widget, etc.).
// All functions work in the user's local timezone — important because event
// dates are authored as plain calendar days ("2026-05-14"), not instants.

/** Parse "YYYY-MM-DD" as a local-timezone Date (avoids UTC-midnight shift). */
export function parseLocalDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Format a Date as "YYYY-MM-DD" in local timezone. */
export function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "12:00" → "12:00 PM" */
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = ((h + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

/** "12:00", "13:30", "CT" → "12:00 PM – 1:30 PM CT" */
export function formatTimeRange(start, end, tz) {
  return `${formatTime(start)} – ${formatTime(end)} ${tz}`
}

/** Minutes between two "HH:MM" times. */
export function durationMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

/** Today at 00:00:00 in local timezone (cache-safe; create once per render). */
export function todayLocal() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const WEEKDAY_INITIALS = ['S','M','T','W','T','F','S']
