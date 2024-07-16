// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";
import Episode from "@/constants/Episode";
import { ClipLoader } from "react-spinners";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery<{
    data: Episode[];
    pagination: {
      currentPage: number;
      hasNextPage: boolean;
    };
  }>({
    // the key we are using to cache the data
    queryKey: ["episodes", animeId],
    // the function that will be called to fetch the data
    queryFn: ({ pageParam = 1 }) =>
      animeId
        ? fetchEpisodes(animeId as string, pageParam as number)
        : Promise.reject(new Error("Anime ID is undefined")),
    // the function that will be called to fetch the next page
    // if it exists
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage)
        return lastPage.pagination.currentPage + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!animeId,
    // ensures that the query is only enabled when the animeId is defined
  });

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        handleLoadMore();
        console.log("loading more");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, fetchNextPage]);

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
      {data?.pages
        .flatMap((page) => page.data)
        .map((episode: Episode) => (
          <div
            key={episode.mal_id}
            className="flex text-center flex-col justify-center items-center m-10 bg-slate-900 p-5 rounded-3xl"
          >
            <p>{episode.title}</p>
            {/* Other episode details */}
            <p>{episode.mal_id}</p>
          </div>
        ))}
      {isFetchingNextPage && (
        <ClipLoader color="#ffffff" loading={true} size={150} />
      )}
    </div>
  );
}

function removeTandAfter(date: string) {
  return date.split("T")[0];
}
