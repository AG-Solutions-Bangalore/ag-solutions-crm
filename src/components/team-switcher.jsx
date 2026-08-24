import { Building2, ChevronsUpDown, Plus, Sparkles } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams?.[0] || { name: "AG Solutions", logo: Building2, plan: "Enterprise CRM" });

  const LogoIcon = activeTeam.logo || Building2;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all p-2 cursor-pointer"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <LogoIcon className="size-4.5" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-sidebar-foreground">
                  {activeTeam.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {activeTeam.plan || "CRM System"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5 shadow-xl border border-border bg-popover"
            align="start"

            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              Workspaces
            </DropdownMenuLabel>
            {teams.map((team, index) => {
              const TeamIcon = team.logo || Building2;
              const isSelected = activeTeam.name === team.name;
              return (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className={`gap-2.5 p-2 rounded-lg cursor-pointer text-sm font-medium ${isSelected ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <div className="flex size-7 items-center justify-center rounded-md border border-border bg-background shadow-xs">
                    <TeamIcon className="size-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span>{team.name}</span>
                    {team.plan && <span className="text-[10px] text-muted-foreground">{team.plan}</span>}
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="gap-2.5 p-2 rounded-lg cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              <div className="flex size-7 items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
                <Plus className="size-3.5" />
              </div>
              <span className="font-medium">Add workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default TeamSwitcher;
