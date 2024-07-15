import Link from "next/link";
// TODO: make this get all the pages automatically
// get folder names and add a / in front

export default function Home() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      {/* <Link href="/synopsis" className="text-blue-400">
        Synopsis
      </Link> */}
      <Link href="/search" className="text-blue-400">
        Search
      </Link>
      {/* <Link href="/episodes" className="text-blue-500">
        Episodes
      </Link> */}
      <Link href="/settings" className="text-blue-400">
        Settings
      </Link>
    </div>
  );
}
