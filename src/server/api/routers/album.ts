import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPresignedSongUrl } from "~/server/blob";

export const albumInclude = {
  artist: true,
  songs: {
    include: {
      artist: true,
      album: true,
    },
    orderBy: {
      title: "asc",
    },
  },
} satisfies Prisma.AlbumInclude;

// Define the album type with included relations
type AlbumWithRelations = Prisma.AlbumGetPayload<{
  include: typeof albumInclude;
}>;

// Define type for song with presigned URL
type SongWithPresignedUrl = AlbumWithRelations["songs"][number] & {
  url: string;
};

// Define return type with presigned URLs
type AlbumWithPresignedUrls = Omit<AlbumWithRelations, "songs"> & {
  songs: SongWithPresignedUrl[];
};

// Helper function to add presigned URLs to songs in an album
const addPresignedUrlsToAlbum = async (
  album: AlbumWithRelations,
): Promise<AlbumWithPresignedUrls> => {
  const songsWithUrls = await Promise.all(
    album.songs.map(async (song) => ({
      ...song,
      url: await getPresignedSongUrl(song.id),
    })),
  );

  return {
    ...album,
    songs: songsWithUrls,
  };
};

// Helper to add presigned URLs to multiple albums
const addPresignedUrlsToAlbums = async (
  albums: AlbumWithRelations[],
): Promise<AlbumWithPresignedUrls[]> => {
  return Promise.all(albums.map(addPresignedUrlsToAlbum));
};

export const albumRouter = createTRPCRouter({
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const albums = await ctx.db.album.findMany({
      include: albumInclude,
      take: 20,
    });

    return await addPresignedUrlsToAlbums(albums);
  }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const albums = await ctx.db.album.findMany({
        include: albumInclude,
        orderBy: {
          id: "asc",
        },
        take: limit + 1,
        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip the cursor
            }
          : {}),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (albums.length > limit) {
        const nextItem = albums.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: await addPresignedUrlsToAlbums(albums),
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const album = await ctx.db.album.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: albumInclude,
      });

      return await addPresignedUrlsToAlbum(album);
    }),

  getByArtistId: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const albums = await ctx.db.album.findMany({
        where: {
          artistId: input.artistId,
        },
        include: albumInclude,
        orderBy: {
          releaseDate: "desc",
        },
      });

      return await addPresignedUrlsToAlbums(albums);
    }),
});
