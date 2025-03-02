"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/app/_components/ui/carousel";
import { AlbumCard } from "~/app/_components/album-card";
import { RouterOutputs } from "~/trpc/react";

interface AlbumCarouselProps {
  title: string;
  albums: RouterOutputs["album"]["getById"][];
  emptyMessage?: string;
}

export function AlbumCarousel({
  title,
  albums,
  emptyMessage = "No albums found",
}: AlbumCarouselProps) {
  return (
    <div className="my-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {albums.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: albums.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {albums.map((album) => (
                <CarouselItem
                  key={album.id}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <AlbumCard album={album} />
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
