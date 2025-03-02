"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
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
  const { playAlbum } = usePlayerStore();

  // Function to fetch album with songs and play it
  const handlePlayAlbum = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the play button

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
    <Link
      href={`/albums/${album.id}`}
      className={cn(
        "group block space-y-3 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-md">
        <Image
          src={album.imageUrl}
          alt={album.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-black/40 transition-all group-hover:flex">
          <Button
            size="icon"
            className="z-10 h-12 w-12"
            onClick={handlePlayAlbum}
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium leading-tight">{album.title}</h3>
        <p className="text-muted-foreground text-sm">{album.artist.name}</p>
      </div>
    </Link>
  );
}
