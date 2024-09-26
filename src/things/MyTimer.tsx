import { useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { TimerButtons } from "@/things/TimerButtons";

interface Props {
  handleStart: () => void;
  handlePause: () => void;
  isPlaying: boolean;
  duration: number;
}

const MyTimer = ({
  handleStart,
  handlePause,
  isPlaying,
  duration,
}: Props) => {
  const [timer, setTimer] = useState(duration);
  const [isActive, setIsActive] = useState(isPlaying);

  // Update timer state when duration prop changes
  useEffect(() => {
    setTimer(duration);
  }, [duration]);

  // Update isActive state when isPlaying prop changes
  useEffect(() => {
    setIsActive(isPlaying);
  }, [isPlaying]);

  function formatTime(remainingTime: number) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const handleTimerComplete = () => {
    setIsActive(false);
  };

  const handleStartTimer = () => {
    setIsActive(true);
    handleStart();
  };

  const handlePauseTimer = () => {
    setIsActive(false);
    handlePause();
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
      >
        {({ remainingTime }) => (
          <div className="flex flex-col justify-center items-center">
            <p className="text-4xl font-bold">{formatTime(remainingTime)}</p>
          </div>
        )}
      </CountdownCircleTimer>
      <TimerButtons
        handleStart={handleStartTimer}
        handlePause={handlePauseTimer}
      />
    </div>
  );
};

export default MyTimer;
