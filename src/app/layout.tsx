import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Home, Music, Search, User } from "lucide-react";

import { TRPCReactProvider } from "~/trpc/react";
import { MainNav } from "~/app/_components/main-nav";
import { ThemeProvider } from "~/app/_components/theme-provider";
import { ThemeToggle } from "~/app/_components/ui/theme-toggle";
import { PlayerFooterWrapper } from "~/app/_components/player-footer-wrapper";

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
          <TRPCReactProvider cookies={(await cookies()).toString()}>
            <div className="flex h-screen">
              {/* Sidebar */}
              <div className="bg-background hidden w-64 flex-col overflow-y-auto border-r p-4 md:flex">
                <div className="mb-6 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <Music className="text-primary h-6 w-6" />
                    <h1 className="text-xl font-bold">Music App</h1>
                  </div>
                  <ThemeToggle />
                </div>
                <MainNav />
              </div>
              {/* Mobile bottom navigation */}
              <div className="bg-background fixed bottom-0 left-0 z-10 flex w-full items-center justify-around border-t py-2 md:hidden">
                <a href="/" className="flex flex-col items-center p-2">
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                </a>
                <a href="/search" className="flex flex-col items-center p-2">
                  <Search className="h-5 w-5" />
                  <span className="text-xs">Search</span>
                </a>
                <a href="/library" className="flex flex-col items-center p-2">
                  <Music className="h-5 w-5" />
                  <span className="text-xs">Library</span>
                </a>
                <div className="flex flex-col items-center p-2">
                  <ThemeToggle />
                  <span className="text-xs">Theme</span>
                </div>
              </div>
              {/* Main content */}
              <div className="flex-1 overflow-y-auto pb-24">{children}</div>

              {/* Player Footer */}
              <PlayerFooterWrapper />
            </div>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
