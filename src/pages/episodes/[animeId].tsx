// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Episode from "@/constants/Episode";

interface Data {
  data: Episode[];
}

export default function AnimeId() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const [episodes, setEpisodes] = useState([]);
  const [data, setData] = useState<Data | null>(null);
  // there's a filler boolean tag so we can add a switch for it
  const { animeId } = router.query;
  // fetch episodes from the API
  useEffect(() => {
    if (typeof window !== "undefined" && animeId) {
      fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`)
        // this only gets the first 100 episodes.
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch");
        })
        .then((data) => {
          console.log(data);
          console.log("the first episode is: ", data.data[0]);
          setData(data);
        })
        .finally(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    }
  }, [animeId]);

  return isLoading ? (
    <p>Loading...</p>
  ) : (
    (data?.data?.length ?? 0) > 0 && (
      // TODO: i don't understand the above line
      <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
        {/* 4 column grid */}
        {/* make sure that it has less or more depending on screen size */}
        {data?.data.map((episode: any) => (
          // why the ? here? check later
          <div
            key={episode.mal_id}
            className="flex text-balance text-center flex-col justify-center items-center m-10 bg-slate-900 p-5 rounded-3xl"
          >
            {/* might need episode order too */}
            <p>{episode.title}</p>
            <p>{removeTandAfter(episode.aired)}</p>
            {/* air date */}
            {/* this has something with T and some numbers, looks bad, we can filter that later on */}
            <p>{episode.filler ? "Filler" : ""}</p>
            <p>{episode.recap ? "Recap" : ""}</p>
            {/* displaying filler or recap status. if it's not it's just this */}
            <p>{episode.synopsis}</p>
            {/* there is no synopsis or an episode specific picture. hmmm */}
            {/* look into this */}
            <p>{episode.mal_id}</p>
            {/* which episode it is */}
          </div>
        ))}
      </div>
    )
  );
}

function removeTandAfter(date: string) {
  return date.split("T")[0];
}
