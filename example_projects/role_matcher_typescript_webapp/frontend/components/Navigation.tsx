'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/employees', label: 'Employees' },
    { href: '/assignments', label: 'Assignments' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/audit', label: 'Audit Logs' },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
          AI Task Prioritizer
        </h1>
        <div style={{ display: 'flex', gap: '24px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              style={{
                color: pathname === item.href ? '#3b82f6' : '#6b7280',
                textDecoration: 'none',
                fontWeight: pathname === item.href ? '600' : '500',
                fontSize: '14px',
                padding: '4px 0',
                borderBottom: pathname === item.href ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
