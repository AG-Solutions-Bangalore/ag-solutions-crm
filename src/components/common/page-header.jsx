const PageHeader = ({
  icon: IconComponent,
  title = "Page Title",
  description = "Add a description here",
  rightContent = null,
}) => {
  return (
    <div className="rounded-xl p-4 mb-4 border border-border bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {IconComponent && (
            <div className="p-2.5 rounded-lg bg-muted text-foreground flex-shrink-0 border border-border">
              <IconComponent className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

