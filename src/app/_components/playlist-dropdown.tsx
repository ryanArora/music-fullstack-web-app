"use client";

import { MoreVertical, Trash2, Share2, Edit, Globe, Lock } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { RouterOutputs, api } from "~/trpc/react";
import { useToast } from "~/app/_components/ui/use-toast";

export function PlaylistDropdown({
  className,
  playlist,
}: {
  className?: string;
  playlist: RouterOutputs["playlist"]["getUserPlaylists"][number];
}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Delete playlist mutation
  const deletePlaylistMutation = api.playlist.deletePlaylist.useMutation({
    onSuccess: () => {
      void utils.playlist.getUserPlaylists.invalidate();
      toast({
        title: "Playlist deleted!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle playlist visibility mutation
  const toggleVisibilityMutation = api.playlist.updatePlaylist.useMutation({
    onSuccess: () => {
      void utils.playlist.getUserPlaylists.invalidate();
      toast({
        title: `Playlist is now ${playlist.isPublic ? "private" : "public"}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" size="icon" className={className}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibilityMutation.mutate({
              id: playlist.id,
              isPublic: !playlist.isPublic,
            });
          }}
        >
          {playlist.isPublic ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              <span>Make private</span>
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              <span>Make public</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(
              `${window.location.origin}/playlists/${playlist.id}`,
            );
            toast({
              title: "Copied playlist link to clipboard!",
            });
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        {!playlist.isLiked && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deletePlaylistMutation.mutate({
                id: playlist.id,
              });
            }}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
