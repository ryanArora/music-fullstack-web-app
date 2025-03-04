"use client";

import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import { type RouterOutputs } from "~/trpc/react";

interface PlaylistPlayButtonProps {
  playlist: NonNullable<RouterOutputs["playlist"]["getById"]>;
}

export function PlaylistPlayButton({ playlist }: PlaylistPlayButtonProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();

  const isCurrentPlaylist = playlist.songs.some(
    (playlistSong) => playlistSong.song.id === currentSong?.id,
  );

  const handlePlay = () => {
    if (isCurrentPlaylist) {
      void togglePlayPause();
      return;
    }

    playPlaylist(playlist);
  };

  return (
    <Button size="lg" className="gap-2" onClick={handlePlay}>
      {isCurrentPlaylist && isPlaying ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Play className="h-5 w-5" />
      )}
      {isCurrentPlaylist && isPlaying ? "Pause" : "Play"}
    </Button>
  );
}
