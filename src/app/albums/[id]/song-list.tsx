"use client";

import { Play } from "lucide-react";
import { type Song } from "@prisma/client";

import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";

interface SongListProps {
  songs: Song[];
  artistName: string;
}

export function SongList({ songs, artistName }: SongListProps) {
  const { playSong } = usePlayerStore();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlay = (song: Song) => {
    // Enrich the song with artist info for the player
    const songWithDetails = {
      ...song,
      artist: {
        name: artistName,
        id: song.artistId,
        imageUrl: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      album: null,
    };
    playSong(
      songWithDetails,
      songs.map((s) => ({
        ...s,
        artist: {
          name: artistName,
          id: s.artistId,
          imageUrl: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        album: null,
      })),
    );
  };

  return (
    <div className="rounded-md border">
      <div className="bg-secondary/50 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b px-4 py-3 font-medium">
        <span className="text-muted-foreground">#</span>
        <span>Title</span>
        <span className="text-muted-foreground">Duration</span>
        <span></span> {/* Empty header for play button */}
      </div>
      <div className="divide-y">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="hover:bg-secondary/40 group grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3"
          >
            <span className="text-muted-foreground w-6 text-center">
              {index + 1}
            </span>
            <div className="flex flex-col">
              <span className="font-medium">{song.title}</span>
              <span className="text-muted-foreground text-sm">
                {artistName}
              </span>
            </div>
            <span className="text-muted-foreground text-sm">
              {formatDuration(song.duration)}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="invisible h-8 w-8 group-hover:visible"
              onClick={() => handlePlay(song)}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
