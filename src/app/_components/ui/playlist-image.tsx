"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { type RouterOutputs } from "~/trpc/react";

export function PlaylistImage({
  playlist,
}: {
  playlist: NonNullable<RouterOutputs["playlist"]["getById"]>;
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
      src={playlist.imageUrl}
      alt={playlist.title}
      className="object-cover"
      suppressHydrationWarning
      priority
      width={300}
      height={300}
    />
  );
}
