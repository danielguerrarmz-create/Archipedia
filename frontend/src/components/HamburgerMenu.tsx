import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Building2, Mail } from 'lucide-react';

/*
 * HamburgerMenu — 3 connector lines icon → X when open.
 * Dropdown: concrete-0 + raised, NO glass circles.
 */

interface HamburgerMenuProps {
  className?: string;
}

function ConnectorIcon({ size = 20 }: { size?: number }) {
  const gap = size * 0.22;
  const w = size * 0.55;
  const stroke = size * 0.07;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      {/* 3 connector lines = brand motif */}
      <line x1="3" y1="6" x2="17" y2="6" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="10" x2="17" y2="10" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="14" x2="17" y2="14" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <line x1="4" y1="4" x2="16" y2="16" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="4" x2="4" y2="16" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HamburgerMenu({ className }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const menuItems = [
    { label: 'Enterprise', icon: Building2, href: '/enterprise' },
    { label: 'Contact', icon: Mail, href: '/contact' },
  ];

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    setLocation(href);
  };

  return (
    <div ref={menuRef} className={className} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: isOpen ? 'var(--concrete-200)' : 'var(--concrete-100)',
          boxShadow: 'var(--emboss)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'background var(--dur-1) var(--ease-press)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--concrete-200)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = isOpen ? 'var(--concrete-200)' : 'var(--concrete-100)';
        }}
      >
        {isOpen ? <XIcon size={18} /> : <ConnectorIcon size={18} />}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 200,
            background: 'var(--concrete-0)',
            boxShadow: 'var(--raised)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: index < menuItems.length - 1 ? '1px solid var(--hairline)' : 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--ink-900)',
                  textAlign: 'left',
                  transition: 'background var(--dur-1) var(--ease-press)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--concrete-100)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <Icon size={16} strokeWidth={1.5} style={{ opacity: 0.7, color: 'var(--ink-700)', flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
