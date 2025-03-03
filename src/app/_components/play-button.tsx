"use client";

import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import { type RouterOutputs } from "~/trpc/react";

interface PlayButtonProps {
  album: RouterOutputs["album"]["getById"];
}

export function PlayButton({ album }: PlayButtonProps) {
  const { playAlbum, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  // Check if this album is currently playing
  const isThisAlbumPlaying = currentSong?.albumId === album.id;

  const handlePlay = () => {
    // If this album is currently playing, just toggle play/pause
    if (isThisAlbumPlaying) {
      void togglePlayPause();
      return;
    }

    playAlbum(album);
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
