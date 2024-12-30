"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={`
        inline-flex items-center
        text-[var(--text-subdued)]
        font-[var(--font-weight-medium)]
        text-[var(--label-m-size)]
        leading-[var(--label-m-line)]
        tracking-[var(--label-m-spacing)]
        px-[var(--spacing-m)]
        py-[var(--spacing-xs)]
        mr-[var(--spacing-s)]
        rounded-[var(--radius-s)]
        transition-all duration-200
        hover:text-[var(--text-default)]
        hover:bg-[var(--neutral-n100)]
        ${isActive ? `
          text-[var(--text-active)] 
          bg-[var(--neutral-n100)]
          font-[var(--font-weight-bold)]
          hover:text-[var(--text-active)]
        ` : ''}
      `}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: "Audius Chat" },
    { href: "/retrieval_agents", label: "Developer Docs" },
    { href: "/agents", label: "Web Search" },
  ];

  return (
    <nav className={`
      mb-[var(--spacing-l)] 
      p-[var(--spacing-s)]
      bg-[var(--background-surface1)]
      rounded-[var(--radius-m)]
      shadow-[var(--shadow-near)]
    `}>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  );
}