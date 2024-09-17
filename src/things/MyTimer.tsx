import { useState, useCallback } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { TimerButtons } from "@/things/TimerButtons";

interface Props {
  handleStart: () => void;
  handleStop: () => void;
  handleReset: () => void;
  isPlaying: boolean;
  key: number;
  duration: number;
}

const MyTimer = ({
  handleStart,
  handleStop,
  handleReset,
  isPlaying,
  key,
  duration,
}: Props) => {
  const [timerKey, setTimerKey] = useState(key);
  const [timer, setTimer] = useState(duration);
  const [keyChange, setKeyChange] = useState(false);
  const [isActive, setIsActive] = useState(isPlaying);

  const formatTime = useCallback((remainingTime: number) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleTimerComplete = () => {
    setTimerKey(key);
    setIsActive(false);
  };

  const handleStartTimer = () => {
    setIsActive(true);
  };

  const handleStopTimer = () => {
    setIsActive(false);
  };

  const handleResetTimer = () => {
    setTimer(duration);
    setKeyChange(!keyChange);
  };

  return (
    <div>
      <CountdownCircleTimer
        isPlaying={isActive}
        duration={timer}
        size={200}
        colors={["#004777", "#F7B825", "#A30000"]}
        colorsTime={[10, 5, 2]}
        strokeWidth={10}
        onComplete={handleTimerComplete}
        key={timerKey}
      >
        {({ remainingTime }) => (
          <div className="flex flex-col justify-center items-center">
            <p className="text-4xl font-bold">{formatTime(remainingTime)}</p>
          </div>
        )}
      </CountdownCircleTimer>
      <TimerButtons
        handleStart={handleStartTimer}
        handleStop={handleStopTimer}
        handleReset={handleResetTimer}
      />
    </div>
  );
};

export default MyTimer;
