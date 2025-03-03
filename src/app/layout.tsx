import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Disc, Home, Music, Radio, User } from "lucide-react";

import { TRPCReactProvider } from "~/trpc/react";
import { MainNav } from "~/app/_components/main-nav";
import { ThemeProvider } from "~/app/_components/theme-provider";
import { PlayerFooterWrapper } from "~/app/_components/player-footer-wrapper";
import { AuthProvider } from "~/app/_components/auth-provider";
import { UserDropdown } from "~/app/_components/user-dropdown";
import { PlaylistSidebar } from "~/app/_components/playlist-sidebar";
import { Toaster } from "~/app/_components/toaster";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Music App",
  description: "A music streaming application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <TRPCReactProvider cookies={(await cookies()).toString()}>
              <div className="flex h-screen">
                {/* Sidebar */}
                <div className="hidden w-64 flex-col overflow-y-auto border-r bg-background p-4 md:flex">
                  <div className="mb-6 flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <Music className="h-6 w-6 text-primary" />
                      <h1 className="text-xl font-bold">Music App</h1>
                    </div>
                  </div>
                  <MainNav />
                  <div className="mt-6">
                    <PlaylistSidebar />
                  </div>
                </div>
                {/* Mobile bottom navigation */}
                <div className="fixed bottom-0 left-0 z-10 flex w-full items-center justify-around border-t bg-background py-2 md:hidden">
                  <Link href="/" className="flex flex-col items-center p-2">
                    <Home className="h-5 w-5" />
                    <span className="text-xs">Home</span>
                  </Link>
                  <Link
                    href="/explore"
                    className="flex flex-col items-center p-2"
                  >
                    <Radio className="h-5 w-5" />
                    <span className="text-xs">Explore</span>
                  </Link>
                  <Link
                    href="/albums"
                    className="flex flex-col items-center p-2"
                  >
                    <Disc className="h-5 w-5" />
                    <span className="text-xs">Albums</span>
                  </Link>
                  <Link
                    href="/artists"
                    className="flex flex-col items-center p-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs">Artists</span>
                  </Link>
                </div>
                {/* Main content */}
                <div className="flex-1 overflow-y-auto pb-24">
                  {/* Header with user dropdown */}
                  <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background px-4 md:px-6">
                    <UserDropdown />
                  </header>
                  {children}
                </div>

                {/* Player Footer */}
                <PlayerFooterWrapper />
              </div>
              <Toaster />
            </TRPCReactProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
