import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Song } from "~/server/api/routers/song";
import { type Album } from "~/server/api/routers/album";
import { type Playlist } from "~/server/api/routers/playlist";

// Define repeat mode enum
export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  // Current state
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  progress: number;
  duration: number;

  // Queue management
  queue: Song[];
  queueIndex: number;
  originalQueue: Song[]; // Original queue order for shuffle functionality

  // Player settings
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;

  // Audio element reference
  audioElement: HTMLAudioElement | null;

  // Methods
  playSong: (song: Song, songs?: Song[]) => void;
  playAlbum: (album: Album) => void;
  playPlaylist: (playlist: Playlist) => void;
  togglePlayPause: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  nextSong: () => void;
  previousSong: () => void;

  // Queue management methods
  clearQueue: () => void;
  playNext: (song: Song) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  jumpToQueueItem: (index: number) => void;

  // Player settings methods
  toggleShuffle: () => void;
  toggleRepeatMode: () => void;

  // Initialize audio element
  initAudio: () => void;
}

// Read initial volume from localStorage if available, otherwise use default
const getInitialVolume = (): number => {
  if (typeof window === "undefined") return 0.8;

  try {
    const storedValue = localStorage.getItem("player-volume");
    if (storedValue) {
      const volume = parseFloat(storedValue);
      return isNaN(volume) ? 0.8 : Math.max(0, Math.min(1, volume));
    }
  } catch (error) {
    console.error("Error reading volume from localStorage:", error);
  }

  return 0.8;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => {
      // Helper function to play the song at the current queue index
      const playCurrentQueueItem = async () => {
        const { audioElement, queue, queueIndex, isPlaying } = get();

        if (
          !audioElement ||
          queue.length === 0 ||
          queueIndex < 0 ||
          queueIndex >= queue.length
        ) {
          return;
        }

        const song = queue[queueIndex];
        if (!song) return;

        set({ currentSong: song, progress: 0 });

        // Update audio source
        audioElement.src = song.url;
        audioElement.load();

        // Play if needed
        if (isPlaying) {
          try {
            await audioElement.play();
          } catch (err) {
            console.error("Failed to play audio:", err);
            set({ isPlaying: false });
          }
        }
      };

      // Handle the "ended" event
      const handleEnded = () => {
        const { repeatMode } = get();

        if (repeatMode === "one") {
          // For repeat one, reset the current song and directly play it again
          const audio = get().audioElement;
          if (audio) {
            // Reset to the beginning
            audio.currentTime = 0;
            set({ progress: 0 });

            // Ensure it plays again (more reliable than toggle)
            void audio.play().catch((err) => {
              console.error("Failed to replay audio in repeat one mode:", err);
              set({ isPlaying: false });
            });
          }
        } else {
          // For repeat all or off, go to next song
          get().nextSong();
        }
      };

      return {
        // Initial state
        currentSong: null,
        isPlaying: false,
        volume: getInitialVolume(),
        muted: false,
        progress: 0,
        duration: 0,
        queue: [],
        queueIndex: -1,
        originalQueue: [],
        repeatMode: "off",
        shuffleEnabled: false,
        audioElement: null,

        // Initialize audio element
        initAudio: () => {
          if (typeof window === "undefined") return;

          // Create audio element if it doesn't exist
          if (!get().audioElement) {
            const audio = new Audio();

            // Set up event listeners
            audio.addEventListener("ended", handleEnded);

            audio.addEventListener("loadedmetadata", () => {
              set({ duration: audio.duration });
            });

            audio.addEventListener("timeupdate", () => {
              set({ progress: audio.currentTime });
            });

            // Set the audio volume from the store's persisted volume
            const { volume, muted } = get();
            audio.volume = volume;
            audio.muted = muted;

            set({ audioElement: audio });
          }
        },

        // Play a specific song, optionally with a queue
        playSong: (song, songs = []) => {
          const newQueue = songs.length > 0 ? [...songs] : [song];
          const newIndex =
            songs.length > 0
              ? newQueue.findIndex((s) => s?.id === song?.id)
              : 0;

          set({
            queue: newQueue,
            originalQueue: [...newQueue], // Store original queue for shuffle toggling
            queueIndex: newIndex,
            isPlaying: true,
          });

          // Play the song
          setTimeout(() => {
            void playCurrentQueueItem();
          }, 0);
        },

        // Play all songs from an album
        playAlbum: (album) => {
          if (album.songs.length === 0) return;

          const firstSong = album.songs[0]!;
          get().playSong(
            {
              ...firstSong,
              album: album,
              artist: album.artist,
            },
            album.songs.map((song) => ({
              ...song,
              album: album,
              artist: album.artist,
            })),
          );
        },

        // Play all songs from a playlist
        playPlaylist: (playlist) => {
          if (playlist.songs.length === 0) return;

          // Extract the song objects from the playlist songs array
          const songs = playlist.songs.map((item) => item.song);
          const firstSong = songs[0];
          if (firstSong) {
            get().playSong(firstSong, songs);
          }
        },

        // Toggle play/pause
        togglePlayPause: async () => {
          const { audioElement, isPlaying } = get();

          if (!audioElement) return;

          if (!isPlaying) {
            try {
              await audioElement.play();
              set({ isPlaying: true });
            } catch (err) {
              console.error("Failed to play audio:", err);
            }
          } else {
            audioElement.pause();
            set({ isPlaying: false });
          }
        },

        // Set volume (0-1)
        setVolume: (newVolume) => {
          const { audioElement, muted } = get();
          if (audioElement) {
            audioElement.volume = newVolume;

            // If setting volume while muted, unmute
            if (muted && newVolume > 0) {
              audioElement.muted = false;
              set({ muted: false });
            }
          }

          // Save to localStorage directly in addition to the persist middleware
          try {
            localStorage.setItem("player-volume", newVolume.toString());
          } catch (error) {
            console.error("Error saving volume to localStorage:", error);
          }

          set({ volume: newVolume });
        },

        // Toggle mute
        toggleMute: () => {
          const { audioElement, muted } = get();

          if (audioElement) {
            // Update the audio element's muted property
            audioElement.muted = !muted;
          }

          set({ muted: !muted });
        },

        // Set progress (in seconds)
        setProgress: (newProgress) => {
          const { audioElement } = get();
          if (!audioElement) return;

          // Ensure the progress is within valid bounds
          const validProgress = Math.max(
            0,
            Math.min(newProgress, audioElement.duration || 0),
          );

          // Update audio position
          try {
            audioElement.currentTime = validProgress;
            set({ progress: validProgress });
          } catch (error) {
            console.error("Error setting audio position:", error);
          }
        },

        // Play next song
        nextSong: () => {
          const { queue, queueIndex, repeatMode } = get();

          if (queue.length === 0 || queueIndex === -1) return;

          let nextIndex = queueIndex + 1;

          // Handle repeat mode
          if (nextIndex >= queue.length) {
            if (repeatMode === "off") {
              // If repeat is off and we're at the end, stop playing
              if (nextIndex >= queue.length) {
                set({ isPlaying: false });
                return;
              }
            } else if (repeatMode === "all") {
              // Loop back to the beginning
              nextIndex = 0;
            }
          }

          set({ queueIndex: nextIndex });
          void playCurrentQueueItem();
        },

        // Play previous song
        previousSong: () => {
          const { queue, queueIndex, progress } = get();

          if (queue.length === 0 || queueIndex === -1) return;

          // If we're more than 3 seconds into the song, restart it instead of going to previous
          if (progress > 3) {
            get().setProgress(0);
            return;
          }

          const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
          set({ queueIndex: prevIndex });
          void playCurrentQueueItem();
        },

        // Clear the queue
        clearQueue: () => {
          const { audioElement, isPlaying } = get();

          if (audioElement && isPlaying) {
            audioElement.pause();
          }

          set({
            queue: [],
            originalQueue: [],
            queueIndex: -1,
            currentSong: null,
            isPlaying: false,
            progress: 0,
            duration: 0,
          });
        },

        // Add a song to the top of the queue
        playNext: (song) => {
          const { queue } = get();

          // If queue is empty, play the song immediately
          if (queue.length === 0) {
            set({
              queue: [song],
              originalQueue: [song],
              queueIndex: 0,
              currentSong: song,
              isPlaying: true,
            });
            void playCurrentQueueItem();
          } else {
            // Otherwise, prepend to the beginning of the queue
            set((state) => {
              // Insert after the current song
              const newQueue = [...state.queue];
              const newOriginalQueue = [...state.originalQueue];

              newQueue.splice(state.queueIndex + 1, 0, song);
              newOriginalQueue.push(song); // Add to original queue

              return {
                queue: newQueue,
                originalQueue: newOriginalQueue,
              };
            });
          }
        },

        // Add a song to the queue
        addToQueue: (song) => {
          set((state) => {
            const newQueue = [...state.queue, song];
            const newOriginalQueue = [...state.originalQueue, song];

            return {
              queue: newQueue,
              originalQueue: newOriginalQueue,
              // If this is the first song, set it as current
              queueIndex: state.queueIndex === -1 ? 0 : state.queueIndex,
            };
          });

          // If this is the first song, play it
          if (get().queueIndex === 0 && get().queue.length === 1) {
            void playCurrentQueueItem();
          }
        },

        // Remove a song from the queue
        removeFromQueue: (index) => {
          set((state) => {
            // Don't remove if it's the only song or invalid index
            if (
              state.queue.length <= 1 ||
              index < 0 ||
              index >= state.queue.length
            ) {
              return state;
            }

            const newQueue = [...state.queue];
            const songToRemove = state.queue[index];

            // Add null check for songToRemove
            if (!songToRemove) return state;

            newQueue.splice(index, 1);

            const newOriginalQueue = [...state.originalQueue];
            // Find the corresponding song in the original queue
            const originalIndex = newOriginalQueue.findIndex(
              (s) => s?.id === songToRemove.id,
            );
            if (originalIndex !== -1) {
              newOriginalQueue.splice(originalIndex, 1);
            }

            // Adjust queue index if needed
            let newQueueIndex = state.queueIndex;
            if (index === state.queueIndex) {
              // We're removing the current song, play the next one
              // (index is already the position of the next song after removal)
              newQueueIndex = index < newQueue.length ? index : 0;
              // Play the new current song
              setTimeout(() => void playCurrentQueueItem(), 0);
            } else if (index < state.queueIndex) {
              // We're removing a song before the current one, adjust index
              newQueueIndex--;
            }

            return {
              queue: newQueue,
              originalQueue: newOriginalQueue,
              queueIndex: newQueueIndex,
            };
          });
        },

        // Jump to a specific item in the queue
        jumpToQueueItem: (index) => {
          const { queue } = get();

          if (index < 0 || index >= queue.length) return;

          set({ queueIndex: index });
          void playCurrentQueueItem();
        },

        // Toggle shuffle mode
        toggleShuffle: () => {
          const {
            shuffleEnabled,
            queue,
            originalQueue,
            queueIndex,
            currentSong,
          } = get();

          if (shuffleEnabled) {
            // Disable shuffle - restore original queue order
            if (currentSong) {
              const currentSongId = currentSong.id;
              const newIndex = originalQueue.findIndex(
                (song) => song?.id === currentSongId,
              );
              set({
                queue: [...originalQueue],
                shuffleEnabled: false,
                queueIndex: newIndex !== -1 ? newIndex : 0,
              });
            } else {
              set({
                queue: [...originalQueue],
                shuffleEnabled: false,
                queueIndex: 0,
              });
            }
          } else {
            // Enable shuffle - randomize queue except current song
            const currentSongId = currentSong?.id;

            // Create a copy of the queue without the current song
            const remainingSongs = [...queue];
            if (
              currentSongId &&
              queueIndex !== -1 &&
              queueIndex < queue.length
            ) {
              remainingSongs.splice(queueIndex, 1);
            }

            // Shuffle the remaining songs
            for (let i = remainingSongs.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              // Add type safety checks for array access
              const itemI = remainingSongs[i];
              const itemJ = remainingSongs[j];

              if (itemI !== undefined && itemJ !== undefined) {
                remainingSongs[i] = itemJ;
                remainingSongs[j] = itemI;
              }
            }

            // Reconstruct the queue with current song at the beginning
            let shuffledQueue: Song[] = [];
            if (
              currentSongId &&
              queueIndex !== -1 &&
              queueIndex < queue.length
            ) {
              const currentQueueSong = queue[queueIndex];
              if (currentQueueSong) {
                // Filter out any undefined values from remainingSongs
                const filteredRemainingSongs = remainingSongs.filter(
                  (song): song is Song => song !== undefined,
                );
                shuffledQueue = [currentQueueSong, ...filteredRemainingSongs];
              } else {
                // Filter out any undefined values from remainingSongs
                shuffledQueue = remainingSongs.filter(
                  (song): song is Song => song !== undefined,
                );
              }
            } else {
              // Filter out any undefined values from remainingSongs
              shuffledQueue = remainingSongs.filter(
                (song): song is Song => song !== undefined,
              );
            }

            set({
              queue: shuffledQueue,
              shuffleEnabled: true,
              queueIndex: currentSongId ? 0 : -1,
            });
          }
        },

        // Toggle repeat mode (off -> all -> one -> off)
        toggleRepeatMode: () => {
          const { repeatMode } = get();

          if (repeatMode === "off") {
            set({ repeatMode: "all" });
          } else if (repeatMode === "all") {
            set({ repeatMode: "one" });
          } else {
            set({ repeatMode: "off" });
          }
        },
      };
    },
    {
      name: "music-player-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist specific state values
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        repeatMode: state.repeatMode,
        shuffleEnabled: state.shuffleEnabled,
      }),
    },
  ),
);
