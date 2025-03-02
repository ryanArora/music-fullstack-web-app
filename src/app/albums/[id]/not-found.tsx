import Link from "next/link";

import { Button } from "~/app/_components/ui/button";

export default function AlbumNotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold">Album Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The album you are looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/albums">Browse Albums</Link>
      </Button>
    </div>
  );
}
