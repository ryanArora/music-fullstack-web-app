import Image from "next/image";
import Link from "next/link";
import { type Artist } from "@prisma/client";

import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";

type ArtistCardProps = {
  className?: string;
} & (
  | {
      loading: true;
      error: false;
      artist: undefined;
    }
  | {
      loading: false;
      error: false;
      artist: Artist & { imageUrl: string };
    }
  | {
      loading: false;
      error: true;
      artist: undefined;
    }
);

export function ArtistCard({
  loading,
  error,
  artist,
  className,
}: ArtistCardProps) {
  if (error) return null;

  if (loading) {
    return (
      <div className={cn("group space-y-3", className)}>
        <Skeleton className="aspect-square w-full rounded-full" />
        <div className="text-center">
          <Skeleton className="mx-auto h-5 w-24" />
          <Skeleton className="mx-auto mt-1 h-4 w-16" />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/artists/${artist.id}`} className="block">
      <div className={cn("group space-y-3", className)}>
        <div className="relative aspect-square overflow-hidden rounded-full">
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
        <div className="text-center">
          <h3 className="truncate font-medium hover:underline">
            {artist.name}
          </h3>
          <p className="text-sm text-muted-foreground">Artist</p>
        </div>
      </div>
    </Link>
  );
}
