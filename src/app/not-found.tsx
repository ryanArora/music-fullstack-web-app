import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-24 text-center">
      <Music className="text-primary mb-6 h-16 w-16" />
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the page you were looking for. The music might have
        stopped, but your journey doesn't have to.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
