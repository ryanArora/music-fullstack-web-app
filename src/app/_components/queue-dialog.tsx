"use client";

import { useMemo } from "react";
import { Music, X } from "lucide-react";
import Image from "next/image";

import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { Button } from "~/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { ScrollArea } from "~/app/_components/ui/scroll-area";

interface QueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueueDialog({ open, onOpenChange }: QueueDialogProps) {
  const { queue, queueIndex, currentSong, jumpToQueueItem, removeFromQueue } =
    usePlayerStore();

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get only upcoming songs
  const upNext = useMemo(() => {
    return queue.slice(queueIndex + 1);
  }, [queue, queueIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl md:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Play Queue</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Current Song */}
          {currentSong && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium">Now Playing</h3>
              <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50">
                <div className="relative h-12 w-12 overflow-hidden rounded-md">
                  <Image
                    src={currentSong.imageUrl}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                    priority
                    width={64}
                    height={64}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 font-medium">
                    {currentSong.title}
                  </div>
                  <div className="line-clamp-1 text-sm text-muted-foreground">
                    {currentSong.artist.name}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(currentSong.duration)}
                </div>
              </div>
            </div>
          )}

          {/* Up Next */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Up Next</h3>
            {upNext.length > 0 ? (
              <ScrollArea className="max-h-96">
                {upNext.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => jumpToQueueItem(queueIndex + index + 1)}
                    >
                      <Music className="h-4 w-4" />
                    </Button>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={song.imageUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                        priority
                        width={64}
                        height={64}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-medium">
                        {song.title}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {song.artist.name}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(song.duration)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeFromQueue(queueIndex + index + 1)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
                <div>
                  <Music className="mx-auto mb-2 h-10 w-10 opacity-50" />
                  <p className="text-sm">No songs in the queue</p>
                  <p className="text-xs">
                    Try adding some songs or albums to your queue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
