import { useState, useMemo } from "react";
import { successToast, errorToast } from "@/things/Toast";
import { useForm, SubmitHandler } from "react-hook-form";
import MyTimer from "@/things/MyTimer";
import { useAtom } from "jotai";
import { nextEpisodeAtom } from "@/atoms/episodeAtoms";
import { watchListAtom } from "@/atoms/animeAtoms";
import Anime from "@/constants/Anime";

type FormInputs = {
  time: number;
};

export default function Timer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(20 * 60);
  const [initialTime, setInitialTime] = useState(20 * 60); // Store initial time
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);
  const [watchList] = useAtom(watchListAtom);

  // Create a map of anime IDs to titles
  const animeTitles = useMemo(() => {
    return watchList.reduce((acc, anime: Anime) => {
      acc[anime.mal_id] = anime.title_english || anime.title_japanese || 'Unknown';
      return acc;
    }, {} as Record<number, string>);
  }, [watchList]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  function handleStart() {
    if (isPlaying) {
      errorToast("Already playing");
      return;
    }
    setIsPlaying(true);
    successToast("Start");
  }

  function handleStop() {
    if (!isPlaying) {
      errorToast("Not playing");
      return;
    }
    setIsPlaying(false);
    setTime(initialTime); // Reset timer to initial duration
    successToast("Stop");
  }

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const newTime = data.time * 60;
    setTime(newTime);
    setInitialTime(newTime); // Update initial time
    successToast(`Time set to ${data.time} minutes`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="number"
          {...register("time")}
          className="text-black text-center text-xl rounded-md w-40"
          placeholder="Minutes"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-1 rounded-md w-40"
        >
          Set Time
        </button>
      </form>

      <div className="flex flex-col items-center ">
        <MyTimer
          handleStart={handleStart}
          handleStop={handleStop}
          isPlaying={isPlaying}
          duration={time}
        />
      </div>
      <div className="flex flex-col items-center">
        <p className="font-bold mb-2">Next Episode:</p>
        <div className="flex flex-col items-center text-center">
          
          {Object.entries(episodeToWatch).map(([animeId, episode]) => (
            <p key={animeId}>
              <span className="font-semibold">{animeTitles[Number(animeId)] || animeId}:</span> 
              <br />
              {episode.id} - {episode.title}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}

// TODO: implement a break timer as well
// TODO: add a solution to watch the episode
