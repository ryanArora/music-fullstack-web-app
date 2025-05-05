import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getPresignedAlbumImageUrl,
  getPresignedArtistImageUrl,
  getPresignedSongUrl,
} from "~/server/blob";

export const albumInclude = {
  artist: true,
  songs: true,
} satisfies Prisma.AlbumInclude;

export type AlbumWithoutPresignedUrls = Prisma.AlbumGetPayload<{
  include: typeof albumInclude;
}>;
export async function albumWithPresignedUrls(album: AlbumWithoutPresignedUrls) {
  const [albumImageUrl, artistImageUrl, songsWithUrls] = await Promise.all([
    getPresignedAlbumImageUrl(album.id),
    getPresignedArtistImageUrl(album.artist.id),
    Promise.all(
      album.songs.map(async (song) => {
        const [songUrl, songImageUrl] = await Promise.all([
          getPresignedSongUrl(song.id),
          getPresignedAlbumImageUrl(song.albumId),
        ]);

        return {
          ...song,
          url: songUrl,
          imageUrl: songImageUrl,
        };
      }),
    ),
  ]);

  return {
    ...album,
    imageUrl: albumImageUrl,
    artist: {
      ...album.artist,
      imageUrl: artistImageUrl,
    },
    songs: songsWithUrls,
  };
}

export async function albumsWithPresignedUrls(
  albums: AlbumWithoutPresignedUrls[],
) {
  return Promise.all(albums.map((album) => albumWithPresignedUrls(album)));
}

export type Album = Awaited<ReturnType<typeof albumWithPresignedUrls>>;

export const albumRouter = createTRPCRouter({
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const albums = await ctx.db.album.findMany({
      include: albumInclude,
      take: 20,
    });

    return await albumsWithPresignedUrls(albums);
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
        items: await albumsWithPresignedUrls(albums),
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

      return await albumWithPresignedUrls(album);
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

      return await albumsWithPresignedUrls(albums);
    }),
});
