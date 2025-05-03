"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/app/_components/ui/alert";
import { ScrollArea } from "~/app/_components/ui/scroll-area";

export default function ScrapePage() {
  const [artistQuery, setArtistQuery] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);

  const progressScrollRef = useRef<HTMLDivElement>(null);

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

  api.scrape.progress.useSubscription(undefined, {
    enabled: scrapeArtist.isPending,
    onData: (data) => {
      setProgressLogs((prev) => [...prev, data]);
    },
  });

  api.scrape.error.useSubscription(undefined, {
    enabled: scrapeArtist.isPending,
    onData: (data) => {
      setProgressLogs((prev) => [...prev, data]);
    },
  });

  const handleScrape = () => {
    if (!artistQuery.trim()) return;

    setIsComplete(false);
    setResult(null);
    setProgressLogs([]);
    scrapeArtist.mutate({ artistName: artistQuery });
  };

  // Handle scrolling for progress logs
  useEffect(() => {
    if (progressLogs.length > 0 && progressScrollRef.current) {
      progressScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [progressLogs]);

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

      {progressLogs.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">Logs</h2>
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="font-mono text-sm">
              {progressLogs.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))}
              <div ref={progressScrollRef} />
            </div>
          </ScrollArea>
        </div>
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
