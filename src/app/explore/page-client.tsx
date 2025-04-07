"use client";

import { AlbumCarousel } from "~/app/_components/album-carousel";
import { ArtistCarousel } from "~/app/_components/artist-carousel";
import { PlaylistCarousel } from "~/app/_components/playlist-carousel";
import { api } from "~/trpc/react";
import { SongList } from "~/app/_components/song-list";

export default function ExplorePage() {
  // Fetch all the data we need for the explore page with limits
  const { data: songsData, isLoading: isLoadingSongs } =
    api.song.getAll.useQuery({
      limit: 10,
    });

  const {
    data: albums,
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
  } = api.album.getFeatured.useQuery();

  const {
    data: artists,
    isLoading: isLoadingArtists,
    isError: isErrorArtists,
  } = api.artist.getFeatured.useQuery();

  const {
    data: playlists,
    isLoading: isLoadingPlaylists,
    isError: isErrorPlaylists,
  } = api.playlist.getFeatured.useQuery();

  // Extract songs from the response
  const songs = songsData?.items ?? [];

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover new music and artists</p>
      </div>

      <AlbumCarousel
        title="Popular Albums"
        albums={
          isLoadingAlbums
            ? { items: undefined, loading: true, error: false }
            : isErrorAlbums
              ? { items: undefined, loading: false, error: true }
              : { items: albums ?? [], loading: false, error: false }
        }
      />

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Featured Songs</h2>
        <div className="space-y-2">
          <SongList albumSongs={songs} isLoading={isLoadingSongs} />
        </div>
      </section>

      <ArtistCarousel
        title="Top Artists"
        artists={
          isLoadingArtists
            ? { items: undefined, loading: true, error: false }
            : isErrorArtists
              ? { items: undefined, loading: false, error: true }
              : { items: artists ?? [], loading: false, error: false }
        }
      />

      <PlaylistCarousel
        title="Playlists For You"
        playlists={
          isLoadingPlaylists
            ? { items: undefined, loading: true, error: false }
            : isErrorPlaylists
              ? { items: undefined, loading: false, error: true }
              : { items: playlists ?? [], loading: false, error: false }
        }
      />
    </main>
  );
}
