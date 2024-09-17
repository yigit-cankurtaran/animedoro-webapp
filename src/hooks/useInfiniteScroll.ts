import { useEffect } from 'react';

export function useInfiniteScroll(loadMore: () => void, hasMore: boolean, isFetching: boolean) {
  useEffect(() => {
    // Define scroll event handler
    const onScroll = () => {
      // Check if user has scrolled to bottom of page
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1
      ) {
        // If there's more content and not currently fetching, load more
        if (hasMore && !isFetching) {
          loadMore();
        }
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", onScroll);

    // Clean up: remove event listener when component unmounts
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore, hasMore, isFetching]); // Re-run effect if these dependencies change
}