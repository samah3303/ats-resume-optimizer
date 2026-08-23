import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import Link from "next/link";

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="bg-[#09090B] min-h-screen text-[#FAFAFA] flex flex-col">
          <header className="border-b border-[#27272A] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">??</span>
              <span className="font-bold text-lg tracking-tight">Enterprise Talent OS</span>
            </div>
            <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              Exit to Homepage
            </Link>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
