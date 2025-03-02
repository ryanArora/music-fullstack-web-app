import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  // Public procedures
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

      const playlists = await ctx.db.playlist.findMany({
        where: {
          isPublic: true,
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
      if (playlists.length > limit) {
        const nextItem = playlists.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: playlists,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
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
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      // Only return if public or owned by the current user
      if (!playlist.isPublic && playlist.userId !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this playlist",
        });
      }

      return playlist;
    }),

  getPlaylistWithSongs: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
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
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      // Only return if public or owned by the current user
      if (!playlist.isPublic && playlist.userId !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this playlist",
        });
      }

      // Transform to expected format for the player
      return {
        ...playlist,
        songs: playlist.songs.map((songEntry) => songEntry.song),
      };
    }),

  // Protected procedures (requires authentication)
  getUserPlaylists: protectedProcedure.query(({ ctx }) => {
    return ctx.db.playlist.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: [
        { isLiked: "desc" }, // Liked songs first
        { title: "asc" }, // Then by title
      ],
    });
  }),

  createPlaylist: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(50),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.playlist.create({
        data: {
          title: input.title,
          isPublic: input.isPublic,
          imageUrl: null, // Will be updated when songs are added
          userId: ctx.session.user.id,
        },
      });
    }),

  updatePlaylist: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(50).optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
        select: { userId: true, isLiked: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      if (playlist.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this playlist",
        });
      }

      // Don't allow renaming the Liked Songs playlist
      if (playlist.isLiked && input.title) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot rename Liked Songs playlist",
        });
      }

      return ctx.db.playlist.update({
        where: { id: input.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        },
      });
    }),

  deletePlaylist: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership and prevent deletion of Liked Songs
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
        select: { userId: true, isLiked: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      if (playlist.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this playlist",
        });
      }

      if (playlist.isLiked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete the Liked Songs playlist",
        });
      }

      return ctx.db.playlist.delete({
        where: { id: input.id },
      });
    }),

  addSongToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        songId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        include: { songs: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      if (playlist.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this playlist",
        });
      }

      // Check if song already exists in playlist
      const songExists = await ctx.db.playlistSong.findFirst({
        where: {
          playlistId: input.playlistId,
          songId: input.songId,
        },
      });

      if (songExists) {
        return songExists; // Song already in playlist
      }

      // Get the song to use its image if playlist has no image
      const song = await ctx.db.song.findUnique({
        where: { id: input.songId },
        select: { imageUrl: true },
      });

      if (!song) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Song not found" });
      }

      // Get the highest order value
      const highestOrder =
        playlist.songs.length > 0
          ? Math.max(...playlist.songs.map((song) => song.order))
          : -1;

      // Update playlist image if it doesn't have one
      if (!playlist.imageUrl) {
        await ctx.db.playlist.update({
          where: { id: input.playlistId },
          data: { imageUrl: song.imageUrl },
        });
      }

      // Add song to playlist
      return ctx.db.playlistSong.create({
        data: {
          playlistId: input.playlistId,
          songId: input.songId,
          order: highestOrder + 1,
        },
      });
    }),

  removeSongFromPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        songId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { userId: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      if (playlist.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this playlist",
        });
      }

      // Find the song to remove
      const playlistSong = await ctx.db.playlistSong.findFirst({
        where: {
          playlistId: input.playlistId,
          songId: input.songId,
        },
      });

      if (!playlistSong) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not in playlist",
        });
      }

      return ctx.db.playlistSong.delete({
        where: { id: playlistSong.id },
      });
    }),

  toggleLikedSong: protectedProcedure
    .input(z.object({ songId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find or create user's Liked Songs playlist
      let likedPlaylist = await ctx.db.playlist.findFirst({
        where: {
          userId: ctx.session.user.id,
          isLiked: true,
        },
        include: {
          songs: true,
        },
      });

      // If no liked playlist exists, create one
      if (!likedPlaylist) {
        likedPlaylist = await ctx.db.playlist.create({
          data: {
            title: "Liked Songs",
            isLiked: true,
            isPublic: false,
            userId: ctx.session.user.id,
          },
          include: {
            songs: true,
          },
        });
      }

      // Check if song is already liked
      const existingSong = likedPlaylist.songs.find(
        (s) => s.songId === input.songId,
      );

      if (existingSong) {
        // Unlike - remove from playlist
        await ctx.db.playlistSong.delete({
          where: { id: existingSong.id },
        });
        return { liked: false };
      } else {
        // Like - add to playlist
        const song = await ctx.db.song.findUnique({
          where: { id: input.songId },
          select: { imageUrl: true },
        });

        if (!song) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Song not found" });
        }

        // Update playlist image if it doesn't have one
        if (!likedPlaylist.imageUrl) {
          await ctx.db.playlist.update({
            where: { id: likedPlaylist.id },
            data: { imageUrl: song.imageUrl },
          });
        }

        // Get highest order
        const highestOrder =
          likedPlaylist.songs.length > 0
            ? Math.max(...likedPlaylist.songs.map((s) => s.order))
            : -1;

        await ctx.db.playlistSong.create({
          data: {
            playlistId: likedPlaylist.id,
            songId: input.songId,
            order: highestOrder + 1,
          },
        });

        return { liked: true };
      }
    }),

  isLikedSong: protectedProcedure
    .input(z.object({ songId: z.string() }))
    .query(async ({ ctx, input }) => {
      const likedPlaylist = await ctx.db.playlist.findFirst({
        where: {
          userId: ctx.session.user.id,
          isLiked: true,
        },
        include: {
          songs: {
            where: {
              songId: input.songId,
            },
          },
        },
      });

      return {
        liked: likedPlaylist?.songs.length ? true : false,
        playlistId: likedPlaylist?.id,
      };
    }),
});
