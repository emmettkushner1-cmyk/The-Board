import "../styles/globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "The Board",
  description: "A monthly status leaderboard where money = status."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="text-xl font-semibold">
              The Board
            </Link>
            <nav className="flex gap-4 text-sm text-white/70">
              <Link href="/leaderboard" className="hover:text-white">
                Leaderboard
              </Link>
              <Link href="/hall-of-fame" className="hover:text-white">
                Hall of Fame
              </Link>
              <Link href="/pay" className="hover:text-white">
                Join
              </Link>
              <Link href="/profile" className="hover:text-white">
                Profile
              </Link>
            </nav>
          </header>
          <main className="flex-1 pb-16">{children}</main>
          <footer className="py-8 text-xs text-white/50">
            © {new Date().getUTCFullYear()} The Board. Money = status.
          </footer>
        </div>
      </body>
    </html>
  );
}
