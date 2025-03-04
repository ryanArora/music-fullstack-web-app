"use client";

import {
  MoreVertical,
  ListEnd,
  ListPlus,
  Save,
  User,
  Disc,
  Share2,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "./ui/dropdown-menu";
import { RouterOutputs, api } from "~/trpc/react";
import Link from "next/link";
import { useToast } from "~/app/_components/ui/use-toast";
import { usePlayerStore } from "~/lib/store/usePlayerStore";
import { useSessionContext } from "./session-provider";

export function SongDropdown({
  className,
  song,
  playlistId,
}: {
  className?: string;
  song: RouterOutputs["song"]["getById"];
  playlistId?: string;
}) {
  const { toast } = useToast();
  const { addToQueue, playNext } = usePlayerStore();
  const session = useSessionContext();

  // Get user's playlists
  const { data: userPlaylists, isLoading: isLoadingPlaylists } =
    api.playlist.getUserPlaylists.useQuery(undefined, {
      enabled: !!session,
    });

  // Add song to playlist mutation
  const addToPlaylistMutation = api.playlist.addSongToPlaylist.useMutation({
    onSuccess: () => {
      toast({
        title: "Added to playlist!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding to playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove song from playlist mutation
  const removeSongFromPlaylistMutation =
    api.playlist.removeSongFromPlaylist.useMutation({
      onSuccess: () => {
        toast({
          title: "Removed from playlist!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error removing from playlist",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  // Handler to add song to a playlist
  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylistMutation.mutate({
      playlistId,
      songId: song.id,
    });
  };

  // Handler to remove song from the current playlist
  const handleRemoveFromPlaylist = () => {
    if (!playlistId) return;

    removeSongFromPlaylistMutation.mutate({
      playlistId,
      songId: song.id,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            playNext(song);
            toast({
              title: "Playing next!",
            });
          }}
        >
          <ListEnd className="mr-2 h-4 w-4" />
          <span>Play next</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            addToQueue(song);
            toast({
              title: "Added to queue!",
            });
          }}
        >
          <ListPlus className="mr-2 h-4 w-4" />
          <span>Add to queue</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Save className="mr-2 h-4 w-4" />
            <span>Save to playlist</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {isLoadingPlaylists ? (
                <DropdownMenuItem disabled>
                  Loading playlists...
                </DropdownMenuItem>
              ) : !userPlaylists || userPlaylists.length === 0 ? (
                <DropdownMenuItem disabled>No playlists found</DropdownMenuItem>
              ) : (
                userPlaylists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.title}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {playlistId && (
          <DropdownMenuItem onClick={handleRemoveFromPlaylist}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Remove from playlist</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href={`/artists/${song.artist.id}`}>
            <User className="mr-2 h-4 w-4" />
            <span>Go to artist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/albums/${song.albumId}`}>
            <Disc className="mr-2 h-4 w-4" />
            <span>Go to album</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/albums/${song.albumId}`,
            );

            toast({
              title: "Copied album link to clipboard!",
            });
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
