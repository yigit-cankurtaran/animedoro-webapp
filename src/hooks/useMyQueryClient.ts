import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";


export function useMyQueryClient() {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return queryClient;
}