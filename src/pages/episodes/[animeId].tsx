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
    const fetchEpisodes = async () => {
      if (typeof window !== "undefined" && animeId) {
        // checking this only runs in the browser
        // and if there's an animeId
        // the 2nd check might be redundant because we click anime to get here
        let allEpisodes: Episode[] = [];
        // this is an array of Episodes
        // empty, we will fill it with all the episodes
        let page = 1;
        let morePagesAvailable = true;

        setIsLoading(true);

        while (morePagesAvailable) {
          // while there are more pages available
          try {
            const response = await fetch(
              `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`
            );
            if (!response.ok) throw new Error("Failed to fetch");
            // get the data
            // error handle if it's not ok

            const { data, pagination } = await response.json();
            // parse the data and pagination from the response
            // data will hold the actual data we get
            // pagination will hold the pagination data
            allEpisodes = allEpisodes.concat(data);
            // the data we get is an array of episodes
            // we add that to the allEpisodes array
            // concat combines the data we get with the existing data

            morePagesAvailable = pagination.has_next_page;
            // pagination has a has_next_page boolean
            // if there is a next page, it will be true
            // if there is no next page, it will be false
            // if it's false the loop will stop

            page++;
            // we go to the next page
          } catch (error) {
            console.error("Error fetching data: ", error);
            morePagesAvailable = false;
            // stopping the loop in case of an error
          }
        }
        setData({ data: allEpisodes });
        setIsLoading(false);
      }
    };

    fetchEpisodes();
    // TODO: this works but we sometimes get a 429 error
    // rate limit, look into this later on, maybe add a delay
    // we get 3 requests per second, 60 requests per minute
  }, [animeId]);

  return isLoading ? (
    <p>Loading...</p>
  ) : (
    // TODO: change above with the loading spinner later on
    (data?.data?.length ?? 0) > 0 && (
      // optional chaining
      // in case of a null or undefined value, it will return undefined
      // the parentheses means that if the left side is undefined, it will return the right side
      // setting the default value to 0
      // this line checks if data.data is not null or undefined and if it has a length greater than 0
      <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
        {/* 4 column grid */}
        {/* make sure that it has less or more depending on screen size */}
        {data?.data.map((episode: Episode) => (
          // mapping through the episodes
          // if data or data.data is null or undefined, it will not run
          <div
            key={episode.mal_id}
            className="flex text-balance text-center flex-col justify-center items-center m-10 bg-slate-900 p-5 rounded-3xl"
          >
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
