"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import type { Playlist } from "@prisma/client";
import type { SongWithDetails } from "~/lib/store/usePlayerStore";

interface PlaylistPlayButtonProps {
  playlistId: string;
}

export function PlaylistPlayButton({ playlistId }: PlaylistPlayButtonProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();
  const [isCurrentPlaylist, setIsCurrentPlaylist] = useState(false);

  // Use TRPC's useQuery to prefetch the playlist data
  const { data: playlistData } = api.playlist.getPlaylistWithSongs.useQuery({
    id: playlistId,
  });

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

  const handlePlay = () => {
    // If this playlist is currently playing, just toggle play/pause
    if (isCurrentPlaylist) {
      void togglePlayPause();
      return;
    }

    // If we have the playlist data, play it
    if (playlistData) {
      // Set custom data attributes on the audio element to track context
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.setAttribute("data-context-id", playlistId);
        audioElement.setAttribute("data-context-type", "playlist");
      }

      // Convert the API response to the format required by playPlaylist
      const playlistWithSongs: Playlist & { songs: SongWithDetails[] } = {
        ...playlistData,
        songs: playlistData.songs,
      };

      playPlaylist(playlistWithSongs);
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
