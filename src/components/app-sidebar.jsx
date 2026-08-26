import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Megaphone,
  Newspaper,
  Layers,
  Images,
  Award,
  BookOpen,
  HelpCircle,
  Settings,
  Building2,
  Quote,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    ENQUIRIES: {
      title: "Enquiries",
      url: "/enquiries",
      icon: Inbox,
    },
    PROJECTS: {
      title: "Projects",
      url: "/projects",
      icon: Briefcase,
    },
    CAMPAIGN: {
      title: "Campaign",
      url: "/campaign-visit",
      icon: Megaphone,
    },
    NEWSLEETER: {
      title: "Newsletter",
      url: "/newsLetter",
      icon: Newspaper,
    },
    CATEGORY: {
      title: "Categories",
      url: "/Category-list",
      icon: Layers,
    },
    GALLERY: {
      title: "Gallery",
      url: "/gallery-list",
      icon: Images,
    },
    SPONSAR: {
      title: "Sponsors",
      url: "/Sponsar-list",
      icon: Award,
    },
    BLOG: {
      title: "Blogs",
      url: "/blog-list",
      icon: BookOpen,
    },
    FAQ: {
      title: "FAQ",
      url: "/faq-list",
      icon: HelpCircle,
    },
    TESTIMONIAL: {
      title: "Testimonials",
      url: "/testimonial-list",
      icon: Quote,
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: ["DASHBOARD", "SETTINGS"],
  },
  2: {
    navMain: [
      "DASHBOARD",
      "ENQUIRIES",
      "PROJECTS",
      "CAMPAIGN",
      "NEWSLEETER",
      "CATEGORY",
      "SPONSAR",
      "GALLERY",
      "BLOG",
      "FAQ",
      "TESTIMONIAL",
      "SETTINGS",
    ],
  },
  3: {
    navMain: [
      "DASHBOARD",
      "ENQUIRIES",
      "CAMPAIGN",
      "PROJECTS",
      "NEWSLEETER",
      "CATEGORY",
      "SPONSAR",
      "GALLERY",
      "BLOG",
      "FAQ",
      "TESTIMONIAL",
      "SETTINGS",
    ],
  },
  4: {
    navMain: [
      "DASHBOARD",
      "ENQUIRIES",
      "PROJECTS",
      "CAMPAIGN",
      "NEWSLEETER",
      "CATEGORY",
      "SPONSAR",
      "GALLERY",
      "BLOG",
      "FAQ",
      "TESTIMONIAL",
      "SETTINGS",
    ],
  },
};

const useNavigationData = (userType) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userType] || USER_ROLE_PERMISSIONS[2] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config) => {
      return (permissionKeys || [])
        .map((key) => config[key])
        .filter(Boolean);
    };

    const navMain = buildNavItems(
      permissions?.navMain,
      { ...NAVIGATION_CONFIG.COMMON },
    );

    return { navMain };
  }, [userType]);
};

export function AppSidebar({ ...props }) {
  const [openItem, setOpenItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const TEAMS_CONFIG = useMemo(
    () => [
      {
        name: "AG Solutions",
        logo: Building2,
        plan: "Enterprise CRM",
      },
    ],
    [],
  );

  const user = useSelector((state) => state.auth.user);
  const { navMain } = useNavigationData(user?.user_type);
  const initialData = {
    user: {
      name: user?.name || "Admin",
      email: user?.email || "admin@agsolutions.com",
      avatar: user?.avatar || "",
    },
    teams: TEAMS_CONFIG,
    navMain,
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80" {...props}>
      <SidebarHeader className="p-3">
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>

      <SidebarContent
        className="sidebar-content relative overflow-hidden"
      >
        <div className="relative z-10">
          <NavMain
            items={initialData.navMain}
            openItem={openItem}
            setOpenItem={setOpenItem}
          />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/40">
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };
