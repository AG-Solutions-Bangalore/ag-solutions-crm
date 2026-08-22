import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/new/breadcrumbs";

export default function Page({ children }) {
  const navigate = useNavigate();

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col min-h-screen flex-1 min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-accent rounded-md" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 inline-block"
            />
            <Breadcrumbs onBack={handleBackClick} />
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex flex-col p-4 md:p-6 w-full min-w-0 overflow-x-hidden">
          {children}
        </div>

        <footer className="mt-auto border-t border-border bg-muted/20 px-6 py-2.5 text-xs text-muted-foreground print:hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2025-26 AG Solutions. All Rights Reserved.</span>
            <span className="flex items-center gap-1">
              Crafted with <span className="text-red-500">❤️</span> by AG Solutions
            </span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
