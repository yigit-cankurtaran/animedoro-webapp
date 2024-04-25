// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function AnimeId() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const [episodes, setEpisodes] = useState([]);
  const [data, setData] = useState({} as any);
  // there's a filler boolean tag so we can add a switch for it
  const { animeId } = router.query;
  // fetch episodes from the API
  useEffect(() => {
    if (typeof window !== "undefined" && animeId) {
      fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch");
        })
        .then((data) => {
          console.log(data);
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
    data?.data?.length > 0 && (
      <div className="bg-slate-500 text-white min-h-full w-full h-full">
        {data.data.map((episode: any) => (
          <div
            key={episode.mal_id}
            className="flex text-balance text-center flex-col justify-center items-center m-10 bg-slate-800 p-5 rounded-3xl"
          >
            {/* might need episode order too */}
            <p>{episode.title}</p>
            <p>{episode.aired}</p>
            <p>{episode.filler ? "Filler" : "Not Filler"}</p>
            <p>{episode.recap ? "Recap" : "Not Recap"}</p>
            {/* we can use this to display stuff for longer anime */}
            <p>{episode.synopsis}</p>
            {/* there is no synopsis or an episode specific picture. hmmm */}
          </div>
        ))}
      </div>
    )
  );
}
