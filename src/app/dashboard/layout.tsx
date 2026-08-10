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
        {children}
        <FloatingActionButton />
      </ToastProvider>
    </ErrorBoundary>
  );
}
