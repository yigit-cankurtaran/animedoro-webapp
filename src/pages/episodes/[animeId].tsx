// name in brackets because it's a dynamic route
// any anime id will be passed to this page
import { useRouter } from "next/router";

export default function AnimeId() {
  const router = useRouter();
  const { animeId } = router.query;
  return (
    <div>
      <h1>animeId: {animeId}</h1>
      {/* successfully gets the ID, next up we'll display the episodes and style it a bit */}
    </div>
  );
}
