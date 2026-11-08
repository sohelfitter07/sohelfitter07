'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
        <path
          d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/appointments',
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M15.5 5.4a3.1 3.1 0 0 1 0 5.2M17 14.6c2 .5 3.2 2 3.5 4.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // The login screen is the only page without the admin shell.
  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="border-b border-slate-800/80 bg-slate-950/95 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-6">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-black text-slate-950 shadow-lg shadow-amber-500/20"
        >
          CFR
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-slate-100">
            Canadian Fitness Repair
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Admin console
          </p>
        </div>
      </div>

      <nav
        aria-label="Admin sections"
        className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'group inline-flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                active
                  ? 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
              ].join(' ')}
            >
              <span
                className={
                  active
                    ? 'text-amber-400'
                    : 'text-slate-500 transition group-hover:text-slate-300'
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-slate-800/80 px-6 py-5 md:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Phase 2
        </p>
        <p className="mt-1 text-xs text-slate-500">Read-only scheduler preview</p>
        <a
          href="https://canadianfitnessrepair.com"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-amber-300"
        >
          View public site
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
            <path
              d="M8 16 16 8M9 8h7v7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </aside>
  );
}
