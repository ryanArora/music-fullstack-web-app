"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ListMusic, Plus } from "lucide-react";
import { ScrollArea } from "~/app/_components/ui/scroll-area";
import { Button } from "~/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { Label } from "~/app/_components/ui/label";
import { Input } from "~/app/_components/ui/input";
import { Switch } from "~/app/_components/ui/switch";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export function PlaylistSidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();

  const utils = api.useUtils();

  const { data: playlists, isLoading } = api.playlist.getUserPlaylists.useQuery(
    undefined,
    {
      enabled: !!session,
    },
  );

  const createPlaylist = api.playlist.createPlaylist.useMutation({
    onSuccess: (newPlaylist) => {
      utils.playlist.getUserPlaylists.invalidate();
      setOpen(false);
      setTitle("");
      router.push(`/playlists/${newPlaylist.id}`);
    },
  });

  const handleCreatePlaylist = () => {
    if (!title.trim()) return;
    createPlaylist.mutate({
      title: title.trim(),
      isPublic,
    });
  };

  if (!session) {
    return (
      <div className="py-6">
        <div className="text-muted-foreground px-3 text-center">
          <p className="mb-2 text-sm">Sign in to create playlists</p>
          <ListMusic className="mx-auto h-8 w-8 opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold tracking-tight">Your Library</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Create playlist">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Playlist</DialogTitle>
              <DialogDescription>
                Add a name and privacy setting for your new playlist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Public playlist</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!title.trim() || createPlaylist.isPending}
              >
                {createPlaylist.isPending ? "Creating..." : "Create Playlist"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)] px-1">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex animate-pulse flex-col space-y-2 py-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/50 h-10 w-full rounded-md"
                ></div>
              ))}
            </div>
          ) : (
            playlists?.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                {playlist.isLiked ? (
                  <Heart className="text-primary h-4 w-4" />
                ) : (
                  <ListMusic className="h-4 w-4" />
                )}
                <span className="truncate">{playlist.title}</span>
                {!playlist.isPublic && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    Private
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
