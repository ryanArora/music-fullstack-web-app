"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { type Album, type Artist } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { api } from "~/trpc/react";
import { SongWithDetails } from "~/lib/store/usePlayerStore";

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
  const [isCurrentAlbum, setIsCurrentAlbum] = useState(false);

  // Use TRPC's useQuery to prefetch the album data
  const { data: albumData } = api.album.getAlbumWithSongs.useQuery({
    id: album.id,
  });

  // Check if this album is currently playing using data attributes
  useEffect(() => {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      const contextId = audioElement.getAttribute("data-context-id");
      const contextType = audioElement.getAttribute("data-context-type");
      setIsCurrentAlbum(contextType === "album" && contextId === album.id);
    }
  }, [currentSong, album.id]);

  // Function to fetch album with songs and play it
  const handlePlayAlbum = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent any default behavior
      e.stopPropagation(); // Stop event propagation
    }

    // If this album is currently playing, just toggle play/pause
    if (isCurrentAlbum) {
      void togglePlayPause();
      return;
    }

    // If we have the album data, play it
    if (albumData) {
      // Set custom data attributes on the audio element to track context
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.setAttribute("data-context-id", album.id);
        audioElement.setAttribute("data-context-type", "album");
      }

      // Convert API response to the format required by playAlbum
      const albumWithSongs: Album & { songs: SongWithDetails[] } = {
        ...albumData,
        songs: albumData.songs.map((song) => ({
          ...song,
          // Ensure each song has the album property set
          album: {
            id: albumData.id,
            title: albumData.title,
            imageUrl: albumData.imageUrl,
            artistId: albumData.artistId,
            releaseDate: albumData.releaseDate,
            type: albumData.type,
            createdAt: albumData.createdAt,
            updatedAt: albumData.updatedAt,
          },
        })),
      };

      playAlbum(albumWithSongs);
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
            isCurrentAlbum && isPlaying ? "flex" : "hidden group-hover:flex",
          )}
        >
          <Button
            size="icon"
            variant="none"
            className="z-10 h-12 w-12 text-white"
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
            "block font-medium leading-tight hover:underline",
            isCurrentAlbum && "text-primary",
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
