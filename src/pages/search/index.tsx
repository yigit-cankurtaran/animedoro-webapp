import Image from "next/image";
import Link from "next/link";
import { useState, CSSProperties } from "react";
import { ClipLoader } from "react-spinners";

import Anime from "@/constants/Anime";

interface Data {
  data: Anime[];
}

export default function Search() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");

    setIsLoading(true);

    fetch(`https://api.jikan.moe/v4/anime?q=${animeName}`)
      // search endpoint
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error("Failed to fetch");
      })
      .then((data) => {
        console.log(data);
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
    <div className="w-full text-white">
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
          className="bg-slate-800 rounded-lg p-2 m-2 text-white text-center"
          type="submit"
          value="Submit"
        />
        {isLoading ? (
          // this displays but there's no animation
          <div className="flex justify-center items-center p-10">
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : (data?.data?.length ?? 0) > 0 ? ( // Check if data array has items
          <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
            {data?.data.map((anime: any) => (
              <div
                key={anime.mal_id}
                className="flex text-balance text-justify flex-col justify-center items-center m-10 bg-slate-800 p-5 rounded-3xl"
              >
                {/* for the episodes */}
                <Link
                  className="text-bold text-2xl text-blue-300 m-1"
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
                <p className="m-1 text-center">{anime.synopsis}</p>
                {/* in case people want to check */}
                <Image
                  src={anime.images.jpg.image_url}
                  alt={anime.title_english}
                  width={200}
                  height={300}
                  objectFit="contain"
                  className="m-1"
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No data found</p> // Display this if there are no items
          // this comes up by default but i'll fix it later
          // TODO: add some conditionals to make it look better
        )}
      </form>
    </div>
  );
}
