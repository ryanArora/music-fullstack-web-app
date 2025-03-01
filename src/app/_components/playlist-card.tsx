import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { type Playlist } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  return (
    <div className={cn("group space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-md">
        <Image
          src={playlist.imageUrl ?? "/images/playlist-default.jpg"}
          alt={playlist.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-black/40 transition-all group-hover:flex">
          <Button size="icon" className="h-12 w-12">
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium leading-tight">
          <Link href={`/playlists/${playlist.id}`} className="hover:underline">
            {playlist.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm">Playlist</p>
      </div>
    </div>
  );
}
