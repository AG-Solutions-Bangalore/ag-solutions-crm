import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({ className }) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative h-9 w-9 rounded-lg border border-border/80 bg-background/80 hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${className || ""}`}
          title="Toggle Theme"
        >
          <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8.5rem] rounded-lg shadow-lg border border-border/80 bg-popover/95 backdrop-blur-md">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2.5 cursor-pointer rounded-md text-sm font-medium py-2 ${theme === "light" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2.5 cursor-pointer rounded-md text-sm font-medium py-2 ${theme === "dark" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
        >
          <Moon className="h-4 w-4 text-sky-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2.5 cursor-pointer rounded-md text-sm font-medium py-2 ${theme === "system" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
        >
          <Laptop className="h-4 w-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
