import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Home, Music, Search, User } from "lucide-react";

import { TRPCReactProvider } from "~/trpc/react";
import { MainNav } from "~/app/_components/main-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Music App",
  description: "A music streaming application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider cookies={cookies().toString()}>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="bg-background hidden w-64 flex-col border-r p-4 md:flex">
              <div className="mb-6 flex items-center gap-2 px-3">
                <Music className="text-primary h-6 w-6" />
                <h1 className="text-xl font-bold">Music App</h1>
              </div>
              <MainNav />
              <div className="mt-auto p-4">
                <div className="bg-primary/10 flex items-center gap-3 rounded-md p-3 text-sm">
                  <User className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Your Account</div>
                    <div className="text-muted-foreground text-xs">
                      Settings & Preferences
                    </div>
                  </div>
                </div>
              </div>
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
            </div>
            {/* Main content */}
            <div className="flex-1 overflow-auto pb-16 md:pb-0">{children}</div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
