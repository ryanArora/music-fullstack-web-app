import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession } from "next-auth";
import { db } from "~/server/db";
import { env } from "~/env";
import { blob } from "./server/blob";
import { join } from "path";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 * @see https://next-auth.js.org/getting-started/typescript
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Discord,
    ...(env.NEXT_PUBLIC_IS_STAGING
      ? [
          Credentials({
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            authorize: async () => {
              return {
                id: "tester",
                name: "Tester",
                email: "tester@example.com",
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return;

      const likedPlaylist = await db.playlist.create({
        data: {
          title: "Liked Songs",
          isLiked: true,
          isPublic: false,
          userId: user.id,
        },
      });

      await blob.fPutObject(
        env.MINIO_BUCKET_NAME_PLAYLIST_IMAGES,
        `${likedPlaylist.id}.webp`,
        join(process.cwd(), "public/images/playlist-default.webp"),
      );
    },
  },
  session: {
    strategy: "jwt",
  },
});
