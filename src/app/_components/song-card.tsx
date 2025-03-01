import Image from "next/image";
import { Play } from "lucide-react";
import { type Song } from "@prisma/client";
import { type Artist } from "@prisma/client";
import { type Album } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";

interface SongWithRelations extends Song {
  artist: Artist;
  album: Album | null;
}

interface SongCardProps {
  song: SongWithRelations;
  className?: string;
}

export function SongCard({ song, className }: SongCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "hover:bg-secondary/50 group relative flex items-center gap-4 rounded-md p-2 transition-colors",
        className,
      )}
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={song.imageUrl}
          alt={song.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{song.title}</span>
        <span className="text-muted-foreground text-sm">
          {song.artist.name}
        </span>
      </div>
      <div className="text-muted-foreground ml-auto text-sm">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}
