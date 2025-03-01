"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Disc, Music, Radio, UserRound, ListMusic } from "lucide-react";

import { cn } from "~/lib/utils";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
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
    name: "Songs",
    href: "/songs",
    icon: Music,
  },
  {
    name: "Playlists",
    href: "/playlists",
    icon: ListMusic,
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
            "hover:bg-secondary flex items-center gap-4 rounded-md px-3 py-2 text-sm transition-colors",
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
