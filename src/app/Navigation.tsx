'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const links = [
    { href: '/', label: 'Дашборд', icon: '📊' },
    { href: '/assets', label: 'Обладнання (ОЗ)', icon: '💻' },
    { href: '/transactions', label: 'Транзакції', icon: '📝' },
    { href: '/cartridges', label: 'Картриджі', icon: '🖨️' },
    { href: '/employees', label: 'Співробітники', icon: '👥' },
    { href: '/departments', label: 'Відділи', icon: '🏢' },
    { href: '/categories', label: 'Категорії', icon: '🏷️' },
    ...(role === 'admin' ? [{ href: '/users', label: 'Користувачі', icon: '🔐' }] : []),
  ]

  const roleBadgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: role === 'admin' ? 'rgba(139, 92, 246, 0.2)' :
                role === 'editor' ? 'rgba(59, 130, 246, 0.2)' :
                'rgba(148, 163, 184, 0.2)',
    color: role === 'admin' ? '#a78bfa' :
           role === 'editor' ? '#60a5fa' :
           'var(--text-secondary)',
    border: `1px solid ${role === 'admin' ? 'rgba(139, 92, 246, 0.3)' :
                          role === 'editor' ? 'rgba(59, 130, 246, 0.3)' :
                          'rgba(148, 163, 184, 0.2)'}`,
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <span role="img" aria-label="boxes">📦</span> IT Sklad
      </div>
      <nav className="nav-links">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-item ${pathname === link.href ? 'active' : ''}`}
          >
            <span role="img" aria-label={link.label} style={{ width: 24, textAlign: 'center' }}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {session && (
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👤 {session.user?.name}
              </span>
              <span style={roleBadgeStyle}>{role}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
            >
              Вийти
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
