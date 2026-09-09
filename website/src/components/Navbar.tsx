import React from 'react';
import { GitFork, Sun, Moon } from 'lucide-react';
import { useTheme } from '../services/theme';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
          aria-label="wrx home"
        >
          {/* Minimalist Vector Brandmark */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--text-primary)',
              color: 'var(--bg-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="18" r="2.5" />
              <circle cx="12" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <path d="M8 16.5L10.5 7.5" />
              <path d="M13.5 7.5l2.5 9" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            wrx
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            v0.1.0
          </span>
        </a>

        {/* Navigation links */}
        <nav aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <a
            href="#foundations"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Cascade Protocol
          </a>
          <a
            href="#guides"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            CLI & SDK
          </a>
          <a
            href="#playground"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Playground Studio
          </a>
        </nav>

        {/* Action buttons & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Light / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={15} aria-hidden="true" />
            ) : (
              <Moon size={15} aria-hidden="true" />
            )}
          </button>

          <a
            href="https://github.com/cedricdcc/wrx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            aria-label="GitHub Repository"
          >
            <GitFork size={13} aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
