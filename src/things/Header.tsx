import Link from "next/link";

export default function Header() {
  return (
    <header className="p-4 sticky flex-2 w-fit rounded-2xl top-3 left-1 bg-gray-500 flex z-10 shadow-md">
      <Link className="text-white hover:text-blue-300" href="/">
        ⬅️ Home
      </Link>
    </header>
  );
}
