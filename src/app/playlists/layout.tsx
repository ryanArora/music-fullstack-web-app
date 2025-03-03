import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlists | Music App",
  description: "Browse all playlists",
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
