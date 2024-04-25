// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";
import { useState } from "react";

export default function AnimeId() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [episodes, setEpisodes] = useState([]);
  const [data, setData] = useState({} as any);
  // there's a filler boolean tag so we can add a switch for it
  const { animeId } = router.query;
  // fetch episodes from the API
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

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>animeId: {animeId}</h1>
          {/* successfully gets the ID, next up we'll display the episodes and style it a bit */}
          <p>{JSON.stringify(data)}</p>
        </div>
      )}
    </div>
  );
}
