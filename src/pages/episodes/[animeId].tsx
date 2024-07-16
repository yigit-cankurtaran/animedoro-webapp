// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Episode from "@/constants/Episode";
import { ClipLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";

interface Data {
  data: Episode[];
}

async function fetchEpisodes(animeId: string | string[], page: number) {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`
  );
  // getting the episodes from the api
  if (!response.ok) throw new Error("Failed to fetch");
  const { data, pagination } = await response.json();
  // data and pagination are the two things we need
  // data is the episodes
  // pagination is the page number
  return { data, pagination };
}

export default function AnimeId() {
  const router = useRouter();
  const { animeId } = router.query;

  const { data, isLoading, isError, error } = useQuery({
    // the key we are using to cache the data
    queryKey: ["episodes", animeId],
    // the function that will be called to fetch the data
    queryFn: () => fetchEpisodes(animeId as string, 1),
  });

  if (isLoading)
    return <ClipLoader color="#ffffff" loading={isLoading} size={150} />;
  if (isError)
    return (
      <span>
        Error: {error instanceof Error ? error.message : "An error occured"}
      </span>
    );

  return (
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
          <p>{episode.filler ? "Filler" : ""}</p>
          <p>{episode.recap ? "Recap" : ""}</p>
          {/* displaying filler or recap status. if it's not it's just empty */}
          <p>{episode.synopsis}</p>
          {/* there is no synopsis or an episode specific picture. hmmm */}
          {/* look into this */}
          <p>{episode.mal_id}</p>
          {/* which episode it is */}
        </div>
      ))}
    </div>
  );
}

function removeTandAfter(date: string) {
  return date.split("T")[0];
}
