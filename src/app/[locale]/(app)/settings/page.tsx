"use client";

import Link from "next/link";
import { User, Key, Users, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const sections = [
  {
    title: "Team Members",
    desc: "Manage who has access to your organization",
    href: "/settings/team",
    icon: Users,
  },
  {
    title: "API Keys",
    desc: "Manage API keys for CLI and CI/CD integrations",
    href: "/settings/api-keys",
    icon: Key,
  },
  {
    title: "Filter Policies",
    desc: "Configure custom VEX filter rules",
    href: "/settings/filters",
    icon: Filter,
  },
];

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold font-serif">Settings</h1>

      {/* Profile */}
      <div className="bg-card border rounded-md p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <User className="h-5 w-5" />
          </div>
          {isLoading ? (
            <div className="space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email ?? ""} · {user?.role ?? ""}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              Display name
            </label>
            <Input
              defaultValue={user?.name ?? ""}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input
              defaultValue={user?.email ?? ""}
              className="h-8 text-sm"
              disabled
            />
          </div>
        </div>

        <Button size="sm" className="h-7 text-xs">
          Save Changes
        </Button>
      </div>

      {/* Section links */}
      <div className="space-y-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center justify-between bg-card border rounded-md p-3 hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
