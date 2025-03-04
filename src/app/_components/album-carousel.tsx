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
import { type RouterOutputs } from "~/trpc/react";

type AlbumCarouselProps = {
  title: string;
  emptyMessage?: string;
} & {
  albums:
    | {
        items: RouterOutputs["album"]["getById"][];
        loading: false;
        error: false;
      }
    | {
        items: undefined;
        loading: false;
        error: true;
      }
    | {
        items: undefined;
        loading: true;
        error: false;
      };
};

export function AlbumCarousel({
  title,
  albums,
  emptyMessage = "No albums found",
}: AlbumCarouselProps) {
  return (
    <div className="my-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {albums.error ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : albums.loading ? (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <AlbumCard loading={true} error={false} album={undefined} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      ) : albums.items.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: albums.items.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {albums.items.map((album) => (
                <CarouselItem
                  key={album.id}
                  className="pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <AlbumCard loading={false} error={false} album={album} />
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
