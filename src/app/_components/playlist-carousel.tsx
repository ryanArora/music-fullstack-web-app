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
import { type RouterOutputs } from "~/trpc/react";

type PlaylistCarouselProps = {
  title: string;
  emptyMessage?: string;
} & {
  playlists:
    | {
        items: NonNullable<RouterOutputs["playlist"]["getById"]>[];
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

export function PlaylistCarousel({
  title,
  playlists,
  emptyMessage = "No playlists found",
}: PlaylistCarouselProps) {
  return (
    <div className="my-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {playlists.error ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : playlists.loading ? (
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
                  <PlaylistCard
                    loading={true}
                    error={false}
                    playlist={undefined}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      ) : playlists.items.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: playlists.items.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {playlists.items.map((playlist) => (
                <CarouselItem
                  key={playlist.id}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <PlaylistCard
                    loading={false}
                    error={false}
                    playlist={playlist}
                  />
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
