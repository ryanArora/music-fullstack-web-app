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
          albums: {
            orderBy: {
              releaseDate: "desc",
            },
            include: {
              songs: true,
            },
          },
          songs: {
            orderBy: {
              releaseDate: "desc",
            },
            include: {
              album: true,
            },
            take: 10, // Get only top 10 songs
          },
        },
      });
    }),

  getPopularSongs: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.song.findMany({
        where: {
          artistId: input.artistId,
        },
        orderBy: {
          releaseDate: "desc",
        },
        include: {
          artist: true,
          album: true,
        },
        take: 5, // Get top 5 songs for now
      });
    }),

  getAlbumsByType: publicProcedure
    .input(
      z.object({
        artistId: z.string(),
        type: z.enum(["ALBUM", "EP", "SINGLE"]),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.album.findMany({
        where: {
          artistId: input.artistId,
          type: input.type as any, // Type casting to handle enum
        },
        orderBy: {
          releaseDate: "desc",
        },
        include: {
          songs: true,
        },
      });
    }),
});
