import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EntryCard from './EntryCard'

const noop = () => {}

describe('EntryCard', () => {
  it('renders a Job entry with name, invoicer badge, and "100% · 7h 46m"', () => {
    const entry = {
      id: 1,
      type: 'job',
      job_name: 'Acme Corp',
      job_label: 'Invoicery',
      minutes: 466,
    }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Invoicery')).toBeInTheDocument()
    expect(screen.getByText('100% · 7h 46m')).toBeInTheDocument()
  })

  it('renders a Child Care entry with title "Child Care" and "50% · 3h 53m"', () => {
    const entry = { id: 2, type: 'childcare', minutes: 233 }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('Child Care')).toBeInTheDocument()
    expect(screen.getByText('Childcare')).toBeInTheDocument() // badge
    expect(screen.getByText('50% · 3h 53m')).toBeInTheDocument()
  })

  it('renders a School entry with title/badge "School" and plain hours, no % framing', () => {
    const entry = { id: 4, type: 'school', minutes: 150 }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getAllByText('School')).toHaveLength(2) // title + badge
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
    // hours-based, so no "50% · …" percentage framing
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it('renders a non-bucket Job entry as plain h/m with no % framing', () => {
    const entry = { id: 5, type: 'job', job_name: 'Acme Corp', job_label: 'Invoicery', minutes: 240 }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('4h')).toBeInTheDocument()
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it('renders a non-bucket Child Care entry as plain h/m with no % framing', () => {
    const entry = { id: 6, type: 'childcare', minutes: 390 }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('6h 30m')).toBeInTheDocument()
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it('keeps the "% · h/m" form for an exact-bucket Child Care entry', () => {
    const entry = { id: 8, type: 'childcare', minutes: 116 }
    render(<EntryCard entry={entry} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('25% · 1h 56m')).toBeInTheDocument()
  })

  it('calls onEdit with the entry when the edit button is clicked', async () => {
    const onEdit = vi.fn()
    const entry = { id: 3, type: 'job', job_name: 'X', job_label: 'Frilans', minutes: 116 }
    render(<EntryCard entry={entry} onEdit={onEdit} onDelete={noop} />)
    screen.getByTitle('Edit').click()
    expect(onEdit).toHaveBeenCalledWith(entry)
  })
})
