import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-bold">hello world!</h1>
      <Link href="/synopsis" className="text-blue-500">
        Synopsis
      </Link>
      <Link href="/search" className="text-blue-500">
        Search
      </Link>
      <Link href="/episodes" className="text-blue-500">
        Episodes
      </Link>
    </div>
  );
}
