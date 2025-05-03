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
import { signIn, signOut } from "next-auth/react";
import { useSessionContext } from "./session-provider";
import { env } from "~/env";

export function UserDropdown() {
  const session = useSessionContext();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!session) {
    if (env.NEXT_PUBLIC_IS_STAGING) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-md px-4 py-2"
            >
              <User className="h-4 w-4" />
              <span>Log in</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuItem
              onClick={() => {
                void signIn("credentials");
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="font-bold underline">
                Log in as a Tester (One Click)
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void signIn("discord");
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Log in with Discord</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-md px-4 py-2"
        onClick={() => {
          void signIn("discord");
        }}
      >
        <User className="h-4 w-4" />
        <span>Log in with Discord</span>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image ?? "/images/avatar-default.webp"}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback className="animate-pulse"></AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
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
            onClick={() => {
              void signOut();
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
