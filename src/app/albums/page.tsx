"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { AlbumCard } from "~/app/_components/album-card";
import { api } from "~/trpc/react";

export default function AlbumsPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.album.getAll.useInfiniteQuery(
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

  // Flatten the pages to get all albums
  const albums = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Albums</h1>
        <p className="text-muted-foreground">Browse all albums</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">Error loading albums</h2>
          <p className="mb-4 text-muted-foreground">
            Something went wrong while loading albums. Please try again later.
          </p>
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No albums available</h2>
          <p className="mb-4 text-muted-foreground">
            We don't have any albums yet. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
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
