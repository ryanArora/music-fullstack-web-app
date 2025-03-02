"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/app/_components/ui/carousel";
import { PlaylistCard } from "~/app/_components/playlist-card";
import { RouterOutputs } from "~/trpc/react";

interface PlaylistCarouselProps {
  title: string;
  playlists: RouterOutputs["playlist"]["getById"][];
  emptyMessage?: string;
}

export function PlaylistCarousel({
  title,
  playlists,
  emptyMessage = "No playlists found",
}: PlaylistCarouselProps) {
  return (
    <div className="my-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {playlists.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: playlists.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {playlists.map((playlist) => (
                <CarouselItem
                  key={playlist.id}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <PlaylistCard playlist={playlist} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
