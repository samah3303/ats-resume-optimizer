import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="bg-[#09090B] min-h-screen text-[#FAFAFA]">
          {children}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
