import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <Link href="/search" className="text-blue-400">
        Search
      </Link>
      <Link href="/settings" className="text-blue-400">
        Settings
      </Link>
    </div>
  );
}
