import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Music } from "lucide-react";

import { api } from "~/trpc/server";
import { PlayButton } from "~/app/_components/play-button";
import { SongList } from "~/app/_components/song-list";

type AlbumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const album = await api.album.getById({ id: (await params).id });

  if (!album) {
    return {
      title: "Album Not Found",
    };
  }

  return {
    title: `${album.title} - ${album.artist.name}`,
    description: `Listen to ${album.title} by ${album.artist.name}`,
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const album = await api.album.getById({ id: (await params).id });

  if (!album) {
    notFound();
  }

  // Format the release date
  const releaseDate = new Date(album.releaseDate).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" },
  );

  // Calculate total duration of all songs
  const totalSeconds = album.songs.reduce(
    (total, song) => total + song.duration,
    0,
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = hours ? `${hours} hr ${minutes} min` : `${minutes} min`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="relative aspect-square h-64 w-64 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={album.imageUrl}
            alt={album.title}
            className="object-cover"
            priority
            width={300}
            height={300}
          />
        </div>

        <div className="flex flex-col justify-end">
          <h1 className="mb-2 text-3xl font-bold">{album.title}</h1>
          <Link
            href={`/artists/${album.artist.id}`}
            className="mb-4 text-xl text-primary hover:underline"
          >
            {album.artist.name}
          </Link>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{releaseDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>{album.songs.length} songs</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalDuration}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PlayButton album={album} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-2xl font-bold">Songs</h2>
        {album.songs.length === 0 ? (
          <p className="text-muted-foreground">No songs in this album yet.</p>
        ) : (
          <SongList
            songs={album.songs.map((song) => ({
              ...song,
              artist: album.artist,
              album: {
                id: album.id,
                artistId: album.artistId,
                title: album.title,
                imageUrl: album.imageUrl,
                releaseDate: album.releaseDate,
                createdAt: album.createdAt,
                updatedAt: album.updatedAt,
                type: album.type,
              },
            }))}
            isLoading={false}
          />
        )}
      </div>

      <div>
        <Link
          href="/albums"
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
          Back to Albums
        </Link>
      </div>
    </div>
  );
}
