"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export function UserDropdown() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!session) {
    return (
      <Button
        onClick={() => void signIn("discord")}
        variant="ghost"
        className="flex items-center gap-2"
      >
        <User className="h-5 w-5" />
        <span>Sign In</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user.image ?? ""}
              alt={session.user.name ?? "User"}
            />
            <AvatarFallback>
              {getInitials(session.user.name ?? "User")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
