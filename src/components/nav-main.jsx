import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function NavMain({ items }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLinkClick = () => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop.toString());
    }
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");

    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition, 10);
    }
  }, [location.pathname]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 mb-1">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu
        className="gap-1 relative"
        onMouseLeave={() => setHoveredItem(null)}
      >
        {items.map((item) => {
          const renderItem = (navItem, depth = 0) => {
            const hasSubItems = navItem.items && navItem.items.length > 0;
            const isItemActive =
              location.pathname.toLowerCase() === navItem.url?.toLowerCase() ||
              (navItem.url !== "/dashboard" &&
                navItem.url !== "/" &&
                location.pathname.toLowerCase().startsWith(navItem.url?.toLowerCase()));

            const isParentActive = hasSubItems
              ? navItem.items.some((sub) =>
                  sub.items?.length
                    ? sub.items.some(
                        (deepSub) =>
                          location.pathname.toLowerCase() === deepSub.url?.toLowerCase()
                      )
                    : location.pathname.toLowerCase() === sub.url?.toLowerCase()
                )
              : isItemActive;

            const IconComponent = navItem.icon;
            const isHovered = hoveredItem === navItem.title;

            if (!hasSubItems) {
              return (
                <SidebarMenuItem
                  key={navItem.title}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(navItem.title)}
                >
                  {/* Floating Cursor Follow Pill */}
                  {isHovered && !isItemActive && (
                    <motion.div
                      layoutId="sidebar-hover-pill"
                      className="absolute inset-0 rounded-lg bg-sidebar-accent/80 pointer-events-none z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  <Link
                    to={navItem.url}
                    onClick={handleLinkClick}
                    className="w-full relative z-10 block"
                  >
                    <SidebarMenuButton
                      tooltip={navItem.title}
                      isActive={isItemActive}
                      className={`
                        h-9 w-full rounded-lg px-2.5 font-medium text-xs transition-colors duration-150 relative z-10
                        ${
                          isItemActive
                            ? "!bg-sidebar-primary !text-sidebar-primary-foreground font-semibold shadow-xs hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        }
                      `}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={`size-4 shrink-0 transition-colors ${
                            isItemActive
                              ? "!text-sidebar-primary-foreground stroke-[2.2]"
                              : "text-muted-foreground group-hover:text-sidebar-foreground"
                          }`}
                        />
                      )}
                      <span className="truncate">{navItem.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={navItem.title}
                asChild
                defaultOpen={isParentActive}
                className="group/collapsible relative"
                onMouseEnter={() => setHoveredItem(navItem.title)}
              >
                <SidebarMenuItem className="relative">
                  {isHovered && !isParentActive && (
                    <motion.div
                      layoutId="sidebar-hover-pill"
                      className="absolute inset-0 rounded-lg bg-sidebar-accent/80 pointer-events-none z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={navItem.title}
                      isActive={isParentActive}
                      className={`
                        h-9 w-full rounded-lg px-2.5 font-medium text-xs transition-colors duration-150 relative z-10
                        ${
                          isParentActive
                            ? "!bg-sidebar-accent !text-sidebar-accent-foreground font-semibold"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        }
                      `}
                    >
                      {IconComponent && (
                        <IconComponent className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{navItem.title}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="my-1 ml-4 border-l border-border/70 pl-2.5 gap-1">
                      {navItem.items.map((sub) => renderItem(sub, depth + 1))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          };

          return renderItem(item);
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
