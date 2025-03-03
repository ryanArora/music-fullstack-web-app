import { type Metadata } from "next";
import { AlbumCarousel } from "~/app/_components/album-carousel";
import { ArtistCarousel } from "~/app/_components/artist-carousel";
import { PlaylistCarousel } from "~/app/_components/playlist-carousel";
import { HydrateClient, api } from "~/trpc/server";
import { SongList } from "~/app/_components/song-list";

export const metadata: Metadata = {
  title: "Explore | Music App",
  description: "Explore music, albums, artists and playlists",
};

export default async function ExplorePage() {
  // Fetch all the data we need for the explore page with limits
  const songsResponse = await api.song.getAll({ limit: 10 });
  const albumsResponse = await api.album.getAll({ limit: 20 });
  const artistsResponse = await api.artist.getAll({ limit: 20 });
  const playlistsResponse = await api.playlist.getAll({ limit: 20 });

  // Extract the items from the paginated responses
  const songs = songsResponse.items;
  const albums = albumsResponse.items;
  const artists = artistsResponse.items;
  const playlists = playlistsResponse.items;

  return (
    <HydrateClient>
      <main className="container mx-auto min-h-screen px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground">
            Discover new music and artists
          </p>
        </div>

        <AlbumCarousel title="Popular Albums" albums={albums} />

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold">Featured Songs</h2>
          <div className="space-y-2">
            <SongList songs={songs} />
          </div>
        </section>

        <ArtistCarousel title="Top Artists" artists={artists} />

        <PlaylistCarousel title="Playlists For You" playlists={playlists} />
      </main>
    </HydrateClient>
  );
}
