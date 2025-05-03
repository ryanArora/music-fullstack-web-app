"use client";

import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/app/_components/ui/alert";

export default function ScrapePage() {
  const [artistQuery, setArtistQuery] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const scrapeArtist = api.scrape.scrapeArtist.useMutation({
    onSuccess: (data) => {
      setResult({
        success: data.success,
        message: data.message,
      });
      setIsComplete(true);
    },
    onError: (error) => {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
      setIsComplete(true);
    },
  });

  const handleScrape = () => {
    if (!artistQuery.trim()) return;

    setIsComplete(false);
    setResult(null);
    scrapeArtist.mutate({ artistName: artistQuery });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Scrape Artist</h1>
      <p className="mb-4 text-muted-foreground">
        Enter the name of an artist to scrape their music from YouTube.
      </p>
      <div className="mb-6 flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter artist name"
          value={artistQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setArtistQuery(e.target.value)
          }
          disabled={scrapeArtist.isPending}
        />
        <Button
          type="button"
          onClick={handleScrape}
          disabled={scrapeArtist.isPending || !artistQuery.trim()}
        >
          {scrapeArtist.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            "Scrape"
          )}
        </Button>
      </div>

      {scrapeArtist.isPending && (
        <Alert className="mt-4">
          <AlertTitle>Scraping in Progress</AlertTitle>
          <AlertDescription>
            Please wait while we scrape data for {artistQuery}...
          </AlertDescription>
        </Alert>
      )}

      {isComplete && result && (
        <Alert className={`mt-4 ${result.success ? "" : "border-destructive"}`}>
          <AlertTitle>
            {result.success ? "Scraping Complete" : "Scraping Failed"}
          </AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
