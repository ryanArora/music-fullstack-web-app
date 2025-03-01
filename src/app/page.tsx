import { SongCard } from "~/app/_components/song-card";
import { AlbumCard } from "~/app/_components/album-card";
import { ArtistCard } from "~/app/_components/artist-card";
import { PlaylistCard } from "~/app/_components/playlist-card";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
  // Fetch all the data we need for the homepage
  const songs = await api.song.getAll();
  const albums = await api.album.getAll();
  const artists = await api.artist.getAll();
  const playlists = await api.playlist.getAll();

  return (
    <HydrateClient>
      <main className="container mx-auto min-h-screen px-4 py-8">
        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Songs</h2>
            <a href="/songs" className="text-primary hover:underline">
              See all
            </a>
          </div>
          <div className="space-y-2">
            {songs.slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Albums</h2>
            <a href="/albums" className="text-primary hover:underline">
              See all
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Artists</h2>
            <a href="/artists" className="text-primary hover:underline">
              See all
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Playlists For You</h2>
            <a href="/playlists" className="text-primary hover:underline">
              See all
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
