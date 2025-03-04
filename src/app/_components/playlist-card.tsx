"use client";

import { cn } from "~/lib/utils";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { type RouterOutputs } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { PlaylistImage } from "./ui/playlist-image";
import { Skeleton } from "./ui/skeleton";

type PlaylistCardProps = {
  className?: string;
} & (
  | {
      loading: true;
      error: false;
      playlist: undefined;
    }
  | {
      loading: false;
      error: false;
      playlist: NonNullable<RouterOutputs["playlist"]["getById"]>;
    }
  | {
      loading: false;
      error: true;
      playlist: undefined;
    }
);

export function PlaylistCard({
  loading,
  error,
  playlist,
  className,
}: PlaylistCardProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  if (error) return null;

  if (loading) {
    return (
      <div className={cn("block space-y-3", className)}>
        <Skeleton className="aspect-square w-full rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const isCurrentPlaylist = playlist.songs.some(
    (playlistSong) => playlistSong.song.id === currentSong?.id,
  );

  const handlePlayPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentPlaylist) {
      void togglePlayPause();
      return;
    }

    playPlaylist(playlist);
  };

  return (
    <div className={cn("block space-y-3", className)}>
      {/* Image and play controls */}
      <div
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        onClick={handlePlayPlaylist}
      >
        <PlaylistImage playlist={playlist} />
        <div
          className={cn(
            "absolute inset-0 items-center justify-center bg-black/40 transition-all",
            isCurrentPlaylist && isPlaying ? "flex" : "hidden group-hover:flex",
          )}
        >
          <Button
            size="icon"
            variant="none"
            className="h-12 w-12 text-white"
            onClick={handlePlayPlaylist}
          >
            {isCurrentPlaylist && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Playlist title info */}
      <div className="space-y-1">
        <Link
          href={`/playlists/${playlist.id}`}
          className={cn(
            "block truncate font-medium leading-tight hover:underline",
            isCurrentPlaylist && "text-primary",
          )}
        >
          {playlist.title}
        </Link>
        <p className="text-sm text-muted-foreground">Playlist</p>
      </div>
    </div>
  );
}
