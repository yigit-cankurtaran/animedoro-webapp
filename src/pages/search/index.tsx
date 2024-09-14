import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";

import Anime from "@/constants/Anime";

interface Data {
  data: Anime[];
}

// Define the form input type
type FormInputs = {
  animeName: string;
};

export default function Search() {
  // State to store the search query and track if a search has been performed
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  // Function to fetch anime data from the API
  const fetchAnime = async () => {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${searchQuery}`
    );
    if (!response.ok) throw new Error("failed to fetch");
    return response.json();
  };

  // Use react-query to manage API call state
  const { isLoading, isError, data, error } = useQuery<Data>({
    queryKey: ["animes", searchQuery],
    queryFn: fetchAnime,
    enabled: !!searchQuery, // Only run the query when searchQuery is not null
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const animeName = data.animeName.trim();
    if (animeName !== "") {
      setSearchPerformed(true);
      setSearchQuery(animeName);
    } else {
      alert("Please enter an anime name.");
      // TODO: change this to a toast message later on
    }
  };

  return (
    <div className="w-full">
      <form
        className="flex flex-col justify-center items-center"
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
        {errors.animeName && <span>{errors.animeName.message}</span>}
        <input
          className="rounded-lg p-2 m-2 text-blue-300 text-center hover:text-blue-500"
          type="submit"
          value="Submit"
        />
        {isLoading ? (
          <div>
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : isError ? (
          <p>Error: {(error as Error).message}</p>
        ) : (data?.data.length ?? 0) > 0 ? (
          <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
            {data?.data.map((anime: Anime) => (
              <div
                key={anime.mal_id}
                className="flex text-balance text-justify flex-col justify-center items-center m-5 bg-slate-900 p-3 rounded-3xl"
              >
                <Link
                  className="text-bold text-pretty text-start text-2xl text-blue-300 m-1"
                  href={`/episodes/${anime.mal_id}`}
                >
                  {anime.title_english
                    ? anime.title_english
                    : anime.title_japanese}
                </Link>
                {anime.title_english && (
                  <p className="m-1">{anime.title_japanese}</p>
                )}
                <p className="m-1 text-center">{anime.synopsis}</p>
                <Image
                  src={anime.images.jpg.image_url}
                  alt={
                    anime.title_english
                      ? anime.title_english
                      : anime.title_japanese
                  }
                  width={200}
                  height={300}
                  style={{ objectFit: "contain" }}
                  className="m-1"
                />
              </div>
            ))}
          </div>
        ) : (
          searchPerformed &&
          (data?.data.length ?? 0) === 0 && <p>No data found.</p>
        )}
      </form>
    </div>
  );
}
