"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { usePathname } from "@/i18n/navigation"
import {
  LayoutDashboard,
  Package,
  Search,
  Radio,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navKeys = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/products", icon: Package },
  { key: "findings", href: "/findings", icon: Search },
  { key: "intelligence", href: "/intelligence", icon: Radio },
  { key: "reports", href: "/reports", icon: FileText },
  { key: "settings", href: "/settings", icon: Settings },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { user, logout } = useAuth()
  const t = useTranslations("nav")
  const tc = useTranslations("common")
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?"

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            S
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg tracking-tight">{tc("sciath")}</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navKeys.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const title = t(item.key)
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={title}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-secondary text-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto">
        <Separator className="mb-3" />
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors",
          isCollapsed && "justify-center px-0"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{user?.name ?? user?.email ?? "User"}</p>
              <p className="text-xs text-muted-foreground leading-tight truncate">{user?.email ?? ""}</p>
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center gap-1 mt-2",
          isCollapsed ? "flex-col" : "px-2"
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className={cn(
              "h-8 text-muted-foreground hover:text-foreground",
              isCollapsed ? "w-8 p-0" : "flex-1 justify-start gap-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="text-xs">{tc("signOut")}</span>}
          </Button>
          <SidebarTrigger
            className={cn(
              "h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              isCollapsed ? "w-8 p-0" : "w-8 p-0 ml-auto"
            )}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
