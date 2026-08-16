import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="bg-white min-h-screen text-zinc-900">
          {children}
          <FloatingActionButton />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
