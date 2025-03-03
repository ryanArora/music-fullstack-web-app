"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function SongDropdown({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* TODO */}
        <DropdownMenuItem>Add to Liked Songs</DropdownMenuItem>
        <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
