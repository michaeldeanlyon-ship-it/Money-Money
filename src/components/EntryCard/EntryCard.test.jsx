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

  it('calls onEdit with the entry when the edit button is clicked', async () => {
    const onEdit = vi.fn()
    const entry = { id: 3, type: 'job', job_name: 'X', job_label: 'Frilans', minutes: 116 }
    render(<EntryCard entry={entry} onEdit={onEdit} onDelete={noop} />)
    screen.getByTitle('Edit').click()
    expect(onEdit).toHaveBeenCalledWith(entry)
  })
})
