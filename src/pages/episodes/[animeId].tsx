import { useRouter } from "next/router";
import Episode from "@/constants/Episode";
import { ClipLoader } from "react-spinners";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Fetch episodes from the API
async function fetchEpisodes(animeId: string, page: number) {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`
  );
  if (!response.ok) throw new Error("Failed to fetch");
  const result = await response.json();
  const { data, pagination } = result;
  console.log(`Fetched page ${page}: `, data);
  console.log("Pagination:", pagination);
  return { data, pagination };
  // i should've logged pagination and checked
  // would've saved me a lot of time
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
      // the issue was probably with the pagination
      last_visible_page: number;
      has_next_page: boolean;
    };
  }>({
    queryKey: ["episodes", animeId],
    queryFn: async ({ pageParam = 1 }) => {
      if (animeId) {
        console.log(`Fetching page ${pageParam}`);
        return fetchEpisodes(animeId as string, pageParam as number);
      } else {
        throw new Error("Anime ID is undefined");
      }
    },
    getNextPageParam: (lastPage, pages) => {
      console.log("lastPage:", lastPage);
      const currentPage = pages.length;
      const hasNextPage = lastPage?.pagination?.has_next_page;
      const nextPage = hasNextPage ? currentPage + 1 : undefined;
      // the undefined here might be an issue later
      console.log(`Current page: ${currentPage}, Next page: ${nextPage}`);
      return nextPage;
    },
    initialPageParam: 1,
    enabled: !!animeId,
  });

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      console.log("Fetching next page...");
    }
  };

  // TODO: understand how this works
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1
      ) {
        handleLoadMore();
        console.log("Scrolled to the bottom");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage]);

  if (isLoading)
    return (
      <div className="items-center justify-center">
        <ClipLoader color="#ffffff" loading={isLoading} size={150} />;
      </div>
      // TODO: This isn't centered, check later
    );
  if (isError)
    return (
      <span>
        Error: {error instanceof Error ? error.message : "An error occurred"}
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
            <p>{episode.mal_id}</p>
            <p>{removeTandAfter(episode.aired)}</p>
            <p>{episode.filler ? "Filler" : ""}</p>
            <p>{episode.recap ? "Recap" : ""}</p>
          </div>
        ))}
      {isFetchingNextPage && (
        <ClipLoader color="#ffffff" loading={true} size={150} />
      )}
    </div>
  );
}

// TODO: too many logs, check if we're doing unnecessary fetches

function removeTandAfter(date: string) {
  return date.split("T")[0];
}
