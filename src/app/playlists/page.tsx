import { Metadata } from "next";

import { PlaylistCard } from "~/app/_components/playlist-card";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Playlists | Music App",
  description: "Browse all playlists",
};

export default async function PlaylistsPage() {
  const playlists = await api.playlist.getAll();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Playlists</h1>
        <p className="text-muted-foreground">Browse all playlists</p>
      </div>

      {playlists.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No playlists available</h2>
          <p className="text-muted-foreground mb-4">
            We don't have any playlists yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
