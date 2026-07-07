import { LayoutDashboard, GraduationCap, Send, BookOpen, CreditCard, User, GlobeLock, FileText, ShoppingCart, Sun, Building2, CalendarDays } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { key: "common.home", url: "/", icon: LayoutDashboard },
  { key: "common.grants", url: "/grants", icon: GraduationCap },
  { key: "common.summerPrograms", url: "/summer-programs", icon: Sun },
  { key: "common.foundations", url: "/foundations", icon: Building2 },
  { key: "common.telegram", url: "/telegram", icon: Send },
  { key: "common.learning", url: "/learn", icon: BookOpen },
  { key: "common.pricing", url: "/pricing", icon: CreditCard },
];

const bottomItems = [
  { key: "common.profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <GlobeLock className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-sidebar-accent-foreground tracking-tight">
              GrantPath
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems
                .filter((item) => item.url !== "/learn" || isLoggedIn)
                .map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{t(item.key)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {user?.role === "admin" && (
                <>
                  <div className={`px-2 py-2 ${!collapsed ? "mt-4 pt-4 border-t border-sidebar-border" : ""}`}>
                    {!collapsed && <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Admin Tools</p>}
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/pricing")}>
                      <NavLink to="/admin/pricing" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Pricing</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/telegram")}>
                      <NavLink to="/admin/telegram" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <Send className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Telegram Posts</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/learning")}>
                      <NavLink to="/admin/learning" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <BookOpen className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Learning</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/calendar")}>
                      <NavLink to="/admin/calendar" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{t("admin.manageCalendar")}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/orders")}>
                      <NavLink to="/admin/orders" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Orders</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/mentors")}>
                      <NavLink to="/admin/mentors" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Mentors</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                      <NavLink to="/admin/users" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <User className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Users</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Submissions removed from Admin/Mentor panels per policy */}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{t(item.key)}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
