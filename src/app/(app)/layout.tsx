import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#fce598] text-sm font-semibold text-gray-700">
          Opening Project Freedom…
        </div>
      }
    >
      <AuthenticatedApp>{children}</AuthenticatedApp>
    </Suspense>
  );
}

async function AuthenticatedApp({ children }: AppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#fce598] text-gray-800">
      <Sidebar username={user.username} />
      <main className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}