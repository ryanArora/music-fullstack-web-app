"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc, ListMusic, Radio, UserRound, ScanSearch } from "lucide-react";

import { cn } from "~/lib/utils";

const navItems = [
  {
    name: "Explore",
    href: "/explore",
    icon: Radio,
  },
  {
    name: "Albums",
    href: "/albums",
    icon: Disc,
  },
  {
    name: "Artists",
    href: "/artists",
    icon: UserRound,
  },
  {
    name: "Playlists",
    href: "/playlists",
    icon: ListMusic,
  },
  {
    name: "Scrape Artist",
    href: "/scrape",
    icon: ScanSearch,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-4 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary",
            pathname === item.href
              ? "bg-secondary font-medium"
              : "text-muted-foreground",
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}
