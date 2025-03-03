"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { PlaylistCard } from "~/app/_components/playlist-card";
import { api } from "~/trpc/react";

export default function PlaylistsPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.playlist.getAll.useInfiniteQuery(
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

  // Flatten the pages to get all playlists
  const playlists = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Playlists</h1>
        <p className="text-muted-foreground">Browse all playlists</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">Error loading playlists</h2>
          <p className="mb-4 text-muted-foreground">
            Something went wrong while loading playlists. Please try again
            later.
          </p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">No playlists available</h2>
          <p className="mb-4 text-muted-foreground">
            We don&apos;t have any playlists yet. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
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
