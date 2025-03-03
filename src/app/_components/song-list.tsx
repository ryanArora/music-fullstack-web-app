"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";

import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { cn } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/react";
import { SongDropdown } from "./song-dropdown";

interface SongListProps {
  songs: RouterOutputs["song"]["getById"][];
}

export function SongList({ songs }: SongListProps) {
  const { playSong, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlay = (song: RouterOutputs["song"]["getById"]) => {
    // If this song is current playing, toggle playback
    if (currentSong?.id === song.id) {
      void togglePlayPause();
      return;
    }

    // Enrich the song with artist info for the player
    const songWithDetails = {
      ...song,
      artist: {
        name: song.artist.name,
        id: song.artist.id,
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
          name: s.artist.name,
          id: s.artist.id,
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
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-secondary/50 px-4 py-3 font-medium">
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
                    isCurrentSong && "font-medium text-primary",
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
                {song.albumId ? (
                  <Link
                    href={`/albums/${song.albumId}`}
                    className={cn(
                      "font-medium hover:text-primary hover:underline",
                      isCurrentSong && "text-primary",
                    )}
                  >
                    {song.title}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-medium",
                      isCurrentSong && "text-primary",
                    )}
                  >
                    {song.title}
                  </span>
                )}
                <Link
                  href={`/artists/${song.artist.id}`}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  {song.artist.name}
                </Link>
              </div>
              <div className="relative flex items-center justify-end">
                <span
                  className={cn(
                    "absolute right-0 text-sm text-muted-foreground group-hover:invisible",
                    isCurrentSong && "text-primary",
                  )}
                >
                  {formatDuration(song.duration)}
                </span>
                <SongDropdown className="invisible absolute right-0 text-muted-foreground group-hover:visible" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
