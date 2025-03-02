"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { type Playlist } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { api } from "~/trpc/react";
import { SongWithDetails } from "~/lib/store/usePlayerStore";

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const { playPlaylist, currentSong, isPlaying, togglePlayPause } =
    usePlayerStore();
  const [isCurrentPlaylist, setIsCurrentPlaylist] = useState(false);

  // Use TRPC's useQuery to prefetch the playlist data
  const { data: playlistData } = api.playlist.getPlaylistWithSongs.useQuery(
    { id: playlist.id },
    {
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
    },
  );

  // Check if a song from this playlist is currently playing by reading a custom data attribute
  // that we set on the audio element when playing a playlist
  useEffect(() => {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      const contextId = audioElement.getAttribute("data-context-id");
      const contextType = audioElement.getAttribute("data-context-type");
      setIsCurrentPlaylist(
        contextType === "playlist" && contextId === playlist.id,
      );
    }
  }, [currentSong, playlist.id]);

  // Function to fetch playlist with songs and play it
  const handlePlayPlaylist = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

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
        audioElement.setAttribute("data-context-id", playlist.id);
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
    <div className={cn("block space-y-3", className)}>
      {/* Image and play controls */}
      <div
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        onClick={handlePlayPlaylist}
      >
        <Image
          src={playlist.imageUrl ?? "/images/playlist-default.jpg"}
          alt={playlist.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className={cn(
            "absolute inset-0 items-center justify-center bg-black/40 transition-all",
            isCurrentPlaylist && isPlaying ? "flex" : "hidden group-hover:flex",
          )}
        >
          <Button
            size="icon"
            variant="none"
            className="z-10 h-12 w-12 text-white"
            onClick={handlePlayPlaylist}
          >
            {isCurrentPlaylist && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Playlist title info */}
      <div className="space-y-1">
        <Link
          href={`/playlists/${playlist.id}`}
          className={cn(
            "block font-medium leading-tight hover:underline",
            isCurrentPlaylist && "text-primary",
          )}
        >
          {playlist.title}
        </Link>
        <p className="text-muted-foreground text-sm">Playlist</p>
      </div>
    </div>
  );
}
