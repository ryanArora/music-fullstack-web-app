import { Metadata } from "next";

import { AlbumCard } from "~/app/_components/album-card";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Albums | Music App",
  description: "Browse all albums",
};

export default async function AlbumsPage() {
  const albums = await api.album.getAll();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Albums</h1>
        <p className="text-muted-foreground">Browse all albums</p>
      </div>

      {albums.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No albums available</h2>
          <p className="text-muted-foreground mb-4">
            We don't have any albums yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
