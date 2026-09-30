import { entryCategory } from './categoryUtils'
import { minutesToClock, formatDecimalHours } from './timeUtils'

// Build a single-category report over an inclusive date range.
// Dates are 'YYYY-MM-DD' strings, so lexicographic compare == chronological compare.
// "What it's for" is the job name for Invoicery/Frilans; childcare has no job, so it
// falls back to "Child Care".
export function buildReport(entries, category, fromDate, toDate) {
  const rows = (entries || [])
    .filter(e => entryCategory(e) === category && e.date >= fromDate && e.date <= toDate)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.created_at || '').localeCompare(b.created_at || '')))
    .map(e => ({
      id: e.id,
      date: e.date,
      description: e.job_name || 'Child Care',
      minutes: e.minutes,
    }))
  const totalMinutes = rows.reduce((sum, r) => sum + (r.minutes || 0), 0)
  return { rows, totalMinutes }
}

// RFC-4180-ish escaping: wrap in quotes and double any embedded quotes when the
// field contains a comma, quote, or newline.
function csvField(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toReportCSV({ rows, totalMinutes }) {
  const lines = ['Date,For,Hours:Minutes,Decimal Hours']
  for (const r of rows) {
    lines.push([r.date, csvField(r.description), minutesToClock(r.minutes), formatDecimalHours(r.minutes)].join(','))
  }
  lines.push(['Total', '', minutesToClock(totalMinutes), formatDecimalHours(totalMinutes)].join(','))
  return lines.join('\n') + '\n'
}
