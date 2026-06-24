import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryFilter from './CategoryFilter'
import { useAppContext } from '../../context/AppContext'

vi.mock('../../context/AppContext', () => ({
  useAppContext: vi.fn(),
}))

beforeEach(() => {
  useAppContext.mockReset()
})

describe('CategoryFilter', () => {
  it('renders All + the three category buttons', () => {
    useAppContext.mockReturnValue({ filter: 'all', setFilter: vi.fn() })
    render(<CategoryFilter />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invoicery' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Frilans' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Childcare' })).toBeInTheDocument()
  })

  it('marks the active button based on the current filter', () => {
    useAppContext.mockReturnValue({ filter: 'frilans', setFilter: vi.fn() })
    render(<CategoryFilter />)
    expect(screen.getByRole('button', { name: 'Frilans' }).className).toContain('active')
    expect(screen.getByRole('button', { name: 'All' }).className).not.toContain('active')
  })

  it('calls setFilter with the category key when a button is clicked', () => {
    const setFilter = vi.fn()
    useAppContext.mockReturnValue({ filter: 'all', setFilter })
    render(<CategoryFilter />)
    screen.getByRole('button', { name: 'Childcare' }).click()
    expect(setFilter).toHaveBeenCalledWith('childcare')
  })

  it('calls setFilter with "all" when All is clicked', () => {
    const setFilter = vi.fn()
    useAppContext.mockReturnValue({ filter: 'frilans', setFilter })
    render(<CategoryFilter />)
    screen.getByRole('button', { name: 'All' }).click()
    expect(setFilter).toHaveBeenCalledWith('all')
  })
})
