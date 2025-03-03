import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPresignedSongUrl } from "~/server/minio";

export const songRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).nullish(),
          cursor: z.string().nullish(),
        })
        .nullish(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const songs = await ctx.db.song.findMany({
        include: {
          artist: true,
          album: true,
        },
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
      if (songs.length > limit) {
        const nextItem = songs.pop();
        nextCursor = nextItem?.id;
      }

      // Add presigned URLs to each song
      const songsWithUrls = await Promise.all(
        songs.map(async (song) => {
          return {
            ...song,
            url: await getPresignedSongUrl(song.id),
          };
        }),
      );

      return {
        items: songsWithUrls,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const song = await ctx.db.song.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          artist: true,
          album: true,
        },
      });

      return {
        ...song,
        url: await getPresignedSongUrl(song.id),
      };
    }),

  getByArtistId: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
        where: {
          artistId: input.artistId,
        },
        include: {
          artist: true,
          album: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      return Promise.all(
        songs.map(async (song) => ({
          ...song,
          url: await getPresignedSongUrl(song.id),
        })),
      );
    }),

  getByAlbumId: publicProcedure
    .input(z.object({ albumId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
        where: {
          albumId: input.albumId,
        },
        include: {
          artist: true,
          album: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      return Promise.all(
        songs.map(async (song) => ({
          ...song,
          url: await getPresignedSongUrl(song.id),
        })),
      );
    }),
});
