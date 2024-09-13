import { useRouter } from "next/router";
import Episode from "@/constants/Episode";
import { ClipLoader } from "react-spinners";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function loadWatchedEpisodes(animeId: string) {
  if (typeof window !== "undefined") {
    const storedWatchedEpisodes = localStorage.getItem(
      `watchedEpisodes_${animeId}`
    );
    return storedWatchedEpisodes ? JSON.parse(storedWatchedEpisodes) : {};
  }
  return {};
}

function saveWatchedEpisodes(
  animeId: string,
  watchedEpisodes: { [key: number]: boolean }
) {
  localStorage.setItem(
    `watchedEpisodes_${animeId}`,
    JSON.stringify(watchedEpisodes)
  );
}

// Fetch episodes from the API
async function fetchEpisodes(animeId: string, page: number) {
  // async bc we're fetching data from an API
  // animeId we get from the router
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

  const [watchedEpisodes, setWatchedEpisodes] = useState<{
    [key: number]: boolean;
  }>({});
  // we create a dictionary of ep number and watched true or false
  const [isWatchedEpisodesLoaded, setIsWatchedEpisodesLoaded] = useState(false);

  // load watched eps on component mount
  useEffect(() => {
    if (animeId) {
      const storeWatchedEpisodes = loadWatchedEpisodes(animeId as string);
      setWatchedEpisodes(storeWatchedEpisodes);
      setIsWatchedEpisodesLoaded(true);
    }
  }, [animeId]);

  function handleWatchedToggle(episodeId: number) {
    if (watchedEpisodes[episodeId]) {
      // if episode is already watched, mark it as unwatched
      setWatchedEpisodes((prevWatchedEpisodes) => ({
        ...prevWatchedEpisodes,
        [episodeId]: false,
      }));
      saveWatchedEpisodes(animeId as string, {
        ...watchedEpisodes,
        [episodeId]: false,
      });
      return;
    }

    // the function for toggling the watched status of an episode
    if (episodeId > 1 && !watchedEpisodes[episodeId - 1]) {
      // only prompt if episodeId is greater than 1 and the one before that is not already watched
      if (window.confirm(`Mark all episodes before ${episodeId} as watched?`)) {
        // if user confirms, mark all episodes before episodeId as watched
        const newWatchedEpisodes = {
          ...watchedEpisodes,
        };
        for (let i = episodeId - 1; i >= 1; i--) {
          newWatchedEpisodes[i] = true;
          // mark all episodes before episodeId as watched
        }

        setWatchedEpisodes(newWatchedEpisodes);
        // set new watched episodes
        saveWatchedEpisodes(animeId as string, newWatchedEpisodes);
        // save new watched episodes to localStorage
        console.log("Marked all episodes before " + episodeId + " as watched");
      }
    } else {
      // if episode is already watched, mark it as unwatched
      setWatchedEpisodes((prevWatchedEpisodes) => ({
        ...prevWatchedEpisodes,
        [episodeId]: false,
      }));
      saveWatchedEpisodes(animeId as string, {
        ...watchedEpisodes,
        [episodeId]: false,
      });
    }

    // default behavior
    setWatchedEpisodes((prevWatchedEpisodes) => {
      // prevWatchedEpisodes doesnt need to exist, it's just a parameter
      // represents the previous state. we can call it anything
      const newWatchedState = !prevWatchedEpisodes[episodeId];
      // toggle watched status for the selected episode
      // finds the object we used it on, toggles its status
      console.log("this also triggers");
      const updatedWatchedEpisodes = {
        ...prevWatchedEpisodes,
        [episodeId]: newWatchedState,
        // create new object with the updated watch status
      };

      saveWatchedEpisodes(animeId as string, updatedWatchedEpisodes);
      // save updated watch status to localStorage

      console.log("hit the button on episode " + episodeId);

      // return new object to update the state
      return updatedWatchedEpisodes;
      // returning this updates the state
      // we took our old state (prevWatchedEpisodes) and ran some operations on it
      // then updated it with the return
    });
  }

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
    // data is an array of episodes
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
  });

  // useEffect to merge the watched status with fetched episodes
  useEffect(() => {
    if (data) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      // flatten all episode pages into a single array
      allEpisodes.forEach((episode) => {
        episode.watched = watchedEpisodes[episode.mal_id] || false;
        // merge the watched status from storage into the episode objects
        // if episode is in storage with a true value it's watched
        // else it's not watched
      });
    }
  }, [watchedEpisodes, data]);
  // run this whenever watchedEpisodes or data changes
  // watchedEpisodes = update when watched status changes
  // data = update on fetch/refetch

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
            <button
              onClick={() => handleWatchedToggle(episode.mal_id)}
              className={`${
                watchedEpisodes[episode.mal_id]
                  ? "bg-green-500 hover:text-gray-500"
                  : "bg-gray-500 hover:text-blue-300"
              } px-3 py-1 rounded-full mt-2`}
              //  if episode is marked as watched the background is green
            >
              {watchedEpisodes[episode.mal_id] ? "Watched" : "Mark as Watched"}
            </button>
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
