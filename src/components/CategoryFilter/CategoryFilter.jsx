import { useAppContext } from '../../context/AppContext'
import { CATEGORIES } from '../../utils/categoryUtils'
import './CategoryFilter.css'

export default function CategoryFilter() {
  const { filter, setFilter } = useAppContext()

  return (
    <div className="category-filter">
      <button
        className={`cf-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => setFilter('all')}
      >All</button>
      {CATEGORIES.map(({ key, label }) => (
        <button
          key={key}
          className={`cf-btn cf-${key} ${filter === key ? 'active' : ''}`}
          onClick={() => setFilter(key)}
        >{label}</button>
      ))}
    </div>
  )
}
