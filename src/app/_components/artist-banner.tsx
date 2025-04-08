"use client";

import Image from "next/image";
import { type Artist } from "@prisma/client";

interface ArtistBannerProps {
  artist: Artist;
  description?: string;
}

export function ArtistBanner({ artist, description }: ArtistBannerProps) {
  return (
    <div className="relative h-[30rem] w-full overflow-hidden rounded-lg">
      <div className="absolute inset-0">
        <Image
          src={artist.imageUrl}
          alt={artist.name}
          className="h-full w-full object-cover"
          width={1200}
          height={800}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 p-8">
        <h1 className="mb-2 text-4xl font-bold text-white">{artist.name}</h1>
        {description && <p className="text-lg text-gray-200">{description}</p>}
      </div>
    </div>
  );
}
