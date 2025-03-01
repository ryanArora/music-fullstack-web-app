import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const artistRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.artist.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.artist.findUnique({
        where: {
          id: input.id,
        },
        include: {
          albums: true,
          songs: {
            include: {
              album: true,
            },
          },
        },
      });
    }),
});
