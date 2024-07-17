import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import Anime from "@/constants/Anime";

interface Data {
  data: Anime[];
}

// TODO: use react-query instead of fetch

export default function Search() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");

    setIsLoading(true);
    setSearchPerformed(true);

    fetch(`https://api.jikan.moe/v4/anime?q=${animeName}`)
      // search endpoint
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error("Failed to fetch");
      })
      .then((data) => {
        console.log(data);
        console.log("the first anime is: ", data.data[0]);
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setData(null);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={onSubmit}
        id="searchForm"
      >
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
          className="rounded-lg p-2 m-2 text-blue-300 text-center"
          type="submit"
          value="Submit"
        />
        {isLoading ? (
          <div>
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : (data?.data?.length ?? 0) > 0 ? ( // Check if data array has items
          <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
            {data?.data.map((anime: Anime) => (
              <div
                key={anime.mal_id}
                className="flex text-balance text-justify flex-col justify-center items-center m-5 bg-slate-900 p-3 rounded-3xl"
              >
                {/* for the episodes */}
                <Link
                  className="text-bold text-pretty text-start text-2xl text-blue-300 m-1"
                  href={`/episodes/${anime.mal_id}`}
                >
                  {anime.title_english
                    ? anime.title_english
                    : anime.title_japanese}
                </Link>
                {!anime.title_english && (
                  <p className="m-1">{anime.title_japanese}</p>
                )}
                {/* authenticity */}
                <p className="m-1 text-start">{anime.synopsis}</p>
                {/* in case people want to check */}
                {/* this is gonna need some wrapping */}
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
          // if it is empty and search happened display no data found
          searchPerformed &&
          (data?.data?.length ?? 0) === 0 && <p>No data found</p>
        )}
      </form>
    </div>
  );
}
