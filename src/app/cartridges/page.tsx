'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

export default function CartridgesPage() {
  const [cartridges, setCartridges] = useState([])
  const [assets, setAssets] = useState<any[]>([])
  const [modelName, setModelName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [printerCompatibility, setPrinterCompatibility] = useState('')
  const [countNew, setCountNew] = useState(0)
  const [countEmpty, setCountEmpty] = useState(0)
  const [countRefilling, setCountRefilling] = useState(0)
  const [loading, setLoading] = useState(true)
  const [barcodeItem, setBarcodeItem] = useState<any>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const canEdit = role === 'admin' || role === 'editor'

  useEffect(() => { 
    fetchData()
    fetchAssets()
  }, [])

  useEffect(() => {
    if (barcodeItem && svgRef.current) {
      import('jsbarcode').then(({ default: JsBarcode }) => {
        // Use manual barcode if available, otherwise use CRT-{id}
        const barcodeValue = barcodeItem.barcode || `CRT-${barcodeItem.id}`
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128',
          lineColor: '#f8fafc',
          background: 'transparent',
          displayValue: true,
          text: `${barcodeValue} | ${barcodeItem.modelName}`,
          fontOptions: 'bold',
          fontSize: 14,
          margin: 20,
        })
      })
    }
  }, [barcodeItem])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cartridges')
      setCartridges(await res.json())
    } finally { setLoading(false) }
  }

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      // Filter for assets that are printers (category "Принтери")
      // In a real app we might want to check category ID or name more robustly
      setAssets(data)
    } catch (error) { console.error(error) }
  }

  const printers = assets.filter(a => a.category?.name === 'Принтери')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelName) return
    try {
      await fetch('/api/cartridges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelName, 
          barcode: barcode || null,
          printerCompatibility, 
          countNew, 
          countEmpty, 
          countRefilling 
        })
      })
      setModelName(''); setBarcode(''); setPrinterCompatibility('')
      setCountNew(0); setCountEmpty(0); setCountRefilling(0)
      fetchData()
    } catch (error) { console.error(error) }
  }

  const handleUpdateCount = async (id: number, field: string, value: number) => {
    if (value < 0) return
    try {
      await fetch(`/api/cartridges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      fetchData()
    } catch (error) { console.error(error) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей картридж?')) return
    try {
      await fetch(`/api/cartridges/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) { console.error(error) }
  }

  const handlePrint = () => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Штрих-код: ${barcodeItem?.modelName}</title>
      <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#f8fafc;font-family:sans-serif;flex-direction:column;gap:1rem;}h2{font-size:1rem;opacity:.7}</style>
      </head><body>
        <h2>🖨️ ${barcodeItem?.modelName}</h2>
        ${svgData}
        <script>window.onload=()=>window.print()</script>
      </body></html>`)
    win.document.close()
  }

  if (loading) return <div>Завантаження...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Картриджі</h1>
      </div>

      {canEdit && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2>Додати модель картриджа</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Модель картриджа *</label>
              <input value={modelName} onChange={e => setModelName(e.target.value)} placeholder="Напр. HP 85A (CE285A)" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Штрих-код (залиште порожнім для автогенерації)</label>
              <input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Введіть або відскануйте..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Сумісний принтер</label>
              <select value={printerCompatibility} onChange={e => setPrinterCompatibility(e.target.value)}>
                <option value="">-- Оберіть принтер --</option>
                {printers.map(p => (
                  <option key={p.id} value={`${p.name} ${p.model || ''}`}>
                    {p.name} {p.model ? `(${p.model})` : ''} - {p.inventoryNumber}
                  </option>
                ))}
                {!printers.length && <option disabled>Принтери не знайдені в базі</option>}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Кількість нових</label>
              <input type="number" min="0" value={countNew} onChange={e => setCountNew(parseInt(e.target.value) || 0)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'row', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Порожніх</label>
                <input type="number" min="0" value={countEmpty} onChange={e => setCountEmpty(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>В заправці</label>
                <input type="number" min="0" value={countRefilling} onChange={e => setCountRefilling(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn">Додати</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h2>Склад картриджів</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Модель</th>
                <th>Штрих-код</th>
                <th>Сумісність</th>
                <th>Нові</th>
                <th>Порожні</th>
                <th>В заправці</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {cartridges.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.modelName}</td>
                  <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{item.barcode || <span style={{ opacity: 0.5 }}>авто</span>}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.printerCompatibility || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countNew', item.countNew - 1)} className="badge" style={{ cursor: 'pointer', border: 'none' }}>-</button>}
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>{item.countNew}</span>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countNew', item.countNew + 1)} className="badge active" style={{ cursor: 'pointer', border: 'none' }}>+</button>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countEmpty', item.countEmpty - 1)} className="badge" style={{ cursor: 'pointer', border: 'none' }}>-</button>}
                      <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{item.countEmpty}</span>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countEmpty', item.countEmpty + 1)} className="badge broken" style={{ cursor: 'pointer', border: 'none' }}>+</button>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countRefilling', item.countRefilling - 1)} className="badge" style={{ cursor: 'pointer', border: 'none' }}>-</button>}
                      <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{item.countRefilling}</span>
                      {canEdit && <button onClick={() => handleUpdateCount(item.id, 'countRefilling', item.countRefilling + 1)} className="badge" style={{ cursor: 'pointer', border: 'none', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>+</button>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setBarcodeItem(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        title="Показати штрих-код"
                      >
                        🔖 Штрих-код
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          Видалити
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {cartridges.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Немає картриджів
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Modal */}
      {barcodeItem && (
        <div className="modal-overlay" onClick={() => setBarcodeItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>🔖 Штрих-код</h2>
              <button className="modal-close" onClick={() => setBarcodeItem(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {barcodeItem.modelName}
            </p>
            <div style={{
              background: 'rgba(248, 250, 252, 0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <svg ref={svgRef} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handlePrint} className="btn">
                🖨️ Друкувати
              </button>
              <button onClick={() => setBarcodeItem(null)} className="btn btn-secondary">
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
