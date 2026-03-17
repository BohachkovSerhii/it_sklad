'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  totalAssets: number
  activeAssets: number
  totalEmployees: number
  recentTransactions: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetsRes, employeesRes, transactionsRes] = await Promise.all([
          fetch('/api/assets'),
          fetch('/api/employees'),
          fetch('/api/transactions')
        ])
        
        const assets = await assetsRes.json()
        const employees = await employeesRes.json()
        const transactions = await transactionsRes.json()

        setData({
          totalAssets: assets.length,
          activeAssets: assets.filter((a: any) => a.status === 'Active').length,
          totalEmployees: employees.length,
          recentTransactions: transactions.slice(0, 5)
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div>
        <h1>Дашборд</h1>
        <div style={{ opacity: 0.5 }}>Завантаження даних...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Дашборд</h1>
        <Link href="/assets" className="btn">
          <span>+</span> Нове Обладнання
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-label">Всього обладнання</div>
          <div className="stat-value">{data?.totalAssets}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Активне обладнання</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{data?.activeAssets}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Співробітники</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{data?.totalEmployees}</div>
        </div>
      </div>

      <div className="glass-card">
        <h2>Останні транзакції</h2>
        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Обладнання</th>
                  <th>Від кого</th>
                  <th>Кому</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString('uk-UA')}</td>
                    <td>
                      <span className={`badge ${tx.type === 'Видача' ? 'active' : ''}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.asset?.name} ({tx.asset?.inventoryNumber})</td>
                    <td>{tx.fromEmployee?.fullName || '-'}</td>
                    <td>{tx.toEmployee?.fullName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Немає недавніх транзакцій.</p>
        )}
      </div>
    </div>
  )
}
