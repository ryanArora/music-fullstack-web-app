"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { RouterOutputs } from "~/trpc/react";

export function PlaylistImage({
  playlist,
}: {
  playlist: RouterOutputs["playlist"]["getById"];
}) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Image
      src={
        playlist.imageUrl ??
        (theme === "dark"
          ? "/images/playlist-default-dark.svg"
          : "/images/playlist-default-light.svg")
      }
      alt={playlist.title}
      fill
      className="object-cover"
      suppressHydrationWarning
    />
  );
}
