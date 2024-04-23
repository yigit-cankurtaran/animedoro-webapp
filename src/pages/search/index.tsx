import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Search() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");

    fetch(`https://api.jikan.moe/v4/anime?q=${animeName}`)
      // this might not be the best way to do this
      // i remember that the Jikan API has a search endpoint
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
        setData({});
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="h-full w-full bg-slate-500 text-white">
      <div className="flex flex-col justify-center items-center mb-3">
        <Link
          className="text-blue-300 font-extrabold text-xl"
          href="/"
          // this isn't centering properly
          // might use an actual header later on
        >
          Home
        </Link>
      </div>
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
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          data && (
            <div>
              {data.data.map((anime: any) => (
                // this maps out every anime in the data
                // maybe display the search results in a bento box?
                <div
                  key={anime.mal_id}
                  // we might be able to use this to link to the anime page
                  className="flex text-balance text-justify flex-col justify-center items-center m-10 bg-slate-800 p-5 rounded-3xl"
                >
                  <h3 className="text-bold text-2xl m-1">
                    {anime.title_english}
                  </h3>
                  <p className="m-1">{anime.title_japanese}</p>
                  <p className="m-1 text-center">{anime.synopsis}</p>
                  <Image
                    src={anime.images.jpg.image_url}
                    alt={anime.title_english}
                    width={200}
                    height={300}
                    className="m-1"
                  />
                  {/* might consider making the image next to the synopsis */}
                </div>
              ))}
            </div>
          )
        )}
      </form>
    </div>
  );
}
