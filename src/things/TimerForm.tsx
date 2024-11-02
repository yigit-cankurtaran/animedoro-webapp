import React from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { successToast, errorToast } from "@/things/Toast";

type FormInputs = {
  time: number;
};

interface TimerFormProps {
  setInitialDuration: (duration: number) => void;
  setCurrentDuration: (duration: number) => void;
  setKey: React.Dispatch<React.SetStateAction<number>>;
}

const SECONDS_PER_MINUTE = 60;

export const TimerForm: React.FC<TimerFormProps> = ({ setInitialDuration, setCurrentDuration, setKey }) => {
  const { register, handleSubmit } = useForm<FormInputs>();

  // set the timer to a new duration
  // gets the time from the form and converts it to seconds
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (data.time > 0) {
      const newDuration = data.time * SECONDS_PER_MINUTE;
      setInitialDuration(newDuration);
      setCurrentDuration(newDuration);
      setKey(prevKey => prevKey + 1); // Force re-render when duration changes
      successToast(`Time set to ${data.time} minutes`);
    } else errorToast("Please enter a valid number");
  };

  return (
    <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="number"
        {...register("time")}
        className="text-black text-center text-align text-xl rounded-md w-40"
        placeholder="Work Minutes"
      />
      <button type="submit" className="bg-blue-500 text-white p-1 rounded-md w-40">
        Set Time
      </button>
    </form>
  );
};
