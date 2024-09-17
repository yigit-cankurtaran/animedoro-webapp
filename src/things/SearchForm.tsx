import { useForm, SubmitHandler } from "react-hook-form";
import { errorToast } from "@/things/Toast";

// Define the structure of form inputs
type FormInputs = {
  animeName: string;
};

// Define the props for the SearchForm component
type SearchFormProps = {
  onSearch: (query: string) => void;
};

export function SearchForm({ onSearch }: SearchFormProps) {
  // Initialize form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  // Define submit handler
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const animeName = data.animeName.trim();
    if (animeName !== "") {
      // Call the onSearch prop function with the anime name
      // when a valid name is entered
      // provided by the parent component (search/index.tsx)
      onSearch(animeName);
    } else {
      // Display an error toast if the input is empty
      errorToast("Please enter a valid name.");
    }
  };

  return (
    // Render the search form
    <form
      className="flex flex-col justify-center items-center p-4"
      onSubmit={handleSubmit(onSubmit)}
      id="searchform"
    >
      <label
        className="flex flex-col justify-center items-center"
        htmlFor="searchInput"
      >
        <p className="font-bold">Search anime:</p>
        <input
          {...register("animeName", { required: "Anime name is required" })}
          type="text"
          className="text-black text-pretty p-2 rounded-lg text-center bg-slate-50"
        />
      </label>
      {/* Display error message if validation fails */}
      {errors.animeName && <span>{errors.animeName.message}</span>}
      <input
        className="rounded-lg p-2 m-2 text-blue-300 text-center hover:text-blue-500"
        type="submit"
        value="Submit"
      />
    </form>
  );
}