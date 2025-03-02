import { Metadata } from "next";

import { ArtistCard } from "~/app/_components/artist-card";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Artists | Music App",
  description: "Browse all artists",
};

export default async function ArtistsPage() {
  const artists = await api.artist.getAll();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Artists</h1>
        <p className="text-muted-foreground">Browse all artists</p>
      </div>

      {artists.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No artists available</h2>
          <p className="text-muted-foreground mb-4">
            We don't have any artists yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
