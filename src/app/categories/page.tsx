'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const canEdit = role === 'admin' || role === 'editor'

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      setName('')
      fetchCategories()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цю категорію?')) return
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      fetchCategories()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Категорії обладнання</h1>
      </div>

      {canEdit && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2>Додати категорію</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label>Назва категорії</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Напр. Смартфон"
                required
              />
            </div>
            <button type="submit" className="btn" style={{ minWidth: '120px' }}>Додати</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h2>Список категорій</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                {canEdit && <th style={{ textAlign: 'right' }}>Дії</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  {canEdit && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Видалити
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 3 : 2} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає категорій
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
