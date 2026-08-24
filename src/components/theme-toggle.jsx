import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={`h-9 w-9 rounded-lg border border-border bg-card text-foreground shadow-2xs ${className || ""}`}
        disabled
      >
        <Sun className="h-4.5 w-4.5 text-amber-500 opacity-50" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className={`relative h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-all duration-200 cursor-pointer shadow-2xs ${className || ""}`}
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 text-amber-500 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </Button>
  );
}

export default ThemeToggle;

