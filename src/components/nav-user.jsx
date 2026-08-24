import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setShowUpdateDialog } from "@/store/auth/versionSlice";
import useAppLogout from "@/utils/logout";
import { ArrowRight, ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const user_position = useSelector((state) => state.auth.user_position);
  const localVersion = useSelector((state) => state.auth?.version);
  const serverVersion = useSelector((state) => state?.version?.version);
  const showDialog = localVersion && serverVersion && localVersion !== serverVersion;
  const dispatch = useDispatch();

  const handleOpenDialog = () => {
    dispatch(
      setShowUpdateDialog({
        showUpdateDialog: true,
        version: serverVersion,
      })
    );
  };

  const handleLogout = useAppLogout();

  const splitUser = user?.name || "Admin";
  const initialsChar = splitUser
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {showDialog ? (
          <div
            className="rounded-xl bg-muted border border-border text-sidebar-foreground px-3 py-2 w-full cursor-pointer transition-all hover:bg-muted/80 mb-2"
            onClick={handleOpenDialog}
          >

            <div className="flex justify-center items-center gap-1.5 text-xs font-medium">
              <span>Update v{serverVersion} available</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all p-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                  {initialsChar}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  {user?.name || "Admin User"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user_position || user?.email || "Administrator"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5 shadow-xl border border-border bg-popover"
            side={isMobile ? "bottom" : "right"}

            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-lg border border-border">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                    {initialsChar}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {user?.name || "Admin"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email || "admin@agsolutions.com"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm">
              <Link to="/settings">
                <Settings className="size-4 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default NavUser;
