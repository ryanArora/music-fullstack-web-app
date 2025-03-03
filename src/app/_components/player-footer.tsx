"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  ListMusic,
} from "lucide-react";

import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import { Slider } from "~/app/_components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import { cn } from "~/lib/utils";
import { QueueDialog } from "~/app/_components/queue-dialog";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { SongDropdown } from "./song-dropdown";

export function PlayerFooter() {
  const {
    currentSong,
    isPlaying,
    volume,
    muted,
    progress,
    duration,
    repeatMode,
    shuffleEnabled,
    togglePlayPause,
    setVolume,
    toggleMute,
    setProgress,
    nextSong,
    previousSong,
    toggleRepeatMode,
    toggleShuffle,
    initAudio,
  } = usePlayerStore();

  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);

  const utils = api.useUtils();

  // Fetch liked status when the song changes
  const { data: likedStatus, isLoading: isLikedLoading } =
    api.playlist.isLikedSong.useQuery(
      { songId: currentSong?.id ?? "" },
      {
        enabled: !!currentSong && !!session,
      },
    );

  // Toggle like mutation
  const { mutate: toggleLike, isPending: isLiking } =
    api.playlist.toggleLikedSong.useMutation({
      onSuccess: () => {
        void utils.playlist.isLikedSong.invalidate({
          songId: currentSong?.id ?? "",
        });
        void utils.playlist.getUserPlaylists.invalidate();
      },
    });

  const handleLikeToggle = () => {
    if (!session || !currentSong) return;
    toggleLike({ songId: currentSong.id });
  };

  // Only show the player footer on the client side and initialize audio
  useEffect(() => {
    setIsMounted(true);
    initAudio();
  }, [initAudio]);

  // Track loading state based on duration
  useEffect(() => {
    if (duration === 0 && currentSong) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [duration, currentSong]);

  if (!isMounted) return null;

  // Don't show the player footer if there's no song
  if (!currentSong) return null;

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get volume icon based on current volume and muted state
  const getVolumeIcon = () => {
    if (muted || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md">
        <div className="container flex h-20 items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={handleLikeToggle}
                  disabled={!session || isLiking || isLikedLoading}
                >
                  <Heart
                    className={cn("h-5 w-5", {
                      "fill-primary text-primary": likedStatus?.liked,
                      "animate-pulse": isLiking,
                    })}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!session
                  ? "Sign in to like songs"
                  : likedStatus?.liked
                    ? "Remove from Liked Songs"
                    : "Add to Liked Songs"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Song info */}
          <div className="flex w-1/4 items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src={currentSong.imageUrl}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              {currentSong.albumId ? (
                <Link
                  href={`/albums/${currentSong.albumId}`}
                  className="line-clamp-1 font-medium hover:underline"
                >
                  {currentSong.title}
                </Link>
              ) : (
                <span className="line-clamp-1 font-medium">
                  {currentSong.title}
                </span>
              )}
              <Link
                href={`/artists/${currentSong.artist.id}`}
                className="line-clamp-1 text-sm text-muted-foreground hover:underline"
              >
                {currentSong.artist.name}
              </Link>
            </div>
            <div className="flex items-center">
              <SongDropdown />
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex w-2/4 flex-col items-center justify-center">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleShuffle}
                      className={cn({
                        "text-muted-foreground": !shuffleEnabled,
                        "bg-primary/10 text-primary": shuffleEnabled,
                      })}
                    >
                      <Shuffle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {shuffleEnabled ? "Shuffle: On" : "Shuffle: Off"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={previousSong}>
                      <SkipBack className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-primary/10"
                onClick={() => void togglePlayPause()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={nextSong}>
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRepeatMode}
                      className={cn({
                        "text-muted-foreground": repeatMode === "off",
                        "text-primary": repeatMode !== "off",
                        "bg-primary/10":
                          repeatMode === "all" || repeatMode === "one",
                      })}
                    >
                      {repeatMode === "one" ? (
                        <Repeat1 className="h-5 w-5" />
                      ) : (
                        <Repeat className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {repeatMode === "off"
                      ? "Repeat: Off"
                      : repeatMode === "all"
                        ? "Repeat: All"
                        : "Repeat: One"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mt-1 flex w-full max-w-md items-center gap-2">
              <span className="w-10 text-right text-xs text-muted-foreground">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                min={0}
                max={duration || 100}
                step={0.1}
                disabled={isLoading || duration === 0}
                onValueChange={(value) => {
                  if (value[0] !== undefined) {
                    setProgress(value[0]);
                  }
                }}
                className={cn("flex-1", {
                  "opacity-50": isLoading || duration === 0,
                })}
                aria-label="Seek time"
              />
              <span className="w-10 text-xs text-muted-foreground">
                {formatTime(duration || 0)}
              </span>
            </div>
          </div>

          {/* Additional controls */}
          <div className="flex w-1/4 items-center justify-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQueueDialogOpen(true)}
                  >
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Queue</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={cn({
                        "text-primary": muted,
                      })}
                    >
                      {getVolumeIcon()}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{muted ? "Unmute" : "Mute"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Slider
                value={[muted ? 0 : volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => {
                  if (values[0] !== undefined) {
                    setVolume(values[0] / 100);
                  }
                }}
                className={cn("w-24", {
                  "opacity-50": muted,
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Dialog */}
      <QueueDialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen} />
    </>
  );
}
