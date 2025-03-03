"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { ArtistCard } from "~/app/_components/artist-card";
import { api } from "~/trpc/react";

export default function ArtistsPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.artist.getAll.useInfiniteQuery(
    {
      limit: 24,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages to get all artists
  const artists = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Artists</h1>
        <p className="text-muted-foreground">Browse all artists</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">Error loading artists</h2>
          <p className="mb-4 text-muted-foreground">
            Something went wrong while loading artists. Please try again later.
          </p>
        </div>
      ) : artists.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No artists available</h2>
          <p className="mb-4 text-muted-foreground">
            We don&apos;t have any artists yet. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>

          {(hasNextPage || isFetchingNextPage) && (
            <div
              ref={ref}
              className="mt-8 flex h-20 w-full items-center justify-center"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
