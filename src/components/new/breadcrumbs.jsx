import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumbs({ onBack }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const formatTitle = (str) => {
    return str
      .replace(/-/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 px-2 py-1 rounded-md transition-colors"
        title="Go back"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>Back</span>
      </button>

      {pathnames.length > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <nav className="flex items-center gap-1.5">
            {pathnames.map((name, index) => {
              const isLast = index === pathnames.length - 1;
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              const formattedName = formatTitle(name);

              return (
                <div key={routeTo} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  )}
                  {isLast ? (
                    <span className="font-semibold text-foreground capitalize">
                      {formattedName}
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="capitalize hover:text-foreground transition-colors"
                    >
                      {formattedName}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

export default Breadcrumbs;
