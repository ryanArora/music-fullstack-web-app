import { type Metadata } from "next";
import { api } from "~/trpc/server";
import ArtistDetailPage from "./page-client";

export const metadata: Metadata = {
  title: "Artists | Music App",
  description: "Browse all artists",
};

export default async function ArtistsLayout({
  params,
}: {
  params: { id: string };
}) {
  const artist = await api.artist.getById({ id: (await params).id });
  return <ArtistDetailPage artist={artist} />;
}
