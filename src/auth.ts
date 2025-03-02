import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession } from "next-auth";
import { db } from "~/server/db";
import { env } from "~/env";
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
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
});
