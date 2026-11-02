"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/settings", label: "Configurações" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Administração"
      className="flex flex-wrap gap-2 md:flex-col"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4",
            pathname === href && "bg-muted font-medium",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
