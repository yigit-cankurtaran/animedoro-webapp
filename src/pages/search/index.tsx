import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import {
  useQuery,
  useQueryClient,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";

import Anime from "@/constants/Anime";

interface Data {
  data: Anime[];
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchAnime = async () => {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${searchQuery}`
    );
    if (!response.ok) throw new Error("failed to fetch");
    return response.json();
  };

  const { isLoading, isError, data, error } = useQuery<Data>({
    queryKey: ["animes", searchQuery],
    queryFn: fetchAnime,
    enabled: !!searchQuery,
    // query only runs when searchQuery isn't null
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents refreshing
    // if it leads to any issues just change it

    const formData = new FormData(event.target as HTMLFormElement);
    const animeName = formData.get("animeName");

    if (animeName && animeName.toString().trim() !== "") {
      // if animeName exists and isn't just a bunch of spaces
      setSearchPerformed(true);
      setSearchQuery(animeName.toString().trim());
      // we set our search query in the submit part.
      // when searchquery exists we run the query.
    } else alert("Please enter an anime name.");
    // TODO: change this to a toast message later on
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={onSubmit}
        id="searchform"
      >
        {/* TODO: enhance this with react-hook-form */}
        <label
          className="flex flex-col justify-center items-center"
          htmlFor="searchInput"
        >
          <p className="font-bold">Search anime:</p>
          <input
            type="text"
            name="animeName"
            className="text-black text-pretty p-2 rounded-lg text-center bg-slate-50"
          />
        </label>
        <input
          className="rounded-lg p-2 m-2 text-blue-300 text-center hover:text-blue-500"
          type="submit"
          value="Submit"
        />
        {isLoading ? (
          // this is from the query
          <div>
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : isError ? (
          // this is also from the query
          <p>Error: {error.message}</p>
        ) : (data?.data.length ?? 0) > 0 ? (
          // if data exists and has elements
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
                  {/* if english title exists use it, else use japanese title */}
                </Link>
                {anime.title_english && (
                  <p className="m-1">{anime.title_japanese}</p>
                  // if the english title exists put the japanese title under it
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
