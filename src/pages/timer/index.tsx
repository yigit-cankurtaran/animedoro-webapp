import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useAtom } from "jotai";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { successToast, errorToast } from "@/things/Toast";
import { watchListAtom, finishedListAtom } from "@/atoms/animeAtoms";
import Anime from "@/constants/Anime";
import Link from 'next/link';
import { nextEpisodeAtom, watchedEpisodesAtom, totalEpisodesAtom } from "@/atoms/episodeAtoms";
import { fetchEpisodes } from "@/utils/episodeUtils";

type FormInputs = {
  time: number;
};

const SECONDS_PER_MINUTE = 60;
const DEFAULT_TIME = 40 * SECONDS_PER_MINUTE;

export default function Timer() {
  // Keep track of both the initial duration and the current duration
  const [initialDuration, setInitialDuration] = useState(DEFAULT_TIME);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0); // Add a key state to force re-render of timer
  // we need this for the stop button to work
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);
  const [watchList, setWatchList] = useAtom(watchListAtom);
  const [finishedList, setFinishedList] = useAtom(finishedListAtom);
  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes] = useAtom(totalEpisodesAtom);
  const { register, handleSubmit } = useForm<FormInputs>();

  // lookup table for anime titles
  // This useMemo hook is used to memoize the anime titles based on the watchList state.
  // It reduces the watchList array into an object where the keys are the anime's mal_id and the values are their titles.
  // If the anime has an English title, it uses that; otherwise, it uses the Japanese title or defaults to 'Unknown'.
  const animeTitles = React.useMemo(() => {
    return watchList.reduce((acc, anime: Anime) => {
      // For each anime in the watchList, add an entry to the accumulator object.
      // The key is the anime's mal_id, and the value is its title (English if available, Japanese if not, or 'Unknown' if neither).
      acc[anime.mal_id] = anime.title_english || anime.title_japanese || 'Unknown';
      return acc;
    }, {} as Record<number, string>);
  }, [watchList]);

  const watchEpisode = async (animeId: number, episodeId: number) => {
    // Mark episode as watched
    setWatchedEpisodes(prevEpisodes => {
      // Add the current episode to the watched episodes for this anime
      const updatedEpisodes = [...(prevEpisodes[animeId] || []), episodeId];
      // Return the updated watched episodes object
      return { ...prevEpisodes, [animeId]: updatedEpisodes };
    });
    successToast(`Watched episode ${episodeId} of ${animeTitles[animeId]}`);

    const watchedCount = (watchedEpisodes[animeId] || []).length + 1; // +1 for the episode we just watched

    // Fetch next page if needed
    if (watchedCount % 100 === 0) {
      console.log("Fetching next page of episodes");
      try {
        const nextPage = Math.floor(watchedCount / 100) + 1;
        const { data } = await fetchEpisodes(animeId.toString(), nextPage);
        
        // Update episodeToWatch with new episodes
        setEpisodeToWatch(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            allEpisodes: [...prev[animeId].allEpisodes, ...data.map((ep: { mal_id: number, title: string }) => ({ id: ep.mal_id, title: ep.title }))]
          }
        }));
      } catch (error) {
        console.error("Failed to fetch next page of episodes:", error);
      }
    }

    // Find the next episode using the potentially updated allEpisodes
    const updatedAnimeEpisodes = episodeToWatch[animeId]?.allEpisodes || [];
    const nextEpisode = updatedAnimeEpisodes.find(ep => ep.id > episodeId);

    if (nextEpisode) {
      // Update to the next episode
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId]: { ...prev[animeId], id: nextEpisode.id, title: nextEpisode.title }
      }));
    } else if (episodeId < totalEpisodes[animeId]) {
      // If we don't have information about the next episode, but we know there are more episodes
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId]: { ...prev[animeId], id: episodeId + 1, title: `Episode ${episodeId + 1}` }
      }));
    } else {
      // This was the last episode
      const animeToMove = watchList.find((anime: Anime) => anime.mal_id === animeId);
      if (animeToMove) {
        setFinishedList((prev: Anime[]) => [...prev, animeToMove]);
        setWatchList((prev: Anime[]) => prev.filter((anime: Anime) => anime.mal_id !== animeId));
        setEpisodeToWatch(prev => {
          const newState = { ...prev };
          delete newState[animeId];
          return newState;
        });
      }
    }
  };

  // start the timer
  const handleStart = useCallback(() => {
    if (isPlaying) {
      errorToast("Already playing");
      return;
    }
    setIsPlaying(true);
    successToast("Start");
  }, [isPlaying]);

  // pause the timer
  const handlePause = useCallback(() => {
    if (!isPlaying) {
      errorToast("Not playing");
      return;
    }
    setIsPlaying(false);
    successToast("Pause");
  }, [isPlaying]);

  // stop the timer and reset it
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentDuration(initialDuration); // Reset to initial duration
    setKey(prevKey => prevKey + 1); // Increment key to force re-render
    successToast("Timer stopped and reset");
  }, [initialDuration]);

  // set the timer to a new duration
  // gets the time from the form and converts it to seconds
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const newDuration = data.time * SECONDS_PER_MINUTE;
    setInitialDuration(newDuration);
    setCurrentDuration(newDuration);
    setKey(prevKey => prevKey + 1); // Force re-render when duration changes
    successToast(`Time set to ${data.time} minutes`);
  };

  // format the time to be displayed in the timer
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="number"
          {...register("time")}
          className="text-black text-center text-xl rounded-md w-40"
          placeholder="Minutes"
        />
        <button type="submit" className="bg-blue-500 text-white p-1 rounded-md w-40">
          Set Time
        </button>
      </form>

      <div className="flex flex-col items-center">
        {/* the timer */}
        <CountdownCircleTimer
          key={key} // Use key to force re-render
          isPlaying={isPlaying}
          duration={currentDuration}
          colors={["#004777", "#F7B825", "#A30000"]}
          colorsTime={[10, 5, 2]}
          onComplete={() => {
            setIsPlaying(false);
            return { shouldRepeat: false, delay: 1 };
          }}
        >
          {({ remainingTime }) => (
            <div className="text-4xl font-bold">{formatTime(remainingTime)}</div>
          )}
        </CountdownCircleTimer>

        <div className="flex gap-4 mt-4">
          {/* start the timer */}
          <button onClick={handleStart} className="bg-green-500 text-white p-2 rounded-md">
            Start
          </button>
          <button onClick={handlePause} className="bg-yellow-500 text-white p-2 rounded-md">
            Pause
          </button>
          <button onClick={handleStop} className="bg-red-500 text-white p-2 rounded-md">
            Stop
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* next episode details */}
        <p className="font-bold mb-2">Next Episode:</p>
        <div className="flex flex-col items-center text-center">
          {Object.entries(episodeToWatch).map(([animeId, episodeInfo]) => (
            <div key={animeId}>
              <p>
                <Link href={`/episodes/${animeId}`} className="font-semibold hover:underline text-blue-500">
                  {animeTitles[Number(animeId)] || animeId}
                </Link> 
                <br />
                {episodeInfo.id} - {episodeInfo.title}
                <button className="bg-blue-500 text-white p-1 rounded-md ml-2" onClick={() => watchEpisode(Number(animeId), episodeInfo.id)}>
                  +
                </button>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}