"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";

interface PlaylistPlayButtonProps {
  playlistId: string;
}

export function PlaylistPlayButton({ playlistId }: PlaylistPlayButtonProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();
  const [isCurrentPlaylist, setIsCurrentPlaylist] = useState(false);

  // Check if this playlist is currently playing using data attributes
  useEffect(() => {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      const contextId = audioElement.getAttribute("data-context-id");
      const contextType = audioElement.getAttribute("data-context-type");
      setIsCurrentPlaylist(
        contextType === "playlist" && contextId === playlistId,
      );
    }
  }, [currentSong, playlistId]);

  const handlePlay = async () => {
    // If this playlist is currently playing, just toggle play/pause
    if (isCurrentPlaylist) {
      void togglePlayPause();
      return;
    }

    try {
      // Fetch the playlist with songs from the API
      const response = await fetch(`/api/playlists/${playlistId}/play`);
      if (!response.ok) throw new Error("Failed to fetch playlist");

      const playlistWithSongs = await response.json();

      // Set custom data attributes on the audio element to track context
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.setAttribute("data-context-id", playlistId);
        audioElement.setAttribute("data-context-type", "playlist");
      }

      playPlaylist(playlistWithSongs);
    } catch (error) {
      console.error("Error playing playlist:", error);
    }
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
