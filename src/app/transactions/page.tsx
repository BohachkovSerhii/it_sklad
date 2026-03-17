'use client'

import { useState, useEffect } from 'react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  
  // Form state
  const [assetId, setAssetId] = useState('')
  const [type, setType] = useState('Видача')
  const [fromEmployeeId, setFromEmployeeId] = useState('')
  const [toEmployeeId, setToEmployeeId] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [txRes, assRes, empRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/assets'),
        fetch('/api/employees')
      ])
      setTransactions(await txRes.json())
      setAssets(await assRes.json())
      setEmployees(await empRes.json())
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetId || !type) return

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assetId, 
          type, 
          fromEmployeeId, 
          toEmployeeId 
        })
      })
      
      setAssetId('')
      setType('Видача')
      setFromEmployeeId('')
      setToEmployeeId('')
      
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цю транзакцію з історії? (Це не змінить статус обладнання)')) return
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Транзакції</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Нова транзакція</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Обладнання *</label>
            <select value={assetId} onChange={e => setAssetId(e.target.value)} required>
              <option value="">Оберіть...</option>
              {assets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.inventoryNumber || 'Без інв.'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Тип транзакції *</label>
            <select value={type} onChange={e => setType(e.target.value)} required>
              <option value="Видача">Видача співробітнику</option>
              <option value="Повернення">Повернення на склад</option>
              <option value="Списання">Списання</option>
              <option value="Ремонт">Передача в ремонт</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Від кого (опціонально)</label>
            <select value={fromEmployeeId} onChange={e => setFromEmployeeId(e.target.value)}>
              <option value="">Зі складу (немає)</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Кому (опціонально)</label>
            <select value={toEmployeeId} onChange={e => setToEmployeeId(e.target.value)}>
              <option value="">На склад / В утиль (немає)</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn">Створити запис</button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h2>Історія транзакцій</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Обладнання</th>
                <th>Від кого</th>
                <th>Кому</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleString('uk-UA')}</td>
                  <td>
                    <span className={`badge ${tx.type === 'Видача' ? 'active' : tx.type === 'Списання' ? 'broken' : ''}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {tx.asset?.name} <br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {tx.asset?.inventoryNumber}
                    </span>
                  </td>
                  <td>{tx.fromEmployee?.fullName || <span style={{ color: 'var(--text-secondary)' }}>Склад</span>}</td>
                  <td>{tx.toEmployee?.fullName || <span style={{ color: 'var(--text-secondary)' }}>Склад/Утиль</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає транзакцій
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
