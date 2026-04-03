"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Findings", href: "/findings", icon: Search },
  { title: "Intelligence", href: "/intelligence", icon: Radio },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            S
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg tracking-tight">Sciath</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-secondary text-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
        {/* User profile row */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors",
          isCollapsed && "justify-center px-0"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-medium">
              DU
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">Dev User</p>
              <p className="text-xs text-muted-foreground leading-tight truncate">dev@sciath.io</p>
            </div>
          )}
        </div>
        
        {/* Actions row */}
        <div className={cn(
          "flex items-center gap-1 mt-2",
          isCollapsed ? "flex-col" : "px-2"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 text-muted-foreground hover:text-foreground",
              isCollapsed ? "w-8 p-0" : "flex-1 justify-start gap-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="text-xs">Sign out</span>}
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
