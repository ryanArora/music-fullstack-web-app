import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Music } from "lucide-react";

import { SongList } from "~/app/_components/song-list";
import { PlaylistPlayButton } from "~/app/_components/playlist-play-button";
import { api } from "~/trpc/server";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const playlist = await api.playlist.getById({ id: params.id });

  if (!playlist) {
    return {
      title: "Playlist Not Found | Music App",
    };
  }

  return {
    title: `${playlist.title} | Music App`,
    description: `Listen to ${playlist.title} playlist`,
  };
}

export default async function PlaylistPage({ params }: PageProps) {
  const playlist = await api.playlist.getById({ id: params.id });

  if (!playlist) {
    notFound();
  }

  // Extract songs from the playlist
  const songs = playlist.songs.map((playlistSong) => playlistSong.song);

  // Format the creation date
  const creationDate = new Date(playlist.createdAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" },
  );

  // Calculate total duration of all songs
  const totalSeconds = songs.reduce((total, song) => total + song.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = hours ? `${hours} hr ${minutes} min` : `${minutes} min`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="relative aspect-square h-64 w-64 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={playlist.imageUrl ?? "/images/playlist-default.jpg"}
            alt={playlist.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-end">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            PLAYLIST
          </p>
          <h1 className="mb-4 text-3xl font-bold">{playlist.title}</h1>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {creationDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>{songs.length} songs</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalDuration}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PlaylistPlayButton playlist={playlist} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-2xl font-bold">Songs</h2>
        {songs.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">This playlist is empty</h3>
            <p className="text-muted-foreground">
              No songs have been added to this playlist yet.
            </p>
          </div>
        ) : (
          <SongList songs={songs} />
        )}
      </div>

      <div>
        <Link
          href="/playlists"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          Back to Playlists
        </Link>
      </div>
    </div>
  );
}
