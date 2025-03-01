import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const songRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.song.findMany({
      include: {
        artist: true,
        album: true,
      },
      orderBy: {
        title: "asc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.song.findUnique({
        where: {
          id: input.id,
        },
        include: {
          artist: true,
          album: true,
        },
      });
    }),

  getByArtistId: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.song.findMany({
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
    }),

  getByAlbumId: publicProcedure
    .input(z.object({ albumId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.song.findMany({
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
    }),
});
