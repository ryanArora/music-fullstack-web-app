import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { albumInclude } from "./album";
import { getPresignedSongUrl } from "~/server/blob";

export const artistRouter = createTRPCRouter({
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const artists = await ctx.db.artist.findMany({
      take: 20,
    });

    return artists;
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

      const artists = await ctx.db.artist.findMany({
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
      if (artists.length > limit) {
        const nextItem = artists.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: artists,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const artist = await ctx.db.artist.findUniqueOrThrow({
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

      const songsWithUrls = await Promise.all(
        artist.songs.map(async (song) => ({
          ...song,
          url: await getPresignedSongUrl(song.id),
        })),
      );

      // Add presigned URLs to songs in albums
      const albumsWithSongUrls = await Promise.all(
        artist.albums.map(async (album) => {
          return {
            ...album,
            songs: await Promise.all(
              album.songs.map(async (song) => ({
                ...song,
                url: await getPresignedSongUrl(song.id),
              })),
            ),
          };
        }),
      );

      return {
        ...artist,
        songs: songsWithUrls,
        albums: albumsWithSongUrls,
      };
    }),

  getPopularSongs: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
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

      return await Promise.all(
        songs.map(async (song) => ({
          ...song,
          url: await getPresignedSongUrl(song.id),
        })),
      );
    }),

  getAlbumsByType: publicProcedure
    .input(
      z.object({
        artistId: z.string(),
        type: z.enum(["ALBUM", "EP", "SINGLE"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const albums = await ctx.db.album.findMany({
        where: {
          artistId: input.artistId,
          type: input.type,
        },
        orderBy: {
          releaseDate: "desc",
        },
        include: albumInclude,
      });

      // Add presigned URLs to songs in each album
      return Promise.all(
        albums.map(async (album) => {
          return {
            ...album,
            songs: await Promise.all(
              album.songs.map(async (song) => ({
                ...song,
                url: await getPresignedSongUrl(song.id),
              })),
            ),
          };
        }),
      );
    }),
});
