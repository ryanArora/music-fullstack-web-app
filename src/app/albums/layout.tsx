import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Albums | Music App",
  description: "Browse all albums",
};

export default function AlbumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
