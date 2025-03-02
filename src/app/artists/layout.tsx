import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artists | Music App",
  description: "Browse all artists",
};

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
