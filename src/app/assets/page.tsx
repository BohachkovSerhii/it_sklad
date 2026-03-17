'use client'

import { useState, useEffect } from 'react'

export default function AssetsPage() {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [employees, setEmployees] = useState([])
  
  // Form state
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [inventoryNumber, setInventoryNumber] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('Active')
  const [employeeId, setEmployeeId] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [assRes, catRes, empRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/categories'),
        fetch('/api/employees')
      ])
      setAssets(await assRes.json())
      setCategories(await catRes.json())
      setEmployees(await empRes.json())
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !categoryId) return

    try {
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          model, 
          inventoryNumber, 
          serialNumber, 
          categoryId, 
          status, 
          employeeId 
        })
      })
      
      setName('')
      setModel('')
      setInventoryNumber('')
      setSerialNumber('')
      setCategoryId('')
      setStatus('Active')
      setEmployeeId('')
      
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити це обладнання?')) return
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Обладнання (ОЗ)</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Додати нове обладнання</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Назва *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ноутбук Asus" required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Категорія *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">Оберіть...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.codePrefix})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Модель</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="ZenBook 14" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Інвентарний №</label>
            <input value={inventoryNumber} onChange={e => setInventoryNumber(e.target.value)} placeholder="INV-10023" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Серійний №</label>
            <input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="SN..." />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Статус</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Active">Активне</option>
              <option value="In Repair">В ремонті</option>
              <option value="Written Off">Списане</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Відповідальний</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
              <option value="">На складі (немає)</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn">Додати ОЗ</button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h2>Список обладнання</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Назва / Модель</th>
                <th>Інв. № / Серійник</th>
                <th>Категорія</th>
                <th>Статус</th>
                <th>Відповідальний</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{asset.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{asset.model || '-'}</div>
                  </td>
                  <td>
                    <div>{asset.inventoryNumber || 'Без інв. №'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SN: {asset.serialNumber || '-'}</div>
                  </td>
                  <td><span className="badge">{asset.category?.name}</span></td>
                  <td>
                    <span className={`badge ${asset.status === 'Active' ? 'active' : asset.status === 'Written Off' ? 'broken' : ''}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.employee?.fullName || <span style={{ color: 'var(--text-secondary)' }}>На складі</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(asset.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає обладнання
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
