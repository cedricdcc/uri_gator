import React from 'react';

export default function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(8, 12, 22, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand */}
        <a href="#" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#080c16',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
          }}>
            ⚡
          </div>
          <span style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-sans)',
          }}>
            wrx
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            v0.1.0
          </span>
        </a>

        {/* Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#foundations" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Foundations
          </a>
          <a href="#guides" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            CLI & Script
          </a>
          <a href="#playground" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Playground
          </a>
        </nav>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://github.com/cedricdcc/wrx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
