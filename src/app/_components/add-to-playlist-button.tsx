"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useToast } from "~/app/_components/ui/use-toast";
import { ScrollArea } from "~/app/_components/ui/scroll-area";

interface AddToPlaylistButtonProps {
  songId: string;
}

export function AddToPlaylistButton({ songId }: AddToPlaylistButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: playlists, isLoading } = api.playlist.getUserPlaylists.useQuery(
    undefined,
    {
      enabled: !!session,
    },
  );

  const { mutate, isPending } = api.playlist.addSongToPlaylist.useMutation({
    onSuccess: (data) => {
      void utils.playlist.getById.invalidate({ id: data.playlistId });
      toast({
        title: "Song added to playlist",
        description: `Added to playlist successfully`,
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add song to playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToPlaylist = (playlistId: string) => {
    mutate({
      playlistId,
      songId,
    });
  };

  if (!session) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add to playlist</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist to add this song to
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-2 py-2">
            {isLoading ? (
              <p className="text-muted-foreground text-center text-sm">
                Loading playlists...
              </p>
            ) : playlists?.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm">
                You don&apos;t have any playlists yet
              </p>
            ) : (
              playlists?.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={isPending}
                >
                  {playlist.title}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
