"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck, LogOut, MessageCircleHeart, Package, Sprout, type LucideIcon } from "lucide-react";
import { CanopyLogo } from "./CanopyLogo";
import { getSupabase } from "@/lib/supabase";

const LINKS: Array<{ href: string; label: string; icon: LucideIcon; exact?: boolean }> = [
  { href: "/dashboard", label: "Virtual Garden", icon: Sprout, exact: true },
  { href: "/dashboard/care-log", label: "Plant Care Log", icon: ClipboardCheck },
  { href: "/dashboard/rootly", label: "Rootly", icon: MessageCircleHeart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    try {
      await getSupabase().auth.signOut();
    } finally {
      router.replace("/?switch=1");
      router.refresh();
    }
  }

  return (
    <aside className="z-20 flex shrink-0 flex-col gap-3 border-b-2 border-inkline bg-forest px-4 py-3 text-[#f6f1e3] md:fixed md:inset-y-0 md:left-0 md:w-64 md:gap-6 md:border-b-0 md:border-r-2 md:px-5 md:py-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" aria-label="Canopy — Virtual Garden">
          <CanopyLogo size={48} wordmark wordmarkClassName="text-[#f6f1e3]" />
        </Link>
        <button
          onClick={logout}
          disabled={leaving}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#f6f1e3]/80 hover:bg-white/10 md:hidden"
        >
          <LogOut size={16} aria-hidden="true" /> Log out
        </button>
      </div>

      <nav aria-label="Dashboard" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "border-inkline bg-[#f6f1e3] text-ink shadow-[3px_3px_0_#529471]"
                  : "border-transparent text-[#f6f1e3]/85 hover:bg-white/10"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden md:block">
        <p className="text-xs uppercase tracking-wide text-[#f6f1e3]/60">Gardener</p>
        <p className="mb-3 truncate font-display text-lg font-semibold">{userName}</p>
        <button
          onClick={logout}
          disabled={leaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#f6f1e3]/40 px-3 py-2 text-sm font-semibold text-[#f6f1e3] hover:bg-white/10 disabled:opacity-60"
        >
          <LogOut size={16} aria-hidden="true" /> Log out
        </button>
      </div>
    </aside>
  );
}
