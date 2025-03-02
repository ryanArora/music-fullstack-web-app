import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const albumRouter = createTRPCRouter({
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
        include: {
          artist: true,
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
      if (albums.length > limit) {
        const nextItem = albums.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: albums,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.album.findUnique({
        where: {
          id: input.id,
        },
        include: {
          artist: true,
          songs: {
            orderBy: {
              title: "asc",
            },
          },
        },
      });
    }),

  getAlbumWithSongs: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const album = await ctx.db.album.findUnique({
        where: {
          id: input.id,
        },
        include: {
          artist: true,
          songs: {
            include: {
              artist: true,
            },
            orderBy: {
              title: "asc",
            },
          },
        },
      });

      if (!album) {
        throw new Error("Album not found");
      }

      return album;
    }),

  getByArtistId: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.album.findMany({
        where: {
          artistId: input.artistId,
        },
        include: {
          artist: true,
          songs: true,
        },
        orderBy: {
          releaseDate: "desc",
        },
      });
    }),
});
