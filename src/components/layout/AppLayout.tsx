import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-[280px] pt-16 lg:pt-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
