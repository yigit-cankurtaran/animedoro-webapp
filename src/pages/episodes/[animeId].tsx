import { useRouter } from "next/router";
import Episode from "@/constants/Episode";
import { ClipLoader } from "react-spinners";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Fetch episodes from the API
async function fetchEpisodes(animeId: string, page: number) {
  // async bc we're fetching data from an API
  // animeID we get from the router
  // page is the page number
  // we use the page number to fetch the next page
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`
  );
  // fetches the episodes from the API
  // stores the response in the response variable
  if (!response.ok) throw new Error("Failed to fetch");
  // if the response is not ok, throw an error
  const result = await response.json();
  // if the response is ok, parse the response as JSON
  // we await the json because it's an async function
  const { data, pagination } = result;
  // we destructure the data and pagination from the result
  console.log(`Fetched page ${page}: `, data);
  console.log("Pagination:", pagination);
  return { data, pagination };
  // we return the data and pagination
  // next time log everything to see what's happening
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
    // runs queryFn with the NextPageParam
    isFetchingNextPage,
    error,
    // variables
    // we can use these outside because
    // react-query handles its own state
  } = useInfiniteQuery<{
    data: Episode[];
    pagination: {
      // the issue was probably with the pagination
      last_visible_page: number;
      has_next_page: boolean;
    };
    // the returns from the fetchEpisodes function
    // we're using the Episode type from the constants folder
  }>({
    queryKey: ["episodes", animeId],
    // serves the key for the query
    // used to id and cache the query
    queryFn: async ({ pageParam = 1 }) => {
      if (animeId) {
        console.log(`Fetching page ${pageParam}`);
        return fetchEpisodes(animeId as string, pageParam as number);
      } else {
        throw new Error("Anime ID is undefined");
      }
      // used to fetch the episodes
      // takes object as an argument, page parameter, default is 1
      // if animeId is defined, fetch the episodes
    },
    getNextPageParam: (lastPage, pages) => {
      // used to define pageParam for the queryFn
      // lastPage is the last page fetched
      // pages is the array of all pages fetched
      // that's how the nextPage works
      const nextPage = pages.length + 1;
      if (lastPage.pagination.has_next_page) {
        // if there's a page after the last page
        return nextPage;
      }
      // if there are no more pages
      return undefined;
    },
    initialPageParam: 1,
    // sets the initial page to 1
    enabled: !!animeId,
    // enables the query only if animeId is defined
  });

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      // if the next page exists and is not being fetched already
      fetchNextPage();
      // fetch the next page
      console.log("Fetching next page...");
    }
  };

  useEffect(() => {
    // useEffect because we're adding an event listener
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1
      ) {
        handleLoadMore();
        // if the user scrolls to the bottom of the page, load more
        console.log("Scrolled to the bottom");
      }
    };
    window.addEventListener("scroll", onScroll);
    // adds an event listener to the window
    return () => window.removeEventListener("scroll", onScroll);
    // removes the event listener when the component is unmounted
  }, [hasNextPage, isFetchingNextPage]);
  // runs the useEffect when hasNextPage or isFetchingNextPage changes
  // hasNextPage is here to prevent fetching the next page when there's no next page

  if (isLoading)
    return (
      <div className="items-center justify-center">
        <ClipLoader color="#ffffff" loading={isLoading} size={150} />;
      </div>
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
        // if data exists, map through the pages
        .flatMap((page) => page.data)
        // flatmap is used to flatten the array and return a new array
        // we use it to flatten the pages array
        // returns the data from every page object
        .map((episode: Episode) => (
          // maps through the episodes after the pages are flattened
          <div
            key={episode.mal_id}
            className="flex text-center flex-col justify-center items-center m-10 bg-slate-900 p-5 rounded-3xl"
          >
            <p>{episode.title}</p>
            <p>{episode.mal_id}</p>
            {/* usual returns */}
            <p>{removeTandAfter(episode.aired)}</p>
            {/* getting only the date instead of the local hours and all */}
            <p>{episode.filler ? "Filler" : ""}</p>
            <p>{episode.recap ? "Recap" : ""}</p>
            {/* if episode is filler or recap, display it. if not don't */}
          </div>
        ))}
      {isFetchingNextPage && (
        <div className="justify-center items-center">
          <ClipLoader color="#ffffff" loading={true} size={150} />
          {/* TODO: center this. this isn't centered for some reason. */}
        </div>
      )}
    </div>
  );
}

function removeTandAfter(date: string) {
  return date.split("T")[0];
}
