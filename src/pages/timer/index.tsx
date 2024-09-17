import { useState, useCallback, useMemo} from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { successToast, errorToast } from "@/things/Toast";
import { useForm, SubmitHandler } from "react-hook-form";

type FormInputs = {
    time: number;
}


export default function Timer() {

    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(20 * 60);
    const [key, setKey] = useState(0);

    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

    const formatTime = useCallback((remainingTime: number) => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleStart = useCallback(() => {
        if (isPlaying) {
            errorToast("Already playing");
            return;
        }
        setIsPlaying(true);
        setKey(prevKey => prevKey + 1);
        successToast("Start");
    }, [key, isPlaying]);

    const handleStop = useCallback(() => {
        if (!isPlaying) {
            errorToast("Not playing");
            return;
        }
        setIsPlaying(false);
        setKey(prevKey => prevKey + 1);
        successToast("Stop");
        return { shouldRepeat: false, delay: 1 };
    }, [key, isPlaying]);

    const handleReset = useCallback(() => {
        setIsPlaying(false);
        setKey(prevKey => prevKey + 1);
        console.log("key: ", key);
        successToast("Reset");
        handleStart();
    }, [key, handleStart]);

    const timerProps = useMemo(() => ({
        key: key,
        isPlaying: isPlaying,
        duration: time,
        strokeWidth: 16,
    }), [key, isPlaying, time]);

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        setTime(data.time * 60);
        successToast(`Time set to ${data.time} minutes`);
        // minutes to seconds
    }

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
                <CountdownCircleTimer
                    {...timerProps}
                    strokeLinecap="butt"
                    colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                    colorsTime={[10, 5, 2, 0]}
                    onComplete={handleStop}
                >
                    {({ remainingTime }) => (
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold">{formatTime(remainingTime)}</p>
                        </div>
                    )}
                </CountdownCircleTimer>
            </div>

            <div className="flex flex-col gap-4 items-center">
                <button className="bg-blue-500 text-white p-2 rounded-md w-40" onClick={handleStart}>
                    Start
                </button>
                <button className="bg-red-500 text-white p-2 rounded-md w-40" onClick={handleStop}>
                    Stop
                </button>
                <button className="bg-yellow-500 text-white p-2 rounded-md w-40" onClick={handleReset}>
                    Reset
                </button>
            </div>
        </div>
    );
}