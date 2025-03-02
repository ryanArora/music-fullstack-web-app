"use client";

import { useState } from "react";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";

interface PlayButtonProps {
  albumId: string;
}

export function PlayButton({ albumId }: PlayButtonProps) {
  const { playAlbum } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      // Fetch the album with songs from the API
      const response = await fetch(`/api/albums/${albumId}/play`);
      if (!response.ok) throw new Error("Failed to fetch album");

      const albumWithSongs = await response.json();
      playAlbum(albumWithSongs);
    } catch (error) {
      console.error("Error playing album:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="gap-2"
      onClick={handlePlay}
      disabled={isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path
          fillRule="evenodd"
          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
          clipRule="evenodd"
        />
      </svg>
      {isLoading ? "Loading..." : "Play"}
    </Button>
  );
}
