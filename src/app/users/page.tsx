'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = (session?.user as any)?.role === 'admin'

  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [session, isAdmin, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setUsers(await res.json())
      } else {
        setError('Помилка завантаження користувачів')
      }
    } catch (err) {
      setError('Помилка мережі')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!login || !password || !role) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password, role }),
      })

      if (res.ok) {
        setSuccess(`Користувача ${login} успішно створено`)
        setLogin('')
        setPassword('')
        setRole('viewer')
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Помилка при створенні користувача')
      }
    } catch (err) {
      setError('Помилка мережі')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number, userLogin: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити користувача ${userLogin}?`)) return

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка при видаленні')
      }
    } catch (err) {
      alert('Помилка мережі')
    }
  }

  if (loading) return <div className="loading">Завантаження...</div>
  if (!isAdmin) return null // Handled by useEffect redirect

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Управління користувачами</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Створити нового користувача</h2>
        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          alignItems: 'end'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Логін</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="Введіть логін"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Роль</label>
            <select value={role} onChange={e => setRole(e.target.value)} required>
              <option value="viewer">Переглядач (Viewer)</option>
              <option value="editor">Редактор (Editor)</option>
              <option value="admin">Адміністратор (Admin)</option>
            </select>
          </div>
          <div style={{ paddingBottom: '0.2rem' }}>
            <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Створення...' : 'Додати користувача'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: '1rem', color: '#10b981', fontSize: '0.875rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
            ✅ {success}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h2>Список користувачів</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Логін</th>
                <th>Роль</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.login}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' :
                                  u.role === 'editor' ? 'rgba(59, 130, 246, 0.2)' :
                                  'rgba(148, 163, 184, 0.2)',
                      color: u.role === 'admin' ? '#a78bfa' :
                             u.role === 'editor' ? '#60a5fa' :
                             'var(--text-secondary)',
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(u.id, u.login)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      disabled={String(u.id) === (session?.user as any)?.id}
                      title={String(u.id) === (session?.user as any)?.id ? "Ви не можете видалити самого себе" : "Видалити"}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Користувачів не знайдено
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
