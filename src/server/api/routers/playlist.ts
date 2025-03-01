import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.playlist.findMany({
      orderBy: {
        title: "asc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.playlist.findUnique({
        where: {
          id: input.id,
        },
        include: {
          songs: {
            include: {
              song: {
                include: {
                  artist: true,
                  album: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }),
});
