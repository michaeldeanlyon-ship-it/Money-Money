import { Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Money Money</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        App coming soon.
      </p>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>404</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Page not found.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
