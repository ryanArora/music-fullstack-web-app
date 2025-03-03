import Image from "next/image";
import Link from "next/link";
import { type Artist } from "@prisma/client";

import { cn } from "~/lib/utils";

interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  return (
    <Link href={`/artists/${artist.id}`} className="block">
      <div className={cn("group space-y-3", className)}>
        <div className="relative aspect-square overflow-hidden rounded-full">
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="text-center">
          <h3 className="font-medium hover:underline">{artist.name}</h3>
          <p className="text-sm text-muted-foreground">Artist</p>
        </div>
      </div>
    </Link>
  );
}
