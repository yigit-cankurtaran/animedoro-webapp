import { useState, useCallback, useMemo } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { successToast, errorToast } from "@/things/Toast";
import { useForm, SubmitHandler } from "react-hook-form";
import MyTimer from "@/things/MyTimer";

type FormInputs = {
  time: number;
};

export default function Timer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(20 * 60);
  const [key, setKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const handleStart = useCallback(() => {
    if (isPlaying) {
      errorToast("Already playing");
      return;
    }
    setIsPlaying(true);
    setKey((prevKey) => prevKey + 1);
    successToast("Start");
  }, [key, isPlaying]);

  const handleStop = useCallback(() => {
    if (!isPlaying) {
      errorToast("Not playing");
      return;
    }
    setIsPlaying(false);
    setKey((prevKey) => prevKey + 1);
    successToast("Stop");
    return { shouldRepeat: false, delay: 1 };
  }, [key, isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setKey((prevKey) => prevKey + 1);
    console.log("key: ", key);
    successToast("Reset");
    handleStart();
  }, [key, handleStart]);

  const timerProps = useMemo(
    () => ({
      key: key,
      isPlaying: isPlaying,
      duration: time,
      strokeWidth: 16,
    }),
    [key, isPlaying, time]
  );

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setTime(data.time * 60);
    successToast(`Time set to ${data.time} minutes`);
    // minutes to seconds
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
          handleReset={handleReset}
          handleStart={handleStart}
          handleStop={handleStop}
          key={key}
          isPlaying={isPlaying}
          duration={time}
        />
      </div>
    </div>
  );
}

// TODO: implement a break timer as well
