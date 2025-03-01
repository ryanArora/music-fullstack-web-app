import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const albumRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.album.findMany({
      include: {
        artist: true,
      },
      orderBy: {
        title: "asc",
      },
    });
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
