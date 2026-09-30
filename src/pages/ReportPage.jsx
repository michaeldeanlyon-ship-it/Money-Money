import { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { useEntries } from '../hooks/useEntries'
import { buildReport, toReportCSV } from '../utils/reportUtils'
import { minutesToClock, formatDecimalHours } from '../utils/timeUtils'
import { today } from '../utils/dateUtils'
import './ReportPage.css'

// Only the three categories the report covers (School is excluded).
const REPORT_CATEGORIES = [
  { key: 'invoicery', label: 'Invoicery' },
  { key: 'frilans', label: 'Frilans' },
  { key: 'childcare', label: 'Childcare' },
]

function currentMonthRange() {
  const t = today() // YYYY-MM-DD
  const [y, m] = t.split('-')
  const lastDay = new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate()
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${String(lastDay).padStart(2, '0')}` }
}

function categoryLabel(key) {
  return REPORT_CATEGORIES.find(c => c.key === key)?.label || key
}

export default function ReportPage() {
  const { filter } = useAppContext()
  const defaults = useMemo(currentMonthRange, [])

  const [category, setCategory] = useState(
    REPORT_CATEGORIES.some(c => c.key === filter) ? filter : 'invoicery'
  )
  const [fromDate, setFromDate] = useState(defaults.from)
  const [toDate, setToDate] = useState(defaults.to)

  // Guard against an inverted range so useEntries never queries to < from.
  const validRange = fromDate <= toDate
  const { entries, loading } = useEntries(
    validRange ? fromDate : toDate,
    validRange ? toDate : fromDate
  )

  const report = useMemo(
    () => buildReport(entries, category, fromDate, toDate),
    [entries, category, fromDate, toDate]
  )
  const { rows, totalMinutes } = report

  function handleDownloadCsv() {
    const csv = toReportCSV(report, { category, fromDate, toDate })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${category}_${fromDate}_${toDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="report-page">
      <div className="report-header no-print">
        <h1 className="report-title">Report</h1>
        <div className="report-actions">
          <button className="report-btn" onClick={handleDownloadCsv} disabled={rows.length === 0}>
            Download CSV
          </button>
          <button className="report-btn" onClick={() => window.print()} disabled={rows.length === 0}>
            Print
          </button>
        </div>
      </div>

      <div className="report-controls no-print">
        <div className="report-field">
          <label>Category</label>
          <div className="report-cat-tabs">
            {REPORT_CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                className={`report-cat-btn ${category === key ? 'active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="report-field">
          <label htmlFor="report-from">Start</label>
          <input
            id="report-from"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>
        <div className="report-field">
          <label htmlFor="report-to">End</label>
          <input
            id="report-to"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="report-caption">
        <strong>{categoryLabel(category)}</strong> · {fromDate} → {toDate}
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : rows.length === 0 ? (
        <p className="report-empty">No entries for this selection.</p>
      ) : (
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>For</th>
                <th className="ta-right">Hours:Minutes</th>
                <th className="ta-right">Decimal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td className="rt-for">{r.description}</td>
                  <td className="ta-right">{minutesToClock(r.minutes)}</td>
                  <td className="ta-right">{formatDecimalHours(r.minutes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="rt-total-label" colSpan={2}>Total</td>
                <td className="ta-right rt-total">{minutesToClock(totalMinutes)}</td>
                <td className="ta-right rt-total">{formatDecimalHours(totalMinutes)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
