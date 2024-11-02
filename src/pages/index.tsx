import Link from "next/link";
import { Search, Timer, List, CheckCircle } from "lucide-react";

export default function Home() {
  const navItems = [
    { href: "/search", icon: Search, label: "Search", description: "Find your favorite content" },
    { href: "/timer", icon: Timer, label: "Timer", description: "Track your animedoro sessions" },
    { href: "/watchlist", icon: List, label: "Watchlist", description: "Manage your watch queue" },
    { href: "/finishlist", icon: CheckCircle, label: "Finished", description: "View completed content" }
  ];

  return (
    <div className="w-full max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Welcome to <span className="text-blue-400">Animedoro</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navItems.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group p-6 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-400/10 group-hover:bg-blue-400/20">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {label}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
