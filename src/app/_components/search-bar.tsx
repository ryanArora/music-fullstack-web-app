"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { api } from "~/trpc/react";
import Image from "next/image";
import type { Artist, Album, Song } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { Input } from "~/app/_components/ui/input";

type SearchArtist = Pick<Artist, "id" | "name" | "imageUrl">;
type SearchAlbum = Pick<Album, "id" | "title" | "imageUrl"> & {
  artist: Pick<Artist, "name">;
};
type SearchSong = Pick<Song, "id" | "title" | "imageUrl"> & {
  artist: Pick<Artist, "name">;
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = api.search.search.useQuery(
    { query },
    { enabled: query.length > 0 },
  );

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    router.push(`/${type}/${id}`);
  };

  // Show popover only when there are results and query is not empty
  useEffect(() => {
    if (query.length > 0 && searchResults.data) {
      setOpen(true);
    } else if (query.length === 0) {
      setOpen(false);
    }
  }, [query, searchResults.data]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search songs, albums, artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[80vh] w-[300px] overflow-y-auto p-4 sm:w-[400px]"
        align="start"
      >
        {query.length > 0 && !searchResults.data && searchResults.isLoading && (
          <div className="py-8 text-center text-muted-foreground">
            Searching...
          </div>
        )}

        {query.length > 0 &&
          searchResults.data &&
          !searchResults.data.artists.length &&
          !searchResults.data.albums.length &&
          !searchResults.data.songs.length && (
            <div className="py-8 text-center text-muted-foreground">
              No results found.
            </div>
          )}

        <div className="space-y-6">
          {searchResults.data?.artists &&
            searchResults.data.artists.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Artists
                </h3>
                <div className="space-y-1">
                  {searchResults.data.artists.map((artist: SearchArtist) => (
                    <div
                      key={artist.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                      onClick={() => handleSelect("artists", artist.id)}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{artist.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {searchResults.data?.albums &&
            searchResults.data.albums.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Albums
                </h3>
                <div className="space-y-1">
                  {searchResults.data.albums.map((album: SearchAlbum) => (
                    <div
                      key={album.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                      onClick={() => handleSelect("albums", album.id)}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded">
                        <Image
                          src={album.imageUrl}
                          alt={album.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span>{album.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {album.artist.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {searchResults.data?.songs && searchResults.data.songs.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Songs
              </h3>
              <div className="space-y-1">
                {searchResults.data.songs.map((song: SearchSong) => (
                  <div
                    key={song.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                    onClick={() => handleSelect("songs", song.id)}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded">
                      <Image
                        src={song.imageUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span>{song.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {song.artist.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
