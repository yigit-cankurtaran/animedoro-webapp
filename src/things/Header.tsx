import Link from "next/link";

export default function Header() {
  return (
    <header className="p-4">
      <Link className="text-blue-400 hover:text-blue-700" href="/">
        ⬅️ Home
      </Link>
    </header>
  );
}
