import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { errorToast } from "@/things/Toast";
import debounce from 'lodash/debounce';

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
  const fetchAnime = useCallback(async () => {
    if (!searchQuery) return { data: [] };
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}`);
    if (!response.ok) throw new Error("failed to fetch");
    return response.json();
  }, [searchQuery]);

  // Use react-query to manage API call state
  const { isLoading, isError, data, error } = useQuery<Data>({
    queryKey: ["animes", searchQuery],
    queryFn: fetchAnime,
    enabled: !!searchQuery, // Only run the query when searchQuery is not null
  });

  // Debounce the search query
  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );
  

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = useCallback((data) => {
    const animeName = data.animeName.trim();
    if (animeName !== "") {
      setSearchPerformed(true);
      debouncedSetSearchQuery(animeName);
    } else {
      errorToast("Please enter a valid name.");
    }
  }, [debouncedSetSearchQuery]);

  // Memoize anime data
  const animeData = useMemo(() => data?.data || [], [data]);

  return (
    <div className="w-full min-h-screen flex flex-col">
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
        {errors.animeName && <span>{errors.animeName.message}</span>}
        <input
          className="rounded-lg p-2 m-2 text-blue-300 text-center hover:text-blue-500"
          type="submit"
          value="Submit"
        />
      </form>

      <div className="flex-grow p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : isError ? (
          <p className="text-center">Error: {(error as Error).message}</p>
        ) : animeData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animeData.map((anime) => (
              <div key={anime.mal_id} className="flex flex-col justify-center items-center bg-slate-900 p-3 rounded-3xl">
                <Link
                  className="text-bold text-pretty text-start text-2xl text-blue-300 m-1"
                  href={`/episodes/${anime.mal_id}`}
                >
                  {anime.title_english || anime.title_japanese}
                </Link>
                {anime.title_english && (
                  <p className="m-1">{anime.title_japanese}</p>
                )}
                <p className="m-1 text-center">{anime.synopsis}</p>
                <Image
                  src={anime.images.jpg.image_url}
                  alt={anime.title_english || anime.title_japanese}
                  width={200}
                  height={300}
                  style={{ objectFit: "contain" }}
                  className="m-1"
                />
              </div>
            ))}
          </div>
        ) : (
          searchPerformed && animeData.length === 0 && <p className="text-center">No data found.</p>
        )}
      </div>
    </div>
  );
}
