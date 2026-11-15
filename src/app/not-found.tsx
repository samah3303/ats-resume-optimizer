import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "404 — Page Not Found | paniund",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nordic-bg text-nordic-text flex flex-col font-sans selection:bg-nordic-secondary selection:text-nordic-text">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-nordic-primary text-white shadow-xs">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Logo theme="on-blue" size="md" href="/" />
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-white hover:text-nordic-secondary transition-colors"
          >
            Go to Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Main 404 Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-nordic-secondary text-nordic-text mx-auto flex items-center justify-center font-bold text-2xl shadow-xs">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-nordic-text">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
              We couldn&apos;t locate the resource you were looking for. It may have been relocated or deleted.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="nordic-btn-outline flex-1 h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
            >
              &larr; Home
            </Link>
            <Link
              href="/dashboard"
              className="nordic-btn-primary flex-1 h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
            >
              Dashboard &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-nordic-border bg-white py-6 text-center text-xs text-nordic-neutral">
        &copy; {new Date().getFullYear()} paniund. Democratic ATS Career Operating System.
      </footer>
    </div>
  );
}
