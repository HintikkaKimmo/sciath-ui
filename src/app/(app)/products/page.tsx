"use client";

import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useProjects();

  const projects = data?.items ?? [];
  const filtered = search
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <Plus className="h-3 w-3" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="h-8 pl-8 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading && <TableSkeleton rows={5} cols={6} />}

      {/* Error */}
      {error && (
        <ErrorState
          message="Failed to load products"
          onRetry={() => refetch()}
        />
      )}

      {/* Empty */}
      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          title="No products yet"
          message="Add your first product to start tracking CRA compliance."
        />
      )}

      {/* Products table */}
      {!isLoading && !error && filtered.length > 0 && (
        <>
          <div className="bg-card border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                  <th className="text-left font-medium px-3 py-2">Product</th>
                  <th className="text-left font-medium px-3 py-2">
                    Build System
                  </th>
                  <th className="text-left font-medium px-3 py-2">SoC</th>
                  <th className="text-left font-medium px-3 py-2">Arch</th>
                  <th className="text-right font-medium px-3 py-2">Created</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-secondary/50 group"
                  >
                    <td className="px-3 py-2">
                      <Link href={`/products/${p.id}`} className="block">
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {p.description}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">
                      {p.build_system || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.soc_vendor
                        ? `${p.soc_vendor} ${p.soc_family || ""}`.trim()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                      {p.architecture || "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="pr-2">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground">
            {filtered.length}
            {filtered.length !== projects.length
              ? ` of ${projects.length}`
              : ""}{" "}
            products
          </div>
        </>
      )}
    </div>
  );
}
