"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { type Album, type Artist } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";

interface AlbumWithArtist extends Album {
  artist: Artist;
}

interface AlbumCardProps {
  album: AlbumWithArtist;
  className?: string;
}

export function AlbumCard({ album, className }: AlbumCardProps) {
  const { playAlbum, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  // Check if this album is currently playing
  const isThisAlbumPlaying = currentSong?.albumId === album.id;

  // Function to fetch album with songs and play it
  const handlePlayAlbum = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent any default behavior
      e.stopPropagation(); // Stop event propagation
    }

    // If this album is currently playing, just toggle play/pause
    if (isThisAlbumPlaying) {
      void togglePlayPause();
      return;
    }

    // Fetch the album with songs from the API
    try {
      const response = await fetch(`/api/albums/${album.id}/play`);
      if (!response.ok) throw new Error("Failed to fetch album");

      const albumWithSongs = await response.json();
      playAlbum(albumWithSongs);
    } catch (error) {
      console.error("Error playing album:", error);
    }
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
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className={cn(
            "absolute inset-0 items-center justify-center bg-black/40 transition-all",
            isThisAlbumPlaying && isPlaying
              ? "flex"
              : "hidden group-hover:flex",
          )}
        >
          <Button
            size="icon"
            variant="none"
            className="z-10 h-12 w-12 text-white"
            onClick={handlePlayAlbum}
          >
            {isThisAlbumPlaying && isPlaying ? (
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
            "block font-medium leading-tight hover:underline",
            isThisAlbumPlaying && "text-primary",
          )}
        >
          {album.title}
        </Link>
        <Link
          href={`/artists/${album.artistId}`}
          className="text-muted-foreground text-sm hover:underline"
        >
          {album.artist.name}
        </Link>
      </div>
    </div>
  );
}
