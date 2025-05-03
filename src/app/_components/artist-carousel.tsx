"use client";

import React from "react";
import { type Artist } from "@prisma/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/app/_components/ui/carousel";
import { ArtistCard } from "~/app/_components/artist-card";

type ArtistCarouselProps = {
  title: string;
  emptyMessage?: string;
} & {
  artists:
    | {
        items: (Artist & { imageUrl: string })[];
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

export function ArtistCarousel({
  title,
  artists,
  emptyMessage = "No artists found",
}: ArtistCarouselProps) {
  return (
    <div className="my-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {artists.error ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : artists.loading ? (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <ArtistCard loading={true} error={false} artist={undefined} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      ) : artists.items.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: artists.items.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {artists.items.map((artist) => (
                <CarouselItem
                  key={artist.id}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <ArtistCard loading={false} error={false} artist={artist} />
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
