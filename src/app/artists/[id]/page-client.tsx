"use client";

import { notFound } from "next/navigation";
import { api, type RouterOutputs } from "~/trpc/react";
import { ArtistBanner } from "~/app/_components/artist-banner";
import { AlbumCarousel } from "~/app/_components/album-carousel";
import { SongList } from "~/app/_components/song-list";

interface ArtistDetailPageProps {
  artist: RouterOutputs["artist"]["getById"];
}

export default function ArtistDetailPage({ artist }: ArtistDetailPageProps) {
  if (!artist) {
    notFound();
  }

  // Now start the rest of the requests in parallel
  const { data: popularSongs, isLoading: isLoadingPopularSongs } =
    api.artist.getPopularSongs.useQuery({
      artistId: artist.id,
    });

  const {
    data: albums,
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
  } = api.artist.getAlbumsByType.useQuery({
    artistId: artist.id,
    type: "ALBUM",
  });

  const {
    data: eps,
    isLoading: isLoadingEps,
    isError: isErrorEps,
  } = api.artist.getAlbumsByType.useQuery({
    artistId: artist.id,
    type: "EP",
  });

  const {
    data: singles,
    isLoading: isLoadingSingles,
    isError: isErrorSingles,
  } = api.artist.getAlbumsByType.useQuery({
    artistId: artist.id,
    type: "SINGLE",
  });

  // Generate artist description
  const description = `Artist with ${artist.albums.length} albums and ${artist.songs.length} songs`;

  return (
    <div className="container py-6">
      <ArtistBanner artist={artist} description={description} />

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Popular Songs</h2>
        <SongList
          albumSongs={popularSongs ?? []}
          isLoading={isLoadingPopularSongs}
        />

        <AlbumCarousel
          title="Albums"
          albums={
            isLoadingAlbums
              ? { items: undefined, loading: true, error: false }
              : isErrorAlbums
                ? { items: undefined, loading: false, error: true }
                : { items: albums ?? [], loading: false, error: false }
          }
          emptyMessage="No albums available"
        />

        <AlbumCarousel
          title="EPs"
          albums={
            isLoadingEps
              ? { items: undefined, loading: true, error: false }
              : isErrorEps
                ? { items: undefined, loading: false, error: true }
                : { items: eps ?? [], loading: false, error: false }
          }
          emptyMessage="No EPs available"
        />

        <AlbumCarousel
          title="Singles"
          albums={
            isLoadingSingles
              ? { items: undefined, loading: true, error: false }
              : isErrorSingles
                ? { items: undefined, loading: false, error: true }
                : { items: singles ?? [], loading: false, error: false }
          }
          emptyMessage="No singles available"
        />
      </div>
    </div>
  );
}
