'use client'

import { useState, useEffect } from 'react'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  
  const [fullName, setFullName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [empRes, depRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments')
      ])
      setEmployees(await empRes.json())
      setDepartments(await depRes.json())
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !departmentId) return

    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, departmentId, position, email })
      })
      
      setFullName('')
      setDepartmentId('')
      setPosition('')
      setEmail('')
      
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цього співробітника?')) return
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Співробітники</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Додати співробітника</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>ПІБ *</label>
            <input 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              placeholder="Шевченко Тарас"
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Відділ *</label>
            <select 
              value={departmentId} 
              onChange={e => setDepartmentId(e.target.value)} 
              required
            >
              <option value="">Оберіть відділ...</option>
              {departments.map((dep: any) => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Посада</label>
            <input 
              value={position} 
              onChange={e => setPosition(e.target.value)} 
              placeholder="Менеджер"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="taras@example.com"
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
            <button type="submit" className="btn">Додати</button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h2>Список співробітників</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ПІБ</th>
                <th>Відділ</th>
                <th>Посада</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 500 }}>{emp.fullName}</td>
                  <td>{emp.department?.name}</td>
                  <td>{emp.position || '-'}</td>
                  <td>{emp.email || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає співробітників
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
