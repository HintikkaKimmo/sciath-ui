"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Download, Loader2, Shield } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { useTrustCenter } from "@/hooks/use-trust-center";
import { trustCenterDownloadUrl } from "@/services/trust-center";
import type { TrustCenterProduct } from "@/services/trust-center";

const gradeStyles: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 border-emerald-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-amber-100 text-amber-700 border-amber-200",
  D: "bg-orange-100 text-orange-700 border-orange-200",
  F: "bg-red-100 text-red-700 border-red-200",
};

function GradeBadge({ grade }: { grade: string }) {
  const style = gradeStyles[grade] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-lg font-bold tabular-nums ${style}`}
    >
      {grade}
    </span>
  );
}

function ProductCard({
  product,
  slug,
  t,
}: {
  product: TrustCenterProduct;
  slug: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const remaining = product.total_cves - product.suppressed;

  return (
    <div className="bg-card border rounded-md p-4 flex flex-col gap-3">
      <p className="text-sm font-medium">{product.project_name}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <GradeBadge grade={product.grade} />
          <span className="text-xs text-muted-foreground">{t("grade")}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">
            {Math.round(product.score)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm font-medium tabular-nums">
            {product.total_cves}
          </p>
          <p className="text-xs text-muted-foreground">{t("totalCves")}</p>
        </div>
        <div>
          <p className="text-sm font-medium tabular-nums">
            {product.suppressed}
          </p>
          <p className="text-xs text-muted-foreground">{t("suppressed")}</p>
        </div>
        <div>
          <p className="text-sm font-medium tabular-nums">{remaining}</p>
          <p className="text-xs text-muted-foreground">{t("remaining")}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("latestBuild")}: {product.latest_scan_version}
      </p>

      <div className="flex gap-2">
        <a
          href={trustCenterDownloadUrl(slug, product.project_id, "vex_cdx")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border bg-background px-3 h-7 text-xs font-medium hover:bg-secondary/50 transition-colors flex-1"
        >
          <Download className="mr-1 h-3 w-3" />
          {t("downloadVex")}
        </a>
        <a
          href={trustCenterDownloadUrl(slug, product.project_id, "sbom_cdx")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border bg-background px-3 h-7 text-xs font-medium hover:bg-secondary/50 transition-colors flex-1"
        >
          <Download className="mr-1 h-3 w-3" />
          {t("downloadSbom")}
        </a>
      </div>
    </div>
  );
}

export default function TrustCenterPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const t = useTranslations("trustCenter");
  const { data, isLoading, isError, refetch } = useTrustCenter(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Sciath
            </span>
          </div>
          <h1 className="text-3xl font-semibold font-serif">
            {data?.customer_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle", { customer: data?.customer_name ?? "" })}
          </p>
        </header>

        {/* Product cards */}
        {data?.products && data.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((product) => (
              <ProductCard
                key={product.project_id}
                product={product}
                slug={slug}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noProducts")}</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-xs text-muted-foreground">{t("poweredBy")}</p>
        </footer>
      </div>
    </div>
  );
}
