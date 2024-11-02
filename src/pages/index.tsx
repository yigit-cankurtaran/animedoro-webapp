import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <Link href="/search" className="text-blue-400">
        Search
      </Link>
      <Link href="/timer" className="text-blue-400">
        Timer
      </Link>
      <Link href="/watchlist" className="text-blue-400">
        Watchlist
      </Link>
      <Link href="/finishlist" className="text-blue-400">
        Finished
      </Link>
    </div>
  );
}
