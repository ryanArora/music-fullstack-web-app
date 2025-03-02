"use client";

import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import type { Album } from "@prisma/client";
import type { SongWithDetails } from "~/lib/store/usePlayerStore";

interface PlayButtonProps {
  albumId: string;
}

export function PlayButton({ albumId }: PlayButtonProps) {
  const { playAlbum, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  // Use TRPC's useQuery to prefetch the album data
  const { data: albumData } = api.album.getAlbumWithSongs.useQuery({
    id: albumId,
  });

  // Check if this album is currently playing
  const isThisAlbumPlaying = currentSong?.albumId === albumId;

  const handlePlay = () => {
    // If this album is currently playing, just toggle play/pause
    if (isThisAlbumPlaying) {
      void togglePlayPause();
      return;
    }

    // If we have the album data, play it
    if (albumData) {
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
    <Button size="lg" className="gap-2" onClick={handlePlay}>
      {isThisAlbumPlaying && isPlaying ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Play className="h-5 w-5" />
      )}
      {isThisAlbumPlaying && isPlaying ? "Pause" : "Play"}
    </Button>
  );
}
