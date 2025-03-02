"use client";

import { Pause, Play } from "lucide-react";
import { type Song } from "@prisma/client";

import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { cn } from "~/lib/utils";

interface SongListProps {
  songs: Song[];
  artistName: string;
}

export function SongList({ songs, artistName }: SongListProps) {
  const { playSong, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlay = (song: Song) => {
    // If this song is current playing, toggle playback
    if (currentSong?.id === song.id) {
      void togglePlayPause();
      return;
    }

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
      <div className="bg-secondary/50 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b px-4 py-3 font-medium">
        <span className="text-muted-foreground">#</span>
        <span>Title</span>
        <span className="text-muted-foreground">Duration</span>
      </div>
      <div className="divide-y">
        {songs.map((song, index) => {
          const isCurrentSong = currentSong?.id === song.id;
          const isCurrentlyPlaying = isCurrentSong && isPlaying;

          return (
            <div
              key={song.id}
              className={cn(
                "group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3",
                isCurrentSong ? "bg-secondary/60" : "hover:bg-secondary/40",
              )}
            >
              <div className="w-6 text-center">
                <span
                  className={cn(
                    "text-muted-foreground",
                    isCurrentSong ? "hidden" : "group-hover:hidden",
                    isCurrentSong && "text-primary font-medium",
                  )}
                >
                  {index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    isCurrentSong
                      ? "inline-flex"
                      : "hidden group-hover:inline-flex",
                  )}
                  onClick={() => handlePlay(song)}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn("font-medium", isCurrentSong && "text-primary")}
                >
                  {song.title}
                </span>
                <span className="text-muted-foreground text-sm">
                  {artistName}
                </span>
              </div>
              <span
                className={cn(
                  "text-muted-foreground text-sm",
                  isCurrentSong && "text-primary",
                )}
              >
                {formatDuration(song.duration)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
