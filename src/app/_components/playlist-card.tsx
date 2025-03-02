"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { RouterOutputs } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Pause, Play } from "lucide-react";
import Link from "next/link";

interface PlaylistCardProps {
  playlist: RouterOutputs["playlist"]["getById"];
  className?: string;
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

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

  console.log(isCurrentPlaylist);

  return (
    <div className={cn("block space-y-3", className)}>
      {/* Image and play controls */}
      <div
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        onClick={handlePlayPlaylist}
      >
        <Image
          src={playlist.imageUrl ?? "/images/playlist-default.jpg"}
          alt={playlist.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
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
            "block font-medium leading-tight hover:underline",
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
