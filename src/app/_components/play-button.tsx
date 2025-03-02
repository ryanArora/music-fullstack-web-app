"use client";

import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";

interface PlayButtonProps {
  albumId: string;
}

export function PlayButton({ albumId }: PlayButtonProps) {
  const { playAlbum, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  // Check if this album is currently playing
  const isThisAlbumPlaying = currentSong?.albumId === albumId;

  const handlePlay = async () => {
    // If this album is currently playing, just toggle play/pause
    if (isThisAlbumPlaying) {
      void togglePlayPause();
      return;
    }

    try {
      // Fetch the album with songs from the API
      const response = await fetch(`/api/albums/${albumId}/play`);
      if (!response.ok) throw new Error("Failed to fetch album");

      const albumWithSongs = await response.json();
      playAlbum(albumWithSongs);
    } catch (error) {
      console.error("Error playing album:", error);
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
