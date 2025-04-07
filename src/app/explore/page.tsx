import { type Metadata } from "next";
import ExplorePage from "./page-client";

export const metadata: Metadata = {
  title: "Explore | Music App",
  description: "Explore music, albums, artists and playlists",
};

export default function ExplorePageServer() {
  return <ExplorePage />;
}
