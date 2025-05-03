import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { artistInclude, artistsWithPresignedUrls } from "./artist";
import { albumInclude, albumsWithPresignedUrls } from "./album";
import { songInclude, songsWithPresignedUrls } from "./song";

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      input.query = input.query.trim();

      if (!input.query) {
        return {
          artists: [],
          albums: [],
          songs: [],
        };
      }

      const [artists, albums, songs] = await Promise.all([
        // Search artists
        ctx.db.artist.findMany({
          where: {
            name: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          take: 5,
          orderBy: {
            name: "asc",
          },
          include: artistInclude,
        }),

        // Search albums
        ctx.db.album.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                artist: {
                  name: {
                    contains: input.query,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },
          take: 5,
          orderBy: {
            title: "asc",
          },
          include: albumInclude,
        }),

        // Search songs
        ctx.db.song.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                artist: {
                  name: {
                    contains: input.query,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },
          take: 5,
          orderBy: {
            title: "asc",
          },
          include: songInclude,
        }),
      ]);

      const [artistsWithUrls, albumsWithUrls, songsWithUrls] =
        await Promise.all([
          artistsWithPresignedUrls(artists),
          albumsWithPresignedUrls(albums),
          songsWithPresignedUrls(songs),
        ]);

      return {
        artists: artistsWithUrls,
        albums: albumsWithUrls,
        songs: songsWithUrls,
      };
    }),
});
