"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";

import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { cn, formatDuration } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/react";
import { SongDropdown } from "./song-dropdown";
import { Skeleton } from "./ui/skeleton";

type SongListProps =
  | {
      playlistId: string;
      albumSongs?: never;
      playlistSongs: RouterOutputs["playlist"]["getById"]["songs"];
      isLoading: boolean;
      lengthHint?: number;
    }
  | {
      playlistId?: never;
      albumSongs: RouterOutputs["song"]["getById"][];
      playlistSongs?: never;
      isLoading: boolean;
      lengthHint?: number;
    };

export function SongList({
  playlistId,
  playlistSongs,
  albumSongs,
  isLoading = false,
  lengthHint = 10,
}: SongListProps) {
  const { playSong, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  const songs =
    playlistId !== undefined
      ? playlistSongs.map((playlistSong) => ({
          key: playlistSong.id,
          ...playlistSong.song,
        }))
      : albumSongs.map((albumSong) => ({
          key: albumSong.id,
          ...albumSong,
        }));

  const handlePlay = (song: RouterOutputs["song"]["getById"]) => {
    if (currentSong?.id === song.id) {
      void togglePlayPause();
      return;
    }

    playSong(song);
  };

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-secondary/50 px-4 py-3 font-medium">
        <span className="text-muted-foreground">#</span>
        <span>Title</span>
        <span className="text-muted-foreground">Duration</span>
      </div>
      <div className="divide-y">
        {isLoading
          ? Array.from({ length: lengthHint }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3"
              >
                <div className="w-6 text-center">
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))
          : songs.map((song, index) => {
              if (!song) return null;

              const isCurrentSong = currentSong?.id === song.id;
              const isCurrentlyPlaying = isCurrentSong && isPlaying;

              return (
                <div
                  key={song.key}
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
                    <SongDropdown
                      className="invisible absolute right-0 text-muted-foreground group-hover:visible"
                      song={song}
                      playlistId={playlistId}
                    />
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
