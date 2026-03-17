'use client'

import { useState, useEffect } from 'react'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      setDepartments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      setName('')
      fetchDepartments()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей відділ?')) return
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      fetchDepartments()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Відділи</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Додати відділ</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Назва відділу</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Напр. IT Відділ"
              required 
            />
          </div>
          <button type="submit" className="btn">Додати</button>
        </form>
      </div>

      <div className="glass-card">
        <h2>Список відділів</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept: any) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>{dept.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає відділів
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
