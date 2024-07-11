import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
// this is kind of a garbage library
import "react-loading-skeleton/dist/skeleton.css";
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
    <div className="w-full bg-slate-500 text-white">
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={onSubmit}
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
        <div>
          {isLoading ? (
            <p>
              <Skeleton containerClassName="flex-1" count={5} />
            </p>
          ) : (
            data?.data?.length ??
            (0 > 0 && (
              // checks if data is not nullu and if there are any results
              <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
                {data?.data.map((anime: any) => (
                  // this maps out every anime in the data
                  <div
                    key={anime.mal_id}
                    className="flex text-balance text-justify flex-col justify-center items-center m-10 bg-slate-800 p-5 rounded-3xl"
                  >
                    <Link
                      className="text-bold text-2xl text-blue-300 m-1"
                      href={`/episodes/${anime.mal_id}`}
                      // we are linking to a specific anime page
                      // dynamic routing
                    >
                      {anime.title_english}
                    </Link>
                    <p className="m-1">{anime.title_japanese}</p>
                    {/* we can use these 2 to link */}
                    <p className="m-1 text-center">{anime.synopsis}</p>
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
            ))
          )}
        </div>
      </form>
    </div>
  );
}

// TODO: the returns of this page changed from the API side
// look into it and fix it.
