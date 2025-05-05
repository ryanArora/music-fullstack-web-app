"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { type RouterOutputs } from "~/trpc/react";
import { Skeleton } from "./ui/skeleton";

type AlbumCardProps = {
  className?: string;
} & (
  | {
      loading: true;
      error: false;
      album: undefined;
    }
  | {
      loading: false;
      error: false;
      album: RouterOutputs["album"]["getById"];
    }
  | {
      loading: false;
      error: true;
      album: undefined;
    }
);

export function AlbumCard({
  loading,
  error,
  album,
  className,
}: AlbumCardProps) {
  const { playAlbum, currentSong, isPlaying, togglePlayPause } =
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

  const isCurrentAlbum = currentSong?.albumId === album.id;

  // Function to fetch album with songs and play it
  const handlePlayAlbum = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event propagation

    // If this album is currently playing, just toggle play/pause
    if (isCurrentAlbum) {
      void togglePlayPause();
      return;
    }

    playAlbum(album);
  };

  return (
    <div className={cn("block space-y-3", className)}>
      {/* Image and play controls - NOT wrapped in Link */}
      <div
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        onClick={handlePlayAlbum}
      >
        <Image
          src={album.imageUrl}
          alt={album.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          width={300}
          height={300}
        />
        <div
          className={cn(
            "absolute inset-0 items-center justify-center bg-black/40 transition-all",
            isCurrentAlbum && isPlaying ? "flex" : "hidden group-hover:flex",
          )}
        >
          <Button
            size="icon"
            variant="none"
            className="h-12 w-12 text-white"
            onClick={handlePlayAlbum}
          >
            {isCurrentAlbum && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Album title and artist info - wrapped in Link */}
      <div className="space-y-1">
        <Link
          href={`/albums/${album.id}`}
          className={cn(
            "block truncate font-medium leading-tight hover:underline",
            isCurrentAlbum && "text-primary",
          )}
        >
          {album.title}
        </Link>
        <Link
          href={`/artists/${album.artistId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {album.artist.name}
        </Link>
      </div>
    </div>
  );
}
