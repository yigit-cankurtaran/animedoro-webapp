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
    return <ClipLoader color="#ffffff" loading={isLoading} size={150} />;
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
            {/* this is fixed */}
            {/* TODO: add the rest of the stuff tomorrow */}
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
