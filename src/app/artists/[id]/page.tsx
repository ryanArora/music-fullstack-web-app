import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { ArtistBanner } from "~/app/_components/artist-banner";
import { AlbumCarousel } from "~/app/_components/album-carousel";
import { SongList } from "~/app/_components/song-list";

interface ArtistDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ArtistDetailPage({
  params,
}: ArtistDetailPageProps) {
  // Fetch artist data
  const artist = await api.artist.getById({ id: params.id }).catch(() => null);

  if (!artist) {
    notFound();
  }

  // Fetch popular songs
  const popularSongs = await api.artist.getPopularSongs({
    artistId: artist.id,
  });

  // Fetch albums, EPs, and singles
  const albums = await api.artist.getAlbumsByType({
    artistId: artist.id,
    type: "ALBUM",
  });

  const eps = await api.artist.getAlbumsByType({
    artistId: artist.id,
    type: "EP",
  });

  const singles = await api.artist.getAlbumsByType({
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
        <SongList songs={popularSongs} />

        <AlbumCarousel
          title="Albums"
          albums={albums.map((album) => ({
            ...album,
            artist: {
              id: artist.id,
              name: artist.name,
              imageUrl: artist.imageUrl,
              createdAt: artist.createdAt,
              updatedAt: artist.updatedAt,
            },
          }))}
          emptyMessage="No albums available"
        />

        <AlbumCarousel
          title="EPs"
          albums={eps}
          emptyMessage="No EPs available"
        />

        <AlbumCarousel
          title="Singles"
          albums={singles.map((album) => ({
            ...album,
            artist: {
              id: artist.id,
              name: artist.name,
              imageUrl: artist.imageUrl,
              createdAt: artist.createdAt,
              updatedAt: artist.updatedAt,
            },
          }))}
          emptyMessage="No singles available"
        />
      </div>
    </div>
  );
}
